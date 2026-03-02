import { Area, Column } from '@ant-design/charts'
import { Card, DatePicker, Empty, Space, Statistic, Table, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useBills } from '../app/state/useBills'
import { categoryLabel, type BillCategoryKey } from '../domain/categories'
import { sumAmount, sumByCategory, sumByDay } from '../utils/aggregations'

export function AnalysisPage() {
  const { bills } = useBills()
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>(() => [
    dayjs().subtract(29, 'day').startOf('day'),
    dayjs().endOf('day'),
  ])

  const filtered = useMemo(() => {
    const [start, end] = range
    return bills.filter((b) => {
      const d = dayjs(b.occurredAt)
      return !d.isBefore(start) && !d.isAfter(end)
    })
  }, [bills, range])

  const total = useMemo(() => sumAmount(filtered), [filtered])
  const byDay = useMemo(() => sumByDay(filtered), [filtered])
  const byCategory = useMemo(() => sumByCategory(filtered).sort((a, b) => b.value - a.value), [filtered])
  const topBills = useMemo(() => [...filtered].sort((a, b) => b.amount - a.amount).slice(0, 10), [filtered])

  const anomalies = useMemo(() => {
    const values = byDay.map((d) => d.value).filter((v) => v > 0)
    if (values.length < 7) return []
    const mean = values.reduce((s, v) => s + v, 0) / values.length
    const variance = values.reduce((s, v) => s + (v - mean) * (v - mean), 0) / values.length
    const std = Math.sqrt(variance)
    const threshold = mean + 2 * std
    return byDay
      .filter((d) => d.value > threshold)
      .map((d) => ({ ...d, threshold, mean, std }))
      .sort((a, b) => b.value - a.value)
  }, [byDay])

  const trendData = useMemo(() => byDay.map((d) => ({ date: d.date, value: d.value })), [byDay])
  const categoryBarData = useMemo(
    () =>
      byCategory
        .filter((x) => x.value > 0)
        .slice(0, 8)
        .map((x) => ({ category: categoryLabel(x.category), value: x.value })),
    [byCategory],
  )

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space wrap>
            <Typography.Title level={5} style={{ margin: 0 }}>
              分析区间
            </Typography.Title>
            <DatePicker.RangePicker
              allowClear={false}
              value={range}
              onChange={(v) => v && v[0] && v[1] && setRange([v[0].startOf('day'), v[1].endOf('day')])}
            />
          </Space>
          <Space wrap>
            <Statistic title="区间支出" value={total} precision={2} prefix="¥" />
            <Statistic title="记账笔数" value={filtered.length} />
          </Space>
        </Space>
      </Card>

      <Card>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          支出趋势（按天）
        </Typography.Title>
        {trendData.length === 0 ? (
          <Empty description="区间暂无数据" />
        ) : (
          <Area data={trendData} xField="date" yField="value" height={260} />
        )}
      </Card>

      <Card>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          Top 分类（前 8）
        </Typography.Title>
        {categoryBarData.length === 0 ? (
          <Empty description="区间暂无数据" />
        ) : (
          <Column data={categoryBarData} xField="category" yField="value" height={260} label={{ position: 'top' }} />
        )}
      </Card>

      <Card>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          异常日提示（相对自身波动）
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: -4 }}>
          规则：日支出 &gt; 平均值 + 2×标准差（仅用于自我回顾，不代表错误）。
        </Typography.Paragraph>
        {anomalies.length === 0 ? (
          <Empty description="未发现明显异常日（或数据不足）" />
        ) : (
          <Table
            size="small"
            pagination={false}
            rowKey="date"
            dataSource={anomalies}
            columns={[
              { title: '日期', dataIndex: 'date', width: 120 },
              {
                title: '支出',
                dataIndex: 'value',
                width: 140,
                render: (v: number) => <Typography.Text strong>¥ {v.toFixed(2)}</Typography.Text>,
              },
              {
                title: '阈值',
                dataIndex: 'threshold',
                width: 140,
                render: (v: number) => <Tag color="orange">¥ {v.toFixed(2)}</Tag>,
              },
            ]}
          />
        )}
      </Card>

      <Card>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          Top 单笔（前 10）
        </Typography.Title>
        {topBills.length === 0 ? (
          <Empty description="区间暂无数据" />
        ) : (
          <Table
            size="small"
            rowKey="id"
            pagination={false}
            dataSource={topBills}
            columns={[
              {
                title: '日期',
                dataIndex: 'occurredAt',
                width: 120,
                render: (v: string) => dayjs(v).format('YYYY-MM-DD'),
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
                width: 140,
                align: 'right' as const,
                render: (v: number) => <Typography.Text strong>¥ {v.toFixed(2)}</Typography.Text>,
              },
              { title: '备注', dataIndex: 'note', ellipsis: true },
            ]}
          />
        )}
      </Card>
    </Space>
  )
}

