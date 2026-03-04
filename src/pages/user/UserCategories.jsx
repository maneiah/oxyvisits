import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Row, Col, Empty, Spin, Upload, Space } from 'antd';
import { PlusOutlined, EyeOutlined, UploadOutlined, EnvironmentOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../../core/config/Config';
const API_BASE = `${BASE_URL}/ai-service`;

const UserCategories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contactNumber: '',
    description: '',
    webLink: '',
    image: null
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/categories`);
      const activeCategories = response.data.filter(cat => cat.active);
      setCategories(activeCategories.reverse());
      setFilteredCategories(activeCategories.reverse());
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to fetch categories';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          setFormData({ ...formData, location: googleMapsUrl });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Unable to get location. Please enable location access.',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Geolocation is not supported by your browser.',
      });
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

  const handleAddVisit = async () => {
    if (!validateForm()) return;

    try {
      const data = new FormData();
      data.append('categoryId', selectedCategory.id);
      data.append('contactNumber', formData.contactNumber);
      data.append('description', formData.description);
      data.append('location', formData.location);
      data.append('name', formData.name);
      data.append('userId', userId);
      if (formData.webLink) data.append('webLink', formData.webLink);
      if (formData.image) data.append('image', formData.image);

      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/addVisit`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Visit added successfully',
        timer: 2000,
      });
      setModalVisible(false);
      setSelectedCategory(null);
      setFormData({ name: '', location: '', contactNumber: '', description: '', webLink: '', image: null });
      setErrors({});
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to add visit';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    }
  };

  const columns = [
    {
      title: 'S.No',
      key: 'serialNo',
      
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Actions',
      key: 'actions',
    
      align: 'center',
      render: (_, category) => (
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="medium"
            onClick={() => {
              setSelectedCategory(category);
              setModalVisible(true);
            }}
            style={{ backgroundColor: '#1ab394', borderColor: '#1ab394' }}
          >
            Add Visit
          </Button>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="medium"
            onClick={() => navigate(`/dashboard/user-visits/${category.id}`)}
            style={{ backgroundColor: '#008cba', borderColor: '#008cba' }}
          >
            View Visits
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-600 mt-2">Browse and manage your categories</p>
        </div>
        <div style={{ width: 300 }}>
          <Input
            placeholder="Search categories..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredCategories}
        loading={loading}
        rowKey="id"
        scroll={{x:"100%"}}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} categories`,
        }}
        locale={{
          emptyText: <Empty description="No active categories available" />,
        }}
       bordered
      />

      <Modal
        title={
          <span style={{ 
            background: 'linear-gradient(90deg, #9333ea 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            Add Visit - {selectedCategory?.name}
          </span>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedCategory(null);
          setFormData({ name: '', location: '', contactNumber: '', description: '', webLink: '', image: null });
          setErrors({});
        }}
        footer={null}
        width={600}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
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
            <Col xs={24} sm={12}>
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
                  <Button style={{backgroundColor:"#008cba",color:"white"}} onClick={getCurrentLocation} icon={<EnvironmentOutlined />} type="primary">
                    Current Location
                  </Button>
                </Space.Compact>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
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
            <Col xs={24} sm={12}>
              <Form.Item
                label="Web Link"
                validateStatus={errors.webLink ? 'error' : ''}
                help={errors.webLink || ''}
              >
                <Input
                  value={formData.webLink}
                  onChange={(e) => setFormData({ ...formData, webLink: e.target.value })}
                  placeholder="Enter web link"
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
          <Form.Item>
            <div className="flex gap-2">
              <Button
                type="primary"
                onClick={handleAddVisit}
                style={{ backgroundColor: '#1ab394', borderColor: '#1ab394' }}
              >
                Submit
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setSelectedCategory(null);
                setFormData({ name: '', location: '', contactNumber: '', description: '', webLink: '', image: null });
                setErrors({});
              }}>
                Cancel
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserCategories;
