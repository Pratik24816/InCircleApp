import { Table, Typography } from 'antd'
import { MOCK_ADMIN_CATEGORIES } from '../data/mock'
import { tokens } from '../theme/tokens'

export function CategoriesPage() {
  return (
    <div>
      <Typography.Title level={2} style={{ color: tokens.text }}>
        Categories
      </Typography.Title>
      <Typography.Paragraph type="secondary">TODO: CRUD + icon/color from CMS.</Typography.Paragraph>
      <Table
        rowKey="id"
        dataSource={MOCK_ADMIN_CATEGORIES}
        pagination={false}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'Slug', dataIndex: 'slug' },
          { title: 'Activities', dataIndex: 'activityCount' },
        ]}
      />
    </div>
  )
}
