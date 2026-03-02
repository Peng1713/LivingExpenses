import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Card, Collapse, DatePicker, Divider, Input, Modal, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useBills } from '../app/state/useBills'
import { BILL_CATEGORIES, categoryLabel, type BillCategoryKey } from '../domain/categories'
import { BillForm } from '../features/bills/BillForm'
import type { BillFormValues } from '../features/bills/billFormTypes'

export function BillsPage() {
  const { bills, loading, addBill, updateBill, removeBill } = useBills()

  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [category, setCategory] = useState<BillCategoryKey | 'all'>('all')
  const [keyword, setKeyword] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const editingBill = useMemo(() => bills.find((b) => b.id === editingId) ?? null, [bills, editingId])

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return bills.filter((b) => {
      if (category !== 'all' && b.category !== category) return false
      if (range) {
        const d = dayjs(b.occurredAt)
        if (d.isBefore(range[0].startOf('day')) || d.isAfter(range[1].endOf('day'))) return false
      }
      if (kw) {
        const note = (b.note ?? '').toLowerCase()
        if (!note.includes(kw)) return false
      }
      return true
    })
  }, [bills, category, keyword, range])

  const total = useMemo(() => filtered.reduce((s, b) => s + b.amount, 0), [filtered])

  const groupedByDay = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const b of filtered) {
      const key = dayjs(b.occurredAt).format('YYYY-MM-DD')
      const arr = map.get(key)
      if (arr) arr.push(b)
      else map.set(key, [b])
    }
    return Array.from(map.entries()).map(([date, bills]) => ({
      date,
      bills,
      total: bills.reduce((s, b) => s + b.amount, 0),
    }))
  }, [filtered])

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          今日记账
        </Typography.Title>
        <BillForm
          onSubmit={async (v: BillFormValues) => {
            const occurredAt = v.date
              .hour(v.time.hour())
              .minute(v.time.minute())
              .second(0)
              .millisecond(0)
              .toISOString()
            await addBill({
              occurredAt,
              amount: v.amount,
              category: v.category,
              note: v.note,
            })
          }}
        />
      </Card>
      <Card>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          账单列表
        </Typography.Title>
        <Space wrap style={{ width: '100%' }}>
          <DatePicker.RangePicker
            value={range}
            onChange={(v) => setRange(v && v[0] && v[1] ? [v[0], v[1]] : null)}
          />
          <Select
            style={{ width: 160 }}
            value={category}
            onChange={setCategory}
            options={[
              { value: 'all', label: '全部分类' },
              ...BILL_CATEGORIES.map((c) => ({ value: c.key, label: c.label })),
            ]}
          />
          <Input
            style={{ width: 220 }}
            placeholder="按备注搜索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
          />
          <Typography.Text type="secondary">
            共 {filtered.length} 笔，合计 <Typography.Text strong>¥ {total.toFixed(2)}</Typography.Text>
          </Typography.Text>
          <Button
            onClick={() => {
              setRange(null)
              setCategory('all')
              setKeyword('')
            }}
          >
            清除筛选
          </Button>
        </Space>

        <Divider style={{ margin: '12px 0' }} />

        <Collapse
          items={groupedByDay.map((g) => ({
            key: g.date,
            label: (
              <Space>
                <Typography.Text strong>{g.date}</Typography.Text>
                <Tag color="blue">¥ {g.total.toFixed(2)}</Tag>
                <Typography.Text type="secondary">{g.bills.length} 笔</Typography.Text>
              </Space>
            ),
            children: (
              <Table
                size="small"
                pagination={false}
                rowKey="id"
                loading={loading}
                dataSource={g.bills}
                columns={[
                  {
                    title: '时间',
                    dataIndex: 'occurredAt',
                    width: 90,
                    render: (v: string) => dayjs(v).format('HH:mm'),
                  },
                  {
                    title: '分类',
                    dataIndex: 'category',
                    width: 120,
                    render: (v: BillCategoryKey) => <Tag>{categoryLabel(v)}</Tag>,
                  },
                  {
                    title: '金额',
                    dataIndex: 'amount',
                    width: 120,
                    align: 'right' as const,
                    render: (v: number) => <Typography.Text strong>¥ {v.toFixed(2)}</Typography.Text>,
                  },
                  { title: '备注', dataIndex: 'note', ellipsis: true },
                  {
                    title: '操作',
                    width: 120,
                    render: (_, record) => (
                      <Space>
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => setEditingId(record.id)}
                        />
                        <Popconfirm
                          title="删除这笔账单？"
                          okText="删除"
                          cancelText="取消"
                          onConfirm={() => removeBill(record.id)}
                        >
                          <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </Space>
                    ),
                  },
                ]}
              />
            ),
          }))}
        />
      </Card>

      <Modal
        open={!!editingBill}
        title="编辑账单"
        onCancel={() => setEditingId(null)}
        footer={null}
        destroyOnClose
      >
        {editingBill ? (
          <BillForm
            submitText="保存"
            initial={{
              date: dayjs(editingBill.occurredAt),
              time: dayjs(editingBill.occurredAt),
              category: editingBill.category,
              amount: editingBill.amount,
              note: editingBill.note,
            }}
            onSubmit={async (v) => {
              const occurredAt = v.date
                .hour(v.time.hour())
                .minute(v.time.minute())
                .second(0)
                .millisecond(0)
                .toISOString()
              await updateBill(editingBill.id, {
                occurredAt,
                amount: v.amount,
                category: v.category,
                note: v.note,
              })
              setEditingId(null)
            }}
          />
        ) : null}
      </Modal>
    </Space>
  )
}

