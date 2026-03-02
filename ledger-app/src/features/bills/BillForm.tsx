import { Button, DatePicker, Form, Input, InputNumber, Select, Space, TimePicker } from 'antd'
import dayjs from 'dayjs'
import { BILL_CATEGORIES, type BillCategoryKey } from '../../domain/categories'
import type { BillFormValues } from './billFormTypes'

type Props = {
  initial?: Partial<BillFormValues>
  submitText?: string
  onSubmit: (values: BillFormValues) => Promise<void> | void
  onReset?: () => void
}

export function BillForm({ initial, onSubmit, onReset, submitText = '添加' }: Props) {
  const [form] = Form.useForm<BillFormValues>()

  return (
    <Form
      form={form}
      layout="inline"
      initialValues={{
        date: initial?.date ?? dayjs(),
        time: initial?.time ?? dayjs(),
        category: (initial?.category ?? 'food') as BillCategoryKey,
        amount: initial?.amount ?? undefined,
        note: initial?.note,
      }}
      onFinish={async (values) => {
        await onSubmit(values)
        form.resetFields(['amount', 'note'])
        onReset?.()
      }}
      style={{ rowGap: 12 }}
    >
      <Form.Item name="date" rules={[{ required: true, message: '请选择日期' }]}>
        <DatePicker allowClear={false} />
      </Form.Item>
      <Form.Item name="time" rules={[{ required: true, message: '请选择时间' }]}>
        <TimePicker allowClear={false} format="HH:mm" />
      </Form.Item>
      <Form.Item name="category" rules={[{ required: true, message: '请选择分类' }]}>
        <Select
          style={{ width: 140 }}
          options={BILL_CATEGORIES.map((c) => ({ value: c.key, label: c.label }))}
        />
      </Form.Item>
      <Form.Item
        name="amount"
        rules={[
          { required: true, message: '请输入金额' },
          {
            validator: async (_, v) => {
              if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error('金额不合法')
              if (v <= 0) throw new Error('金额需大于 0')
            },
          },
        ]}
      >
        <InputNumber
          style={{ width: 140 }}
          min={0}
          precision={2}
          placeholder="金额"
          addonBefore="¥"
        />
      </Form.Item>
      <Form.Item name="note">
        <Input style={{ width: 220 }} placeholder="备注（可选）" />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            {submitText}
          </Button>
          <Button
            htmlType="button"
            onClick={() => {
              form.resetFields()
              onReset?.()
            }}
          >
            重置
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

