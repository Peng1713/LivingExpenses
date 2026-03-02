import { Pie, Line, Column } from '@ant-design/charts'
import { Card, DatePicker, Empty, Space, Statistic, Typography } from 'antd'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useBills } from '../app/state/useBills'
import { BILL_CATEGORIES, categoryLabel, type BillCategoryKey } from '../domain/categories'
import { isInMonth, sumAmount, sumByCategory, sumByDay } from '../utils/aggregations'

export function StatsPage() {
  const { bills } = useBills()
  const [month, setMonth] = useState(() => dayjs())

  const monthBills = useMemo(() => bills.filter((b) => isInMonth(b.occurredAt, month)), [bills, month])
  const total = useMemo(() => sumAmount(monthBills), [monthBills])
  const byCategory = useMemo(() => sumByCategory(monthBills), [monthBills])
  const byDay = useMemo(() => sumByDay(monthBills), [monthBills])

  const pieData = useMemo(() => {
    const map = new Map<BillCategoryKey, number>()
    for (const c of BILL_CATEGORIES) map.set(c.key, 0)
    for (const row of byCategory) map.set(row.category, (map.get(row.category) ?? 0) + row.value)
    return Array.from(map.entries())
      .map(([category, value]) => ({ category: categoryLabel(category), value }))
      .filter((x) => x.value > 0)
  }, [byCategory])

  const dailyData = useMemo(() => byDay.map((d) => ({ date: d.date, value: d.value })), [byDay])

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space wrap>
            <Typography.Title level={5} style={{ margin: 0 }}>
              月度统计
            </Typography.Title>
            <DatePicker
              picker="month"
              allowClear={false}
              value={month}
              onChange={(v) => v && setMonth(v)}
            />
          </Space>
          <Space wrap>
            <Statistic title="本月支出" value={total} precision={2} prefix="¥" />
            <Statistic title="记账笔数" value={monthBills.length} />
          </Space>
        </Space>
      </Card>

      <Card>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          按分类占比
        </Typography.Title>
        {pieData.length === 0 ? (
          <Empty description="本月暂无数据" />
        ) : (
          <Pie
            data={pieData}
            angleField="value"
            colorField="category"
            radius={0.9}
            innerRadius={0.55}
            label={{ type: 'spider' }}
            legend={{ position: 'bottom' }}
          />
        )}
      </Card>

      <Card>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          每日支出趋势
        </Typography.Title>
        {dailyData.length === 0 ? (
          <Empty description="本月暂无数据" />
        ) : (
          <Line
            data={dailyData}
            xField="date"
            yField="value"
            height={260}
            tooltip={{ showMarkers: true }}
            point={{ size: 3, shape: 'circle' }}
          />
        )}
      </Card>

      <Card>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          分类支出柱状图
        </Typography.Title>
        {pieData.length === 0 ? (
          <Empty description="本月暂无数据" />
        ) : (
          <Column
            data={[...pieData].sort((a, b) => b.value - a.value)}
            xField="category"
            yField="value"
            height={260}
            label={{ position: 'top' }}
          />
        )}
      </Card>
    </Space>
  )
}

