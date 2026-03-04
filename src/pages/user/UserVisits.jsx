import React, { useState, useEffect } from 'react';
import { Card, Button, Spin, Empty, Table, Image, Typography, Row, Col } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import BASE_URL from '../../core/config/Config';

const { Title, Text } = Typography;
const API_BASE = `${BASE_URL}/ai-service`;

const UserVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const { categoryId } = useParams();

  useEffect(() => {
    if (categoryId) {
      fetchVisits();
    }
  }, [categoryId]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.get(`${API_BASE}/visits?categoryId=${categoryId}`);
      const userVisits = response.data.filter(visit => visit.userId === userId);
      setVisits(userVisits.reverse());
      if (response.data.length > 0 && response.data[0].categoryName) {
        setCategoryName(response.data[0].categoryName);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to fetch visits';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "S.No",
      key: "sno",
      align: "center",
      render: (_, __, index) => (
        <span>{(currentPage - 1) * pageSize + index + 1}</span>
      ),
      width: 80,
    },
    {
      title: "Visit Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      align: "center",
      render: (location) =>
        location ? (
          <a href={location} target="_blank" rel="noopener noreferrer">
            View Map
          </a>
        ) : (
          <span>-</span>
        ),
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
      key: "contactNumber",
      align: "center",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      align: "center",
      render: (text) => (
        <span>{text?.length > 50 ? `${text.substring(0, 50)}...` : text}</span>
      ),
    },
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      align: "center",
      render: (url) =>
        url ? (
          <Image
            src={url}
            width={52}
            height={52}
            style={{ borderRadius: 10, objectFit: "cover" }}
            preview
          />
        ) : (
          <span>-</span>
        ),
    },
    {
      title: "Web Link",
      dataIndex: "webLink",
      key: "webLink",
      align: "center",
      render: (link) =>
        link ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            Visit Site
          </a>
        ) : (
          <span>-</span>
        ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      {/* Header with back button and title */}
      <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 16 }}>
       
        <Col flex={1}>
          <Title level={3} style={{ margin: 0 }}>
            My Visits {categoryName && <span>- {categoryName}</span>}
          </Title>
          <Text type="secondary">View and manage your personal visits</Text>
        </Col>
      </Row>

      {/* Content */}
      <div style={{ borderRadius: 14 }}>
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 240,
            }}
          >
            <Spin size="large" tip="Loading your visits..." />
          </div>
        ) : visits.length === 0 ? (
          <Empty 
            description="You haven't added any visits in this category yet"
            style={{ padding: '48px 0' }}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={visits}
            rowKey="visitId"
            bordered
            scroll={{ x: '100%' }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: visits.length,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} visits`,
              pageSizeOptions: ['5', '10', '20', '50'],
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              responsive: true,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default UserVisits;