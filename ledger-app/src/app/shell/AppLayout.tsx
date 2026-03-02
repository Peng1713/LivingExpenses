import {
  AreaChartOutlined,
  BarChartOutlined,
  SettingOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Layout, Menu, Typography } from 'antd'
import { useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const { Header, Sider, Content } = Layout

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const selectedKey = useMemo(() => {
    const p = location.pathname
    if (p.startsWith('/stats')) return '/stats'
    if (p.startsWith('/analysis')) return '/analysis'
    if (p.startsWith('/settings')) return '/settings'
    return '/bills'
  }, [location.pathname])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} collapsible>
        <div style={{ padding: 16 }}>
          <Typography.Title level={4} style={{ margin: 0, color: '#fff' }}>
            账本
          </Typography.Title>
          <Typography.Text style={{ color: 'rgba(255,255,255,0.72)' }}>
            ledger-app
          </Typography.Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={[
            { key: '/bills', icon: <WalletOutlined />, label: '账单' },
            { key: '/stats', icon: <BarChartOutlined />, label: '统计' },
            { key: '/analysis', icon: <AreaChartOutlined />, label: '分析' },
            { key: '/settings', icon: <SettingOutlined />, label: '设置' },
          ]}
          onClick={(e) => navigate(e.key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Typography.Text strong>{menuTitle(selectedKey)}</Typography.Text>
          <Typography.Text type="secondary">
            数据仅保存在本地浏览器/桌面应用中
          </Typography.Text>
        </Header>
        <Content style={{ padding: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

function menuTitle(key: string) {
  switch (key) {
    case '/stats':
      return '统计'
    case '/analysis':
      return '分析'
    case '/settings':
      return '设置'
    case '/bills':
    default:
      return '账单'
  }
}

