import { Card, Col, Row, Statistic, Typography } from 'antd'
import { DASHBOARD_STATS } from '../data/mock'
import { tokens } from '../theme/tokens'

export function DashboardPage() {
  return (
    <div>
      <Typography.Title level={2} style={{ color: tokens.text }}>
        Dashboard
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        Mock metrics only — wire to analytics / DB later.
      </Typography.Paragraph>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic title="Total users" value={DASHBOARD_STATS.totalUsers} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic title="Active (7d)" value={DASHBOARD_STATS.activeUsers7d} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic title="Published activities" value={DASHBOARD_STATS.publishedActivities} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic title="Open reports" value={DASHBOARD_STATS.openReports} valueStyle={{ color: tokens.info }} />
          </Card>
        </Col>
      </Row>
      <Card style={{ ...cardStyle, marginTop: 16 }}>
        <Statistic title="Signups (24h)" value={DASHBOARD_STATS.newSignups24h} />
      </Card>
    </div>
  )
}

const cardStyle = {
  background: tokens.surface,
  borderColor: tokens.border,
} as const
