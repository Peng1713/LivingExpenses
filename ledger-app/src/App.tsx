import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Collapse,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import type { TableColumnsType } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import ReactECharts from 'echarts-for-react'
import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'living-expenses-records-v1'

const CATEGORY_OPTIONS = [
  { label: '日用品', value: '日用品', color: 'blue' },
  { label: '生活娱乐', value: '生活娱乐', color: 'purple' },
  { label: '出行交通', value: '出行交通', color: 'orange' },
  { label: '餐饮', value: '餐饮', color: 'volcano' },
  { label: '居家水电', value: '居家水电', color: 'cyan' },
  { label: '学习成长', value: '学习成长', color: 'geekblue' },
  { label: '医疗健康', value: '医疗健康', color: 'magenta' },
  { label: '其他', value: '其他', color: 'default' },
]

interface BillRecord {
  id: string
  item: string
  amount: number
  category: string
  spentAt: string
  note?: string
  createdAt: string
}

interface BillFormValues {
  item: string
  amount: number
  category: string
  spentAt: Dayjs
  note?: string
}

const sortRecordsByTimeDesc = (records: BillRecord[]) =>
  [...records].sort((a, b) => dayjs(b.spentAt).valueOf() - dayjs(a.spentAt).valueOf())

const isBillRecord = (value: unknown): value is BillRecord => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<BillRecord>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.item === 'string' &&
    typeof candidate.amount === 'number' &&
    Number.isFinite(candidate.amount) &&
    typeof candidate.category === 'string' &&
    typeof candidate.spentAt === 'string' &&
    typeof candidate.createdAt === 'string'
  )
}

const loadRecordsFromLocal = (): BillRecord[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return sortRecordsByTimeDesc(parsed.filter(isBillRecord))
  } catch {
    return []
  }
}

const createRecordId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const getCategoryColor = (category: string): string =>
  CATEGORY_OPTIONS.find((option) => option.value === category)?.color ?? 'default'

