import { useState, useMemo } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Empty,
  List,
  Popconfirm,
  Space,
  Statistic,
  Typography,
  Row,
  Col,
  Flex,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  WalletOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useBillStore } from '../store/useBillStore';
import { type BillItem, type CategoryType } from '../types';
import BillForm from '../components/BillForm';
import CategoryTag from '../components/CategoryTag';

const { Title, Text } = Typography;

export default function BillList() {
  const { bills, addBill, updateBill, deleteBill } = useBillStore();
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<BillItem | null>(null);

  const filteredBills = useMemo(() => {
    const ym = selectedMonth.format('YYYY-MM');
    return bills
      .filter((b) => b.date.startsWith(ym))
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.createdAt - a.createdAt;
      });
  }, [bills, selectedMonth]);

  const groupedByDate = useMemo(() => {
    const map = new Map<string, BillItem[]>();
    for (const bill of filteredBills) {
      const list = map.get(bill.date) ?? [];
      list.push(bill);
      map.set(bill.date, list);
    }
    return Array.from(map.entries());
  }, [filteredBills]);

  const monthTotal = useMemo(
    () => filteredBills.reduce((sum, b) => sum + b.amount, 0),
    [filteredBills]
  );

  const handleSubmit = (values: {
    date: string;
    category: CategoryType;
    description: string;
    amount: number;
  }) => {
    if (editItem) {
      updateBill(editItem.id, values);
    } else {
      addBill(values);
    }
    setEditItem(null);
    setFormOpen(false);
  };

  const handleEdit = (item: BillItem) => {
    setEditItem(item);
    setFormOpen(true);
  };

  return (
    <div>
      <Flex justify="space-between" align="center" wrap="wrap" gap={16} style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <WalletOutlined style={{ marginRight: 8 }} />
          我的账单
        </Title>
        <Space>
          <DatePicker
            picker="month"
            value={selectedMonth}
            onChange={(v) => v && setSelectedMonth(v)}
            allowClear={false}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditItem(null);
              setFormOpen(true);
            }}
          >
            记一笔
          </Button>
        </Space>
      </Flex>

      <Card
        size="small"
        style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>{selectedMonth.format('YYYY年MM月')} 总支出</span>}
              value={monthTotal}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#fff', fontSize: 28 }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>记录笔数</span>}
              value={filteredBills.length}
              suffix="笔"
              valueStyle={{ color: '#fff', fontSize: 28 }}
            />
          </Col>
        </Row>
      </Card>

      {groupedByDate.length === 0 ? (
        <Empty description="当月暂无账单记录" style={{ marginTop: 80 }} />
      ) : (
        groupedByDate.map(([date, items]) => {
          const dayTotal = items.reduce((s, b) => s + b.amount, 0);
          const weekDay = dayjs(date).format('dddd');
          return (
            <Card
              key={date}
              size="small"
              title={
                <Flex justify="space-between" align="center">
                  <Space>
                    <CalendarOutlined />
                    <Text strong>{dayjs(date).format('MM月DD日')}</Text>
                    <Text type="secondary">{weekDay}</Text>
                  </Space>
                  <Text type="danger" strong>
                    ¥{dayTotal.toFixed(2)}
                  </Text>
                </Flex>
              }
              style={{ marginBottom: 12 }}
            >
              <List
                dataSource={items}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(item)}
                      />,
                      <Popconfirm
                        title="确定要删除这条记录吗？"
                        onConfirm={() => deleteBill(item.id)}
                        okText="删除"
                        cancelText="取消"
                      >
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <CategoryTag category={item.category} />
                          <span>{item.description}</span>
                        </Space>
                      }
                    />
                    <Text strong style={{ fontSize: 16, color: '#f5222d' }}>
                      ¥{item.amount.toFixed(2)}
                    </Text>
                  </List.Item>
                )}
              />
            </Card>
          );
        })
      )}

      <BillForm
        open={formOpen}
        editItem={editItem}
        onSubmit={handleSubmit}
        onCancel={() => {
          setFormOpen(false);
          setEditItem(null);
        }}
      />
    </div>
  );
}
