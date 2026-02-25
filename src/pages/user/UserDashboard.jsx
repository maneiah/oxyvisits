import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Employee Dashboard</h1>
      <Row gutter={16}>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable onClick={() => navigate('/dashboard/user-categories')} style={{ cursor: 'pointer' }}>
            <Statistic
              title="Categories"
              value={12}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="My Visits"
              value={8}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="Pending"
              value={4}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserDashboard;
