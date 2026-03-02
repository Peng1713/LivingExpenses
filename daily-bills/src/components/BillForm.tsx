import { Modal, Form, Input, InputNumber, Select, DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { CATEGORIES, type CategoryType, type BillItem } from '../types';

interface BillFormProps {
  open: boolean;
  editItem?: BillItem | null;
  onSubmit: (values: { date: string; category: CategoryType; description: string; amount: number }) => void;
  onCancel: () => void;
}

interface FormValues {
  date: Dayjs;
  category: CategoryType;
  description: string;
  amount: number;
}

export default function BillForm({ open, editItem, onSubmit, onCancel }: BillFormProps) {
  const [form] = Form.useForm<FormValues>();

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit({
      date: values.date.format('YYYY-MM-DD'),
      category: values.category,
      description: values.description,
      amount: values.amount,
    });
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={editItem ? '编辑账单' : '添加账单'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="确认"
      cancelText="取消"
      destroyOnClose
      afterOpenChange={(visible) => {
        if (visible && editItem) {
          form.setFieldsValue({
            date: dayjs(editItem.date),
            category: editItem.category,
            description: editItem.description,
            amount: editItem.amount,
          });
        } else if (visible) {
          form.setFieldsValue({ date: dayjs() });
        }
      }}
    >
      <Form form={form} layout="vertical" initialValues={{ date: dayjs(), category: 'food' }}>
        <Form.Item name="date" label="日期" rules={[{ required: true, message: '请选择日期' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
          <Select
            options={CATEGORIES.map((c) => ({ value: c.key, label: c.label }))}
            placeholder="选择分类"
          />
        </Form.Item>
        <Form.Item
          name="description"
          label="描述"
          rules={[{ required: true, message: '请输入描述' }]}
        >
          <Input placeholder="例如：午餐、地铁卡充值" maxLength={50} />
        </Form.Item>
        <Form.Item
          name="amount"
          label="金额（元）"
          rules={[
            { required: true, message: '请输入金额' },
            { type: 'number', min: 0.01, message: '金额必须大于0' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            precision={2}
            min={0.01}
            placeholder="0.00"
            prefix="¥"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
