import { Button, Card, Form, Input, Typography } from 'antd'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { tokens } from '../theme/tokens'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: { pathname?: string } } }
  const raw = location.state?.from?.pathname
  const target = raw && raw !== '/login' ? raw : '/'

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: `radial-gradient(ellipse at top, rgba(140,255,79,0.08), transparent 50%), ${tokens.bg}`,
      }}>
      <Card
        style={{
          width: 400,
          maxWidth: '100%',
          background: tokens.surface,
          borderColor: tokens.border,
          backdropFilter: 'blur(16px)',
        }}
        title={
          <Typography.Title level={3} style={{ margin: 0, color: tokens.text }}>
            InCircle Admin
          </Typography.Title>
        }>
        <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
          Demo login — no backend. Any email and password works.
        </Typography.Paragraph>
        <Form
          layout="vertical"
          onFinish={v => {
            login(v.email, v.password)
            navigate(target, { replace: true })
          }}
          initialValues={{ email: 'admin@incircle.app', password: 'demo' }}>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Sign in
          </Button>
        </Form>
      </Card>
    </div>
  )
}
