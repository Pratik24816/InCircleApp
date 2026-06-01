import { Card, List, Typography } from 'antd'
import { tokens } from '../theme/tokens'

const todos = [
  'Connect NestJS admin API + JWT',
  'Role-based access (superadmin / moderator)',
  'Audit log export',
  'Email templates for bans / warnings',
  'Link to Supabase or primary DB (when chosen)',
]

export function SettingsPage() {
  return (
    <div>
      <Typography.Title level={2} style={{ color: tokens.text }}>
        Settings
      </Typography.Title>
      <Card style={{ background: tokens.surface, borderColor: tokens.border }}>
        <Typography.Title level={5} style={{ color: tokens.text }}>
          Integration checklist
        </Typography.Title>
        <List
          dataSource={todos}
          renderItem={item => (
            <List.Item style={{ borderColor: tokens.border }}>
              <Typography.Text style={{ color: tokens.muted }}>{item}</Typography.Text>
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}
