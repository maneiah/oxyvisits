import React, { useState, useEffect } from 'react';
import { Table, Card, Spin, Input, Image, Row, Col, Typography } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import Swal from 'sweetalert2';
import BASE_URL from '../../core/config/Config';

const { Title, Text } = Typography;
const API_BASE = `${BASE_URL}/ai-service`;

const AllVisits = () => {
  const [visits, setVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchAllVisits();
  }, []);

  useEffect(() => {
    const filtered = visits.filter(visit =>
      visit.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      visit.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
      visit.categoryName?.toLowerCase().includes(searchText.toLowerCase()) ||
      visit.location?.toLowerCase().includes(searchText.toLowerCase()) ||
      visit.contactNumber?.includes(searchText)
    );
    setFilteredVisits(filtered);
  }, [searchText, visits]);

  const fetchAllVisits = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/visits`);
      setVisits(response.data.reverse());
      setFilteredVisits(response.data.reverse());
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
      title: '#',
      key: 'sno',
      align: 'center',
      render: (_, __, index) => <span>{index + 1}</span>,
     
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      align: 'center',
     
    },
    {
      title: 'Category',
      dataIndex: 'categoryName',
      key: 'categoryName',
      align: 'center',
     
    },
    {
      title: 'Visit Name',
      dataIndex: 'name',
      key: 'name',
    align:"center",
      sorter: (a, b) => a.name.localeCompare(b.name),
  
    },
    {
      title: 'Contact',
      dataIndex: 'contactNumber',
      key: 'contactNumber',
      align: 'center',
      
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      align: 'center',
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
      render: (text) => (
        <span>
          {text?.length > 50 ? `${text.substring(0, 50)}...` : text}
        </span>
      ),
     
    },
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      align: 'center',
      render: (url) =>
        url ? (
          <Image
            src={url}
            width={50}
            height={50}
            style={{ borderRadius: '8px', objectFit: 'cover' }}
            preview
          />
        ) : (
          <span>-</span>
        ),
  
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      render: (date) => (date ? new Date(date).toLocaleDateString() : '-'),
    
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={[12, 12]} align="middle" justify="space-between" style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <Title level={3} style={{ margin: 0 }}>
            All Visits
          </Title>
          <Text type="secondary">Complete visits management</Text>
        </Col>
        <Col xs={24} md={12}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Input
              placeholder="Search by user, category, visit name..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              style={{ width: "100%", maxWidth: 420 }}
              allowClear
            />
          </div>
        </Col>
      </Row>

      <div style={{ borderRadius: 14 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredVisits}
            rowKey="visitId"
            bordered
            scroll={{ x: "100%" }}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} visits`,
              responsive: true,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AllVisits;