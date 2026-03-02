import { useMemo, useState } from 'react';
import { Card, DatePicker, Row, Col, Statistic, Typography, Table, Empty, Flex, Segmented } from 'antd';
import {
  PieChartOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { Pie, Column } from '@ant-design/charts';
import dayjs, { Dayjs } from 'dayjs';
import { useBillStore } from '../store/useBillStore';
import { CATEGORY_MAP, type CategoryType } from '../types';
import CategoryTag from '../components/CategoryTag';

const { Title, Text } = Typography;

export default function Statistics() {
  const { bills } = useBillStore();
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
  const [viewMode, setViewMode] = useState<string>('month');

  const filteredBills = useMemo(() => {
    if (viewMode === 'month') {
      const ym = selectedMonth.format('YYYY-MM');
      return bills.filter((b) => b.date.startsWith(ym));
    }
    const y = selectedMonth.format('YYYY');
    return bills.filter((b) => b.date.startsWith(y));
  }, [bills, selectedMonth, viewMode]);

  const totalAmount = useMemo(
    () => filteredBills.reduce((s, b) => s + b.amount, 0),
    [filteredBills]
  );

  const dailyAvg = useMemo(() => {
    if (filteredBills.length === 0) return 0;
    const days = new Set(filteredBills.map((b) => b.date)).size;
    return totalAmount / days;
  }, [filteredBills, totalAmount]);

  const categoryData = useMemo(() => {
    const map = new Map<CategoryType, number>();
    for (const b of filteredBills) {
      map.set(b.category, (map.get(b.category) ?? 0) + b.amount);
    }
    return Array.from(map.entries())
      .map(([key, value]) => ({
        category: key,
        label: CATEGORY_MAP[key]?.label ?? key,
        amount: Math.round(value * 100) / 100,
        color: CATEGORY_MAP[key]?.color,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredBills]);

  const dailyTrend = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of filteredBills) {
      map.set(b.date, (map.get(b.date) ?? 0) + b.amount);
    }
    return Array.from(map.entries())
      .map(([date, amount]) => ({
        date: dayjs(date).format('MM-DD'),
        amount: Math.round(amount * 100) / 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredBills]);

  const maxDay = useMemo(() => {
    if (dailyTrend.length === 0) return { date: '-', amount: 0 };
    return dailyTrend.reduce((max, d) => (d.amount > max.amount ? d : max));
  }, [dailyTrend]);

  const minDay = useMemo(() => {
    if (dailyTrend.length === 0) return { date: '-', amount: 0 };
    return dailyTrend.reduce((min, d) => (d.amount < min.amount ? d : min));
  }, [dailyTrend]);

  const pieConfig = {
    data: categoryData,
    angleField: 'amount',
    colorField: 'label',
    innerRadius: 0.6,
    label: {
      text: (d: { label: string; amount: number }) => `${d.label}\n¥${d.amount}`,
      style: { fontSize: 12 },
    },
    legend: { color: { position: 'bottom' as const, layout: { justifyContent: 'center' as const } } },
    tooltip: {
      title: 'label',
      items: [{ field: 'amount', name: '金额', valueFormatter: (v: number) => `¥${v.toFixed(2)}` }],
    },
    style: { stroke: '#fff', lineWidth: 2 },
    height: 350,
  };

  const columnConfig = {
    data: dailyTrend,
    xField: 'date',
    yField: 'amount',
    color: '#667eea',
    label: {
      text: (d: { amount: number }) => `¥${d.amount}`,
      textBaseline: 'bottom' as const,
      style: { fontSize: 10 },
    },
    tooltip: {
      items: [{ field: 'amount', name: '支出', valueFormatter: (v: number) => `¥${v.toFixed(2)}` }],
    },
    axis: {
      y: { labelFormatter: (v: number) => `¥${v}` },
    },
    height: 350,
  };

  const tableColumns = [
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (cat: CategoryType) => <CategoryTag category={cat} />,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a: { amount: number }, b: { amount: number }) => a.amount - b.amount,
      render: (v: number) => <Text strong style={{ color: '#f5222d' }}>¥{v.toFixed(2)}</Text>,
    },
    {
      title: '占比',
      dataIndex: 'amount',
      key: 'percent',
      render: (v: number) => (
        <Text>{totalAmount > 0 ? ((v / totalAmount) * 100).toFixed(1) : 0}%</Text>
      ),
    },
    {
      title: '笔数',
      key: 'count',
      render: (_: unknown, record: { category: CategoryType }) =>
        filteredBills.filter((b) => b.category === record.category).length,
    },
  ];

  const periodLabel = viewMode === 'month' ? selectedMonth.format('YYYY年MM月') : selectedMonth.format('YYYY年');

  return (
    <div>
      <Flex justify="space-between" align="center" wrap="wrap" gap={16} style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <PieChartOutlined style={{ marginRight: 8 }} />
          统计分析
        </Title>
        <Flex gap={12} align="center">
          <Segmented
            value={viewMode}
            onChange={(v) => setViewMode(v as string)}
            options={[
              { label: '按月', value: 'month' },
              { label: '按年', value: 'year' },
            ]}
          />
          <DatePicker
            picker={viewMode === 'month' ? 'month' : 'year'}
            value={selectedMonth}
            onChange={(v) => v && setSelectedMonth(v)}
            allowClear={false}
          />
        </Flex>
      </Flex>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic title={`${periodLabel} 总支出`} value={totalAmount} precision={2} prefix="¥" valueStyle={{ color: '#f5222d' }} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic title="日均支出" value={dailyAvg} precision={2} prefix="¥" valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="最高日消费"
              value={maxDay.amount}
              precision={2}
              prefix={<><RiseOutlined /> ¥</>}
              suffix={<Text type="secondary" style={{ fontSize: 12 }}>{maxDay.date}</Text>}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="最低日消费"
              value={minDay.amount}
              precision={2}
              prefix={<><FallOutlined /> ¥</>}
              suffix={<Text type="secondary" style={{ fontSize: 12 }}>{minDay.date}</Text>}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {filteredBills.length === 0 ? (
        <Empty description="暂无数据" style={{ marginTop: 80 }} />
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card title={<><PieChartOutlined /> 分类占比</>} size="small">
                <Pie {...pieConfig} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title={<><BarChartOutlined /> 每日消费趋势</>} size="small">
                <Column {...columnConfig} />
              </Card>
            </Col>
          </Row>

          <Card title="分类明细" size="small">
            <Table
              dataSource={categoryData}
              columns={tableColumns}
              rowKey="category"
              pagination={false}
              size="small"
            />
          </Card>
        </>
      )}
    </div>
  );
}
