import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Row, Col, Empty, Spin, Upload } from 'antd';
import { PlusOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../../core/config/Config';
const API_BASE = `${BASE_URL}/ai-service`;

const UserCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Categories</h1>
        <p className="text-gray-600 mt-2">Browse and manage your categories</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <Empty description="No active categories available" />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {categories.map((category) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={category.id}>
              <Card
                hoverable
                className="h-full"
                style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                    {category.name}
                  </h3>
                  <div className="flex flex-col gap-2 mt-auto">
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      block
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
                      block
                      onClick={() => navigate(`/dashboard/user-visits/${category.id}`)}
                      style={{ backgroundColor: '#008cba', borderColor: '#008cba' }}
                    >
                      View Visits
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={`Add Visit - ${selectedCategory?.name}`}
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
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                />
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
                style={{ backgroundColor: '#008cba', borderColor: '#008cba' }}
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
