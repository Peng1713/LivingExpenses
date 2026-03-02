import zhCN from 'antd/locale/zh_CN'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { BillsProvider } from './app/state/BillsProvider'

dayjs.locale('zh-cn')

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
      }}
    >
      <AntdApp>
        <BillsProvider>
          <RouterProvider router={router} />
        </BillsProvider>
      </AntdApp>
    </ConfigProvider>
  )
}