function App() {
  const { RangePicker } = DatePicker
  const [createForm] = Form.useForm<BillFormValues>()
  const [editForm] = Form.useForm<BillFormValues>()
  const [records, setRecords] = useState<BillRecord[]>(() => loadRecordsFromLocal())
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [analysisRange, setAnalysisRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('day'),
  ])
  const [editingRecord, setEditingRecord] = useState<BillRecord | null>(null)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }, [records])

  const totalAmount = useMemo(
    () => records.reduce((sum, record) => sum + record.amount, 0),
    [records],
  )
  const todayAmount = useMemo(
    () =>
      records
        .filter((record) => dayjs(record.spentAt).isSame(dayjs(), 'day'))
        .reduce((sum, record) => sum + record.amount, 0),
    [records],
  )
  const monthAmount = useMemo(
    () =>
      records
        .filter((record) => dayjs(record.spentAt).isSame(dayjs(), 'month'))
        .reduce((sum, record) => sum + record.amount, 0),
    [records],
  )

  const filteredRecords = useMemo(() => {
    if (!selectedDate) {
      return records
    }

    return records.filter((record) => dayjs(record.spentAt).isSame(selectedDate, 'day'))
  }, [records, selectedDate])

  const groupedRecords = useMemo(() => {
    const groupedMap = new Map<string, BillRecord[]>()

    filteredRecords.forEach((record) => {
      const dateKey = dayjs(record.spentAt).format('YYYY-MM-DD')
      const list = groupedMap.get(dateKey) ?? []
      list.push(record)
      groupedMap.set(dateKey, list)
    })

    return Array.from(groupedMap.entries())
      .sort((a, b) => dayjs(b[0]).valueOf() - dayjs(a[0]).valueOf())
      .map(([date, items]) => ({
        date,
        items,
        total: items.reduce((sum, item) => sum + item.amount, 0),
      }))
  }, [filteredRecords])

  const analysisRecords = useMemo(() => {
    const [start, end] = analysisRange
    const startTime = start.startOf('day').valueOf()
    const endTime = end.endOf('day').valueOf()

    return records.filter((record) => {
      const targetTime = dayjs(record.spentAt).valueOf()
      return targetTime >= startTime && targetTime <= endTime
    })
  }, [analysisRange, records])

  const categoryStats = useMemo(() => {
    const summaryMap = new Map<string, { category: string; amount: number; count: number }>()

    analysisRecords.forEach((record) => {
      const current = summaryMap.get(record.category)
      if (current) {
        current.amount += record.amount
        current.count += 1
        return
      }

      summaryMap.set(record.category, {
        category: record.category,
        amount: record.amount,
        count: 1,
      })
    })

    return Array.from(summaryMap.values()).sort((a, b) => b.amount - a.amount)
  }, [analysisRecords])

  const trendData = useMemo(() => {
    const trendMap = new Map<string, number>()

    analysisRecords.forEach((record) => {
      const dateKey = dayjs(record.spentAt).format('YYYY-MM-DD')
      trendMap.set(dateKey, (trendMap.get(dateKey) ?? 0) + record.amount)
    })

    return Array.from(trendMap.entries())
      .sort((a, b) => dayjs(a[0]).valueOf() - dayjs(b[0]).valueOf())
      .map(([date, total]) => ({
        date,
        label: dayjs(date).format('MM-DD'),
        total: Number(total.toFixed(2)),
      }))
  }, [analysisRecords])

  const analysisSummary = useMemo(() => {
    const total = analysisRecords.reduce((sum, item) => sum + item.amount, 0)
    const dailyTotalMap = new Map<string, number>()

    analysisRecords.forEach((record) => {
      const dateKey = dayjs(record.spentAt).format('YYYY-MM-DD')
      dailyTotalMap.set(dateKey, (dailyTotalMap.get(dateKey) ?? 0) + record.amount)
    })

    const topDay = Array.from(dailyTotalMap.entries()).sort((a, b) => b[1] - a[1])[0]
    const averagePerDay = dailyTotalMap.size === 0 ? 0 : total / dailyTotalMap.size

    return {
      total,
      averagePerDay,
      topDayLabel: topDay ? dayjs(topDay[0]).format('YYYY年MM月DD日') : '-',
      topDayAmount: topDay ? topDay[1] : 0,
      topCategory: categoryStats[0]?.category ?? '-',
      topCategoryAmount: categoryStats[0]?.amount ?? 0,
    }
  }, [analysisRecords, categoryStats])

  const pieOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'item',
        formatter: (params: { name: string; value: number; percent: number }) =>
          `${params.name}<br/>¥${Number(params.value).toFixed(2)} (${params.percent}%)`,
      },
      legend: {
        bottom: 0,
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
          },
          data: categoryStats.map((item) => ({
            name: item.category,
            value: Number(item.amount.toFixed(2)),
          })),
        },
      ],
    }),
    [categoryStats],
  )

  const trendOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: trendData.map((item) => item.label),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '每日支出',
          type: 'line',
          smooth: true,
          data: trendData.map((item) => item.total),
          areaStyle: {},
        },
      ],
      grid: {
        left: 20,
        right: 20,
        bottom: 35,
        top: 20,
        containLabel: true,
      },
    }),
    [trendData],
  )

  const handleCreateRecord = (values: BillFormValues) => {
    const nextRecord: BillRecord = {
      id: createRecordId(),
      item: values.item.trim(),
      amount: values.amount,
      category: values.category,
      spentAt: values.spentAt.toISOString(),
      note: values.note?.trim() || undefined,
      createdAt: dayjs().toISOString(),
    }

    setRecords((prev) => sortRecordsByTimeDesc([nextRecord, ...prev]))
    createForm.resetFields()
    message.success('账单已保存')
  }

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id))
    message.success('账单已删除')
  }

  const handleOpenEdit = (record: BillRecord) => {
    setEditingRecord(record)
    editForm.setFieldsValue({
      item: record.item,
      amount: record.amount,
      category: record.category,
      spentAt: dayjs(record.spentAt),
      note: record.note,
    })
  }

  const handleCloseEdit = () => {
    setEditingRecord(null)
    editForm.resetFields()
  }

  const handleSaveEdit = async () => {
    try {
      const values = await editForm.validateFields()
      if (!editingRecord) {
        return
      }

      const nextRecord: BillRecord = {
        ...editingRecord,
        item: values.item.trim(),
        amount: values.amount,
        category: values.category,
        spentAt: values.spentAt.toISOString(),
        note: values.note?.trim() || undefined,
      }

      setRecords((prev) =>
        sortRecordsByTimeDesc(
          prev.map((record) => (record.id === editingRecord.id ? nextRecord : record)),
        ),
      )
      handleCloseEdit()
      message.success('账单已更新')
    } catch {
      // 表单校验失败时不执行更新
    }
  }

  const columns: TableColumnsType<BillRecord> = [
    {
      title: '时间',
      dataIndex: 'spentAt',
      key: 'spentAt',
      width: 110,
      render: (value: string) => dayjs(value).format('HH:mm'),
    },
    {
      title: '内容',
      dataIndex: 'item',
      key: 'item',
      width: 180,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (value: string) => <Tag color={getCategoryColor(value)}>{value}</Tag>,
    },
    {
      title: '金额(元)',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 120,
      render: (value: number) => <span className="amount-cell">¥{value.toFixed(2)}</span>,
    },
    {
      title: '备注',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (value?: string) => value || <span className="muted-text">-</span>,
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          <Popconfirm
            title="删除账单"
            description="确认删除这条记录吗？"
            okText="删除"
            cancelText="取消"
            onConfirm={() => handleDeleteRecord(record.id)}
          >
            <Button danger type="text" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const collapseItems = groupedRecords.map((group) => ({
    key: group.date,
    label: (
      <div className="day-row-header">
        <span className="day-label">{dayjs(group.date).format('YYYY年MM月DD日')}</span>
        <Tag color="processing">{group.items.length} 笔</Tag>
        <span className="day-total">合计 ¥{group.total.toFixed(2)}</span>
      </div>
    ),
    children: (
      <Table<BillRecord>
        rowKey="id"
        className="bill-table"
        columns={columns}
        dataSource={group.items}
        pagination={false}
        size="small"
        scroll={{ x: 760 }}
      />
    ),
  }))

  return (
    <div className="page-container">
      <Typography.Title className="page-title" level={2}>
        日常生活账单管理
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        本项目仅使用浏览器本地存储（localStorage），不需要部署后端服务。
      </Typography.Paragraph>

      <Row gutter={[16, 16]} className="summary-row">
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic title="累计支出" value={totalAmount} precision={2} prefix="¥" />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic title="今日支出" value={todayAmount} precision={2} prefix="¥" />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic title="本月支出" value={monthAmount} precision={2} prefix="¥" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="新增账单" className="full-height-card">
            <Form<BillFormValues>
              layout="vertical"
              form={createForm}
              initialValues={{
                category: CATEGORY_OPTIONS[0].value,
                spentAt: dayjs(),
              }}
              onFinish={handleCreateRecord}
            >
              <Form.Item
                label="账单内容"
                name="item"
                rules={[
                  { required: true, message: '请输入内容' },
                  { min: 1, max: 40, message: '内容长度应在 1-40 个字符内' },
                ]}
              >
                <Input placeholder="例如：超市购物、奶茶、地铁等" />
              </Form.Item>

              <Form.Item
                label="金额（元）"
                name="amount"
                rules={[
                  { required: true, message: '请输入金额' },
                  { type: 'number', min: 0.01, message: '金额需大于 0' },
                ]}
              >
                <InputNumber min={0.01} precision={2} step={1} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item label="分类" name="category" rules={[{ required: true, message: '请选择分类' }]}>
                <Select options={CATEGORY_OPTIONS} />
              </Form.Item>

              <Form.Item label="消费时间" name="spentAt" rules={[{ required: true, message: '请选择消费时间' }]}>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item label="备注" name="note">
                <Input.TextArea rows={3} placeholder="可选" maxLength={120} showCount />
              </Form.Item>

              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} block>
                保存账单
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title="账单明细（按天区分）"
            extra={
              <Space wrap>
                <DatePicker
                  allowClear
                  value={selectedDate}
                  onChange={(value) => setSelectedDate(value)}
                  placeholder="筛选某一天"
                />
                <Button onClick={() => setSelectedDate(null)}>查看全部</Button>
              </Space>
            }
          >
            {collapseItems.length === 0 ? (
              <Empty description="暂无账单记录" />
            ) : (
              <Collapse
                items={collapseItems}
                defaultActiveKey={collapseItems.slice(0, 2).map((item) => item.key)}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Card
        className="analysis-card"
        title="统计与分析"
        extra={
          <Space wrap>
            <span>分析区间：</span>
            <RangePicker
              allowClear={false}
              value={analysisRange}
              onChange={(values) => {
                if (!values) {
                  return
                }

                const [start, end] = values
                if (!start || !end) {
                  return
                }
                setAnalysisRange([start, end])
              }}
            />
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Card size="small">
              <Statistic title="区间总支出" value={analysisSummary.total} precision={2} prefix="¥" />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card size="small">
              <Statistic title="日均支出" value={analysisSummary.averagePerDay} precision={2} prefix="¥" />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card size="small">
              <Statistic
                title="最高分类"
                value={analysisSummary.topCategory}
                suffix={
                  analysisSummary.topCategory !== '-'
                    ? `(¥${analysisSummary.topCategoryAmount.toFixed(2)})`
                    : ''
                }
              />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card size="small">
              <Statistic
                title="最高支出日"
                value={analysisSummary.topDayLabel}
                suffix={
                  analysisSummary.topDayLabel !== '-' ? `(¥${analysisSummary.topDayAmount.toFixed(2)})` : ''
                }
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="chart-row">
          <Col xs={24} xl={12}>
            <Card size="small" title="分类占比">
              {categoryStats.length === 0 ? (
                <Empty description="当前区间暂无可分析数据" />
              ) : (
                <ReactECharts option={pieOption} style={{ height: 320 }} />
              )}
            </Card>
          </Col>
          <Col xs={24} xl={12}>
            <Card size="small" title="每日支出趋势">
              {trendData.length === 0 ? (
                <Empty description="当前区间暂无可分析数据" />
              ) : (
                <ReactECharts option={trendOption} style={{ height: 320 }} />
              )}
            </Card>
          </Col>
        </Row>

        <Card className="insight-card" size="small" title="分析结论">
          <ul className="insight-list">
            <li>
              当前区间共记录 <strong>{analysisRecords.length}</strong> 笔账单，累计支出{' '}
              <strong>¥{analysisSummary.total.toFixed(2)}</strong>。
            </li>
            <li>
              支出最高分类为 <strong>{analysisSummary.topCategory}</strong>，金额{' '}
              <strong>¥{analysisSummary.topCategoryAmount.toFixed(2)}</strong>。
            </li>
            <li>
              支出峰值日期：<strong>{analysisSummary.topDayLabel}</strong>，当日支出{' '}
              <strong>¥{analysisSummary.topDayAmount.toFixed(2)}</strong>。
            </li>
          </ul>
        </Card>
      </Card>

      <Modal
        title="编辑账单"
        open={Boolean(editingRecord)}
        destroyOnHidden
        okText="保存"
        cancelText="取消"
        onCancel={handleCloseEdit}
        onOk={handleSaveEdit}
      >
        <Form<BillFormValues> layout="vertical" form={editForm}>
          <Form.Item
            label="账单内容"
            name="item"
            rules={[
              { required: true, message: '请输入内容' },
              { min: 1, max: 40, message: '内容长度应在 1-40 个字符内' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="金额（元）"
            name="amount"
            rules={[
              { required: true, message: '请输入金额' },
              { type: 'number', min: 0.01, message: '金额需大于 0' },
            ]}
          >
            <InputNumber min={0.01} precision={2} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="分类" name="category" rules={[{ required: true, message: '请选择分类' }]}>
            <Select options={CATEGORY_OPTIONS} />
          </Form.Item>

          <Form.Item label="消费时间" name="spentAt" rules={[{ required: true, message: '请选择消费时间' }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="备注" name="note">
            <Input.TextArea rows={3} maxLength={120} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default App
