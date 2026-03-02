import { DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import { App, Button, Card, Popconfirm, Radio, Space, Typography, Upload } from 'antd'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useBills } from '../app/state/useBills'

export function SettingsPage() {
  const { message } = App.useApp()
  const { bills, exportJson, importJson, clearAll } = useBills()
  const [mode, setMode] = useState<'merge' | 'replace'>('merge')

  const exportFileName = useMemo(() => {
    return `ledger-app-backup-${dayjs().format('YYYYMMDD-HHmmss')}.json`
  }, [])

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          数据管理
        </Typography.Title>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            当前共 <Typography.Text strong>{bills.length}</Typography.Text> 笔账单。
          </Typography.Paragraph>

          <Space wrap>
            <Button
              icon={<DownloadOutlined />}
              onClick={async () => {
                const json = await exportJson()
                const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = exportFileName
                a.click()
                URL.revokeObjectURL(url)
                message.success('已导出备份文件')
              }}
            >
              导出备份（JSON）
            </Button>

            <Upload
              accept=".json,application/json"
              showUploadList={false}
              beforeUpload={async (file) => {
                try {
                  const text = await file.text()
                  await importJson(text, mode)
                  message.success(mode === 'merge' ? '导入完成（已合并）' : '导入完成（已覆盖）')
                } catch {
                  message.error('导入失败：文件格式不正确或数据不合法')
                }
                return false
              }}
            >
              <Button icon={<UploadOutlined />}>导入备份</Button>
            </Upload>

            <Radio.Group
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              options={[
                { value: 'merge', label: '合并导入' },
                { value: 'replace', label: '覆盖导入' },
              ]}
              optionType="button"
              buttonStyle="solid"
            />

            <Popconfirm
              title="确认清空所有账单？"
              okText="清空"
              cancelText="取消"
              onConfirm={async () => {
                await clearAll()
                message.success('已清空')
              }}
            >
              <Button danger>清空全部数据</Button>
            </Popconfirm>
          </Space>

          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            所有数据仅保存在你本机的浏览器/桌面应用中（IndexedDB）。没有后端服务，也不会上传到任何服务器。
          </Typography.Paragraph>
        </Space>
      </Card>
    </Space>
  )
}

