import { Table, Tag, Typography } from 'antd'
import { MOCK_ADMIN_USERS } from '../data/mock'
import { tokens } from '../theme/tokens'

export function UsersPage() {
  return (
    <div>
      <Typography.Title level={2} style={{ color: tokens.text }}>
        Users
      </Typography.Title>
      <Typography.Paragraph type="secondary">TODO: pagination, search, suspend user API.</Typography.Paragraph>
      <Table
        rowKey="id"
        dataSource={MOCK_ADMIN_USERS}
        pagination={false}
        columns={[
          { title: 'Name', dataIndex: 'fullName' },
          { title: 'Email', dataIndex: 'email' },
          { title: 'City', dataIndex: 'city' },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => (
              <Tag color={s === 'active' ? tokens.primary : 'default'}>{s}</Tag>
            ),
          },
          { title: 'Joined', dataIndex: 'joinedAt', render: t => new Date(t as string).toLocaleDateString() },
        ]}
      />
    </div>
  )
}
