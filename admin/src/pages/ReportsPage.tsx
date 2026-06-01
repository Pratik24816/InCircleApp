import { Button, Space, Table, Tag, Typography } from 'antd'
import { MOCK_ADMIN_REPORTS } from '../data/mock'
import { tokens } from '../theme/tokens'

export function ReportsPage() {
  return (
    <div>
      <Typography.Title level={2} style={{ color: tokens.text }}>
        Reports
      </Typography.Title>
      <Typography.Paragraph type="secondary">TODO: assignee, audit log, resolution workflow.</Typography.Paragraph>
      <Table
        rowKey="id"
        dataSource={MOCK_ADMIN_REPORTS}
        pagination={false}
        columns={[
          { title: 'Target', dataIndex: 'targetLabel' },
          { title: 'Type', dataIndex: 'targetType' },
          { title: 'Reason', dataIndex: 'reason' },
          {
            title: 'Created',
            dataIndex: 'createdAt',
            render: t => new Date(t as string).toLocaleString(),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => (
              <Tag color={s === 'open' ? tokens.info : s === 'reviewing' ? tokens.primary : 'default'}>{s}</Tag>
            ),
          },
          {
            title: 'Actions',
            render: () => (
              <Space>
                <Button type="link" size="small" disabled>
                  Open
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </div>
  )
}
