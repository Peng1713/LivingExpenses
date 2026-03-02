import { useState } from 'react';
import { ConfigProvider, Layout, Menu, theme } from 'antd';
import {
  WalletOutlined,
  PieChartOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import BillList from './pages/BillList';
import Statistics from './pages/Statistics';
import Analysis from './pages/Analysis';

dayjs.locale('zh-cn');

const { Header, Content, Sider } = Layout;

const menuItems = [
  { key: 'bills', icon: <WalletOutlined />, label: '我的账单' },
  { key: 'statistics', icon: <PieChartOutlined />, label: '统计概览' },
  { key: 'analysis', icon: <BulbOutlined />, label: '消费分析' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState('bills');
  const [collapsed, setCollapsed] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'statistics':
        return <Statistics />;
      case 'analysis':
        return <Analysis />;
      default:
        return <BillList />;
    }
  };

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#667eea',
          borderRadius: 8,
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          breakpoint="lg"
          style={{ background: '#fff' }}
          theme="light"
        >
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <WalletOutlined style={{ fontSize: 24, color: '#667eea' }} />
            {!collapsed && (
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#667eea',
                  whiteSpace: 'nowrap',
                }}
              >
                日常记账
              </span>
            )}
          </div>
          <Menu
            mode="inline"
            selectedKeys={[currentPage]}
            items={menuItems}
            onClick={({ key }) => setCurrentPage(key)}
            style={{ borderRight: 'none' }}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              background: '#fff',
              padding: '0 24px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 500 }}>
              {menuItems.find((m) => m.key === currentPage)?.label}
            </span>
          </Header>
          <Content
            style={{
              margin: 24,
              padding: 24,
              background: '#f5f5f5',
              borderRadius: 8,
              overflow: 'auto',
            }}
          >
            {renderPage()}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
