import React, { useState, useEffect } from 'react';
import { Card, Button, Spin, Empty, Table, Image, Input, Modal, Form, Upload, Space, Row, Col } from 'antd';
import { ArrowLeftOutlined, SearchOutlined, EditOutlined, UploadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import BASE_URL from '../../core/config/Config';

const API_BASE = `${BASE_URL}/ai-service`;

const UserAllVisits = () => {
  const [visits, setVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contactNumber: '',
    description: '',
    webLink: '',
    image: null,
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchVisits();
  }, []);

  useEffect(() => {
    const filtered = visits.filter(visit =>
      visit.categoryName?.toLowerCase().includes(searchText.toLowerCase()) ||
      visit.name?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredVisits(filtered);
  }, [searchText, visits]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.get(`${API_BASE}/visits?userId=${userId}`);
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Visit name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^[0-9]+$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Must be only digits';
    }
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.webLink && !/^https?:\/\/.+/.test(formData.webLink)) {
      newErrors.webLink = 'Must be a valid URL';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (visit) => {
    setSelectedVisit(visit);
    setFormData({
      name: visit.name || '',
      location: visit.location || '',
      contactNumber: visit.contactNumber || '',
      description: visit.description || '',
      webLink: visit.webLink || '',
      image: null,
    });
    setEditModalVisible(true);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setFormData((p) => ({ ...p, location: googleMapsUrl }));
      },
      () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Unable to get location. Please enable location access.',
        });
      },
    );
  };

  const handleUpdateVisit = async () => {
    if (!validateForm()) return;

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('location', formData.location);
      data.append('contactNumber', formData.contactNumber);
      data.append('description', formData.description);
      if (formData.webLink) data.append('webLink', formData.webLink);
      if (formData.image) data.append('image', formData.image);

      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      await axios.patch(
        `${API_BASE}/visits/${selectedVisit.visitId}?userId=${userId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Visit updated successfully',
        timer: 2000,
      });

      setEditModalVisible(false);
      setSelectedVisit(null);
      setFormData({
        name: '',
        location: '',
        contactNumber: '',
        description: '',
        webLink: '',
        image: null,
      });
      setErrors({});
      fetchVisits();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Failed to update visit';

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
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
      title: "Category",
      dataIndex: "categoryName",
      key: "categoryName",
      align: "center",
    },
    {
      title: "Visit Name",
      dataIndex: "name",
      key: "name",
      align: "center",
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
            alt="Visit Image"
            width={50}
            height={50}
            style={{ borderRadius: '8px', objectFit: 'cover' }}
            preview={{
              mask: <div>View</div>
            }}
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
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Visits</h1>
          <p className="text-gray-600 mt-1">Manage and view all your visits</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search by category or visit name..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="large"
            style={{ width: '300px' }}
            allowClear
          />
        </div>
      </div>

      <div className="rounded-xl">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" tip="Loading your visits..." />
          </div>
        ) : filteredVisits.length === 0 ? (
          <Empty 
            description={searchText ? "No visits found matching your search" : "You haven't added any visits yet"}
            className="py-12"
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredVisits}
            rowKey="visitId"
            loading={loading}
            bordered
            scroll={{ x: 'max-content' }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredVisits.length,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} visits`,
              pageSizeOptions: ['5', '10', '20', '50'],
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
          />
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        title={`Edit Visit${selectedVisit?.categoryName ? ` - ${selectedVisit.categoryName}` : ''}`}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedVisit(null);
          setFormData({
            name: '',
            location: '',
            contactNumber: '',
            description: '',
            webLink: '',
            image: null,
          });
          setErrors({});
        }}
        footer={null}
        width={800}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Visit Name"
                validateStatus={errors.name ? 'error' : ''}
                help={errors.name || ''}
              >
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter visit name"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Contact Number"
                validateStatus={errors.contactNumber ? 'error' : ''}
                help={errors.contactNumber || ''}
              >
                <Input
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="Enter contact number"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Location"
                validateStatus={errors.location ? 'error' : ''}
                help={errors.location || ''}
              >
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter location"
                  />
                  <Button
                    onClick={getCurrentLocation}
                    icon={<EnvironmentOutlined />}
                    type="primary"
                  >
                    Current
                  </Button>
                </Space.Compact>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Web Link"
                validateStatus={errors.webLink ? 'error' : ''}
                help={errors.webLink || ''}
              >
                <Input
                  value={formData.webLink}
                  onChange={(e) => setFormData({ ...formData, webLink: e.target.value })}
                  placeholder="https://example.com"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Description"
            validateStatus={errors.description ? 'error' : ''}
            help={errors.description || ''}
          >
            <Input.TextArea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Enter description"
            />
          </Form.Item>

          <Form.Item label="Image">
            <Upload
              maxCount={1}
              beforeUpload={(file) => {
                setFormData({ ...formData, image: file });
                return false;
              }}
              onRemove={() => setFormData({ ...formData, image: null })}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button type="primary" onClick={handleUpdateVisit}>
                Update
              </Button>
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  setSelectedVisit(null);
                  setFormData({
                    name: '',
                    location: '',
                    contactNumber: '',
                    description: '',
                    webLink: '',
                    image: null,
                  });
                  setErrors({});
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserAllVisits;
