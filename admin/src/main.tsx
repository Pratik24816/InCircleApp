import { App as AntApp, ConfigProvider, theme } from 'antd'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import App from './App.tsx'
import { tokens } from './theme/tokens'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgBase: tokens.bg,
          colorBgContainer: tokens.surface,
          colorBorder: tokens.border,
          colorPrimary: tokens.primary,
          colorInfo: tokens.info,
          colorTextBase: tokens.text,
          colorTextSecondary: tokens.muted,
          borderRadiusLG: 12,
        },
        components: {
          Layout: { bodyBg: tokens.bg, headerBg: tokens.surface, siderBg: tokens.surface },
          Menu: { itemBg: 'transparent', darkItemBg: 'transparent' },
          Table: { headerBg: 'rgba(15,23,42,0.9)', rowHoverBg: 'rgba(77,181,255,0.08)' },
        },
      }}>
      <AntApp>
        <AuthProvider>
          <BrowserRouter basename="/admin">
            <App />
          </BrowserRouter>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
)
