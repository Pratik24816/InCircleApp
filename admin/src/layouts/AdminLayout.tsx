import { Layout, Menu, Typography, theme as antTheme } from 'antd'
import {
  BarChartOutlined,
  FlagOutlined,
  FolderOutlined,
  LogoutOutlined,
  SettingOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { tokens } from '../theme/tokens'

const { Header, Sider, Content } = Layout

const items = [
  { key: '/', icon: <BarChartOutlined />, label: <Link to="/">Dashboard</Link> },
  { key: '/users', icon: <TeamOutlined />, label: <Link to="/users">Users</Link> },
  {
    key: '/activities',
    icon: <ThunderboltOutlined />,
    label: <Link to="/activities">Activities</Link>,
  },
  { key: '/reports', icon: <FlagOutlined />, label: <Link to="/reports">Reports</Link> },
  {
    key: '/categories',
    icon: <FolderOutlined />,
    label: <Link to="/categories">Categories</Link>,
  },
  { key: '/settings', icon: <SettingOutlined />, label: <Link to="/settings">Settings</Link> },
]

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { token } = antTheme.useToken()
  const path = location.pathname.replace(/\/$/, '') || '/'
  const selectedKey =
    path === '/'
      ? '/'
      : (items.find(i => i.key !== '/' && path.startsWith(i.key))?.key ?? '/')

  return (
    <Layout style={{ minHeight: '100vh', background: tokens.bg }}>
      <Sider
        breakpoint="lg"
        collapsedWidth={64}
        width={220}
        style={{
          background: tokens.surface,
          borderRight: `1px solid ${tokens.border}`,
          backdropFilter: 'blur(12px)',
        }}>
        <div style={{ padding: token.paddingLG, paddingBottom: token.paddingSM }}>
          <Typography.Title level={4} style={{ color: tokens.text, margin: 0 }}>
            InCircle
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Admin (mock)
          </Typography.Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{ background: 'transparent', border: 'none' }}
          items={items}
        />
      </Sider>
      <Layout style={{ background: 'transparent' }}>
        <Header
          style={{
            background: tokens.surface,
            borderBottom: `1px solid ${tokens.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingInline: token.paddingLG,
            backdropFilter: 'blur(12px)',
          }}>
          <Typography.Link
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
            style={{ color: tokens.muted }}>
            <LogoutOutlined /> Sign out
          </Typography.Link>
        </Header>
        <Content style={{ padding: token.paddingLG }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
