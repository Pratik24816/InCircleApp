import { Table, Tag, Typography } from 'antd'
import { MOCK_ADMIN_ACTIVITIES } from '../data/mock'
import { tokens } from '../theme/tokens'

const statusColor: Record<string, string> = {
  published: tokens.primary,
  draft: tokens.muted,
  flagged: '#FFB020',
}

export function ActivitiesPage() {
  return (
    <div>
      <Typography.Title level={2} style={{ color: tokens.text }}>
        Activities
      </Typography.Title>
      <Typography.Paragraph type="secondary">TODO: moderation queue, feature flag, host tools.</Typography.Paragraph>
      <Table
        rowKey="id"
        dataSource={MOCK_ADMIN_ACTIVITIES}
        pagination={false}
        columns={[
          { title: 'Title', dataIndex: 'title' },
          { title: 'Host', dataIndex: 'hostName' },
          { title: 'Category', dataIndex: 'category' },
          {
            title: 'Starts',
            dataIndex: 'startsAt',
            render: t => new Date(t as string).toLocaleString(),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => <Tag color={statusColor[s] ?? 'default'}>{s}</Tag>,
          },
        ]}
      />
    </div>
  )
}
