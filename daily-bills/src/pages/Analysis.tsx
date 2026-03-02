import { useMemo, useState } from 'react';
import { Card, Row, Col, Typography, Alert, DatePicker, Flex, Empty, Tag, List, Progress } from 'antd';
import {
  BulbOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  FireOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import dayjs, { Dayjs } from 'dayjs';
import { useBillStore } from '../store/useBillStore';
import { CATEGORY_MAP, type CategoryType } from '../types';
import CategoryTag from '../components/CategoryTag';

const { Title, Text, Paragraph } = Typography;

export default function Analysis() {
  const { bills } = useBillStore();
  const [selectedYear, setSelectedYear] = useState<Dayjs>(dayjs());

  const yearBills = useMemo(() => {
    const y = selectedYear.format('YYYY');
    return bills.filter((b) => b.date.startsWith(y));
  }, [bills, selectedYear]);

  const monthlyTrend = useMemo(() => {
    const map = new Map<string, number>();
    for (let m = 0; m < 12; m++) {
      const key = selectedYear.month(m).format('YYYY-MM');
      map.set(key, 0);
    }
    for (const b of yearBills) {
      const key = b.date.slice(0, 7);
      map.set(key, (map.get(key) ?? 0) + b.amount);
    }
    return Array.from(map.entries())
      .map(([month, amount]) => ({
        month: dayjs(month).format('M月'),
        amount: Math.round(amount * 100) / 100,
      }))
      .sort((a, b) => parseInt(a.month) - parseInt(b.month));
  }, [yearBills, selectedYear]);

  const categoryRanking = useMemo(() => {
    const map = new Map<CategoryType, number>();
    for (const b of yearBills) {
      map.set(b.category, (map.get(b.category) ?? 0) + b.amount);
    }
    const total = yearBills.reduce((s, b) => s + b.amount, 0);
    return Array.from(map.entries())
      .map(([key, amount]) => ({
        category: key,
        label: CATEGORY_MAP[key]?.label ?? key,
        amount: Math.round(amount * 100) / 100,
        percent: total > 0 ? Math.round((amount / total) * 10000) / 100 : 0,
        count: yearBills.filter((b) => b.category === key).length,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [yearBills]);

  const weekdayAnalysis = useMemo(() => {
    const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const map = new Map<number, { total: number; count: number }>();
    for (let i = 0; i < 7; i++) map.set(i, { total: 0, count: 0 });

    const daySet = new Map<number, Set<string>>();
    for (let i = 0; i < 7; i++) daySet.set(i, new Set());

    for (const b of yearBills) {
      const wd = dayjs(b.date).day();
      const prev = map.get(wd)!;
      map.set(wd, { total: prev.total + b.amount, count: prev.count + 1 });
      daySet.get(wd)!.add(b.date);
    }
    return Array.from(map.entries()).map(([wd, { total }]) => ({
      weekday: weekNames[wd],
      avgAmount: daySet.get(wd)!.size > 0 ? Math.round((total / daySet.get(wd)!.size) * 100) / 100 : 0,
      total: Math.round(total * 100) / 100,
      days: daySet.get(wd)!.size,
    }));
  }, [yearBills]);

  const insights = useMemo(() => {
    const tips: { type: 'info' | 'warning' | 'success'; message: string }[] = [];
    if (yearBills.length === 0) return tips;

    const total = yearBills.reduce((s, b) => s + b.amount, 0);
    const months = new Set(yearBills.map((b) => b.date.slice(0, 7))).size;
    const monthlyAvg = months > 0 ? total / months : 0;

    tips.push({
      type: 'info',
      message: `${selectedYear.format('YYYY')}年共记录 ${yearBills.length} 笔支出，月均消费 ¥${monthlyAvg.toFixed(2)}`,
    });

    if (categoryRanking.length > 0) {
      const top = categoryRanking[0];
      tips.push({
        type: top.percent > 50 ? 'warning' : 'info',
        message: `最大支出分类为「${top.label}」，占总支出的 ${top.percent}%${top.percent > 50 ? '，建议关注该项支出' : ''}`,
      });
    }

    const highSpendWeekday = weekdayAnalysis.reduce((max, d) =>
      d.avgAmount > max.avgAmount ? d : max
    );
    if (highSpendWeekday.avgAmount > 0) {
      tips.push({
        type: 'info',
        message: `${highSpendWeekday.weekday}的日均消费最高（¥${highSpendWeekday.avgAmount.toFixed(2)}），注意控制${highSpendWeekday.weekday}的开支`,
      });
    }

    const recentMonth = dayjs().format('YYYY-MM');
    const prevMonth = dayjs().subtract(1, 'month').format('YYYY-MM');
    const recentTotal = yearBills.filter((b) => b.date.startsWith(recentMonth)).reduce((s, b) => s + b.amount, 0);
    const prevTotal = yearBills.filter((b) => b.date.startsWith(prevMonth)).reduce((s, b) => s + b.amount, 0);
    if (prevTotal > 0) {
      const changeRate = ((recentTotal - prevTotal) / prevTotal * 100).toFixed(1);
      if (recentTotal > prevTotal) {
        tips.push({ type: 'warning', message: `本月支出较上月增长了 ${changeRate}%，注意节制消费` });
      } else {
        tips.push({ type: 'success', message: `本月支出较上月减少了 ${Math.abs(Number(changeRate))}%，继续保持！` });
      }
    }

    return tips;
  }, [yearBills, categoryRanking, weekdayAnalysis, selectedYear]);

  const topItems = useMemo(() => {
    return [...yearBills].sort((a, b) => b.amount - a.amount).slice(0, 10);
  }, [yearBills]);

  const lineConfig = {
    data: monthlyTrend,
    xField: 'month',
    yField: 'amount',
    point: { shapeField: 'circle', sizeField: 4 },
    style: { lineWidth: 2 },
    tooltip: {
      items: [{ field: 'amount', name: '支出', valueFormatter: (v: number) => `¥${v.toFixed(2)}` }],
    },
    axis: {
      y: { labelFormatter: (v: number) => `¥${v}` },
    },
    height: 300,
  };

  const maxWeekdayAvg = Math.max(...weekdayAnalysis.map((d) => d.avgAmount), 1);

  return (
    <div>
      <Flex justify="space-between" align="center" wrap="wrap" gap={16} style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <BulbOutlined style={{ marginRight: 8 }} />
          消费分析
        </Title>
        <DatePicker
          picker="year"
          value={selectedYear}
          onChange={(v) => v && setSelectedYear(v)}
          allowClear={false}
        />
      </Flex>

      {yearBills.length === 0 ? (
        <Empty description="暂无数据，快去记账吧" style={{ marginTop: 80 }} />
      ) : (
        <>
          {insights.length > 0 && (
            <Card
              title={<><ThunderboltOutlined /> 智能洞察</>}
              size="small"
              style={{ marginBottom: 16 }}
            >
              {insights.map((tip, i) => (
                <Alert
                  key={i}
                  type={tip.type}
                  message={tip.message}
                  showIcon
                  style={{ marginBottom: i < insights.length - 1 ? 8 : 0 }}
                />
              ))}
            </Card>
          )}

          <Card
            title={<><LineChartOutlined /> 月度消费趋势</>}
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Line {...lineConfig} />
          </Card>

          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} lg={12}>
              <Card title={<><FireOutlined /> 星期消费分布</>} size="small">
                <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                  每个星期几的日均消费对比
                </Paragraph>
                {weekdayAnalysis.map((item) => (
                  <div key={item.weekday} style={{ marginBottom: 12 }}>
                    <Flex justify="space-between" style={{ marginBottom: 4 }}>
                      <Text>{item.weekday}</Text>
                      <Text strong>¥{item.avgAmount.toFixed(2)}/天</Text>
                    </Flex>
                    <Progress
                      percent={maxWeekdayAvg > 0 ? Math.round((item.avgAmount / maxWeekdayAvg) * 100) : 0}
                      showInfo={false}
                      strokeColor="#667eea"
                      size="small"
                    />
                  </div>
                ))}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title={<><TrophyOutlined /> 分类排行榜</>} size="small">
                {categoryRanking.map((item, idx) => (
                  <Flex
                    key={item.category}
                    justify="space-between"
                    align="center"
                    style={{ padding: '8px 0', borderBottom: idx < categoryRanking.length - 1 ? '1px solid #f0f0f0' : 'none' }}
                  >
                    <Flex align="center" gap={8}>
                      <Tag
                        color={idx < 3 ? ['#f5222d', '#fa8c16', '#faad14'][idx] : 'default'}
                        style={{ minWidth: 24, textAlign: 'center', marginRight: 0 }}
                      >
                        {idx + 1}
                      </Tag>
                      <CategoryTag category={item.category} />
                    </Flex>
                    <Flex gap={16} align="center">
                      <Text type="secondary">{item.count}笔</Text>
                      <Text strong style={{ minWidth: 80, textAlign: 'right' }}>¥{item.amount.toFixed(2)}</Text>
                      <Text type="secondary" style={{ minWidth: 50, textAlign: 'right' }}>{item.percent}%</Text>
                    </Flex>
                  </Flex>
                ))}
              </Card>
            </Col>
          </Row>

          <Card title={<><TrophyOutlined /> 年度 TOP10 单笔消费</>} size="small">
            <List
              dataSource={topItems}
              renderItem={(item, idx) => (
                <List.Item>
                  <Flex align="center" gap={12} style={{ width: '100%' }}>
                    <Tag
                      color={idx < 3 ? ['#f5222d', '#fa8c16', '#faad14'][idx] : 'default'}
                      style={{ minWidth: 24, textAlign: 'center' }}
                    >
                      {idx + 1}
                    </Tag>
                    <CategoryTag category={item.category} />
                    <Text style={{ flex: 1 }}>{item.description}</Text>
                    <Text type="secondary">{dayjs(item.date).format('MM-DD')}</Text>
                    <Text strong style={{ color: '#f5222d', minWidth: 80, textAlign: 'right' }}>
                      ¥{item.amount.toFixed(2)}
                    </Text>
                  </Flex>
                </List.Item>
              )}
            />
          </Card>
        </>
      )}
    </div>
  );
}
