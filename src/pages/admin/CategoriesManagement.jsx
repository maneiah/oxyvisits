import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Card } from 'antd';
import { PlusOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../../core/config/Config';
const API_BASE = `${BASE_URL}/ai-service`;

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categoryName, setCategoryName] = useState('');
  const [searchText, setSearchText] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter(cat =>
      cat.name?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchText, categories]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/categories`);
      setCategories(response.data.reverse());
      setFilteredCategories(response.data.reverse());
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
    const trimmedName = categoryName.trim();
    
    if (!trimmedName) {
      newErrors.name = 'Category name is required';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Must be at least 2 characters';
    } else if (trimmedName.length > 50) {
      newErrors.name = 'Must be less than 50 characters';
    } else if (!/^[a-zA-Z0-9\s&-]+$/.test(trimmedName)) {
      newErrors.name = 'Only letters, numbers, spaces, & and - are allowed';
    } else if (categories.some(cat => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      newErrors.name = 'Category name already exists';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      await axios.post(`${API_BASE}/create-category`, { name: categoryName.trim() });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Category created successfully',
        timer: 2000,
      });
      setModalVisible(false);
      setCategoryName('');
      setErrors({});
      fetchCategories();
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to create category';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await axios.patch(`${API_BASE}/categories/toggle/${id}`);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Category ${currentStatus ? 'deactivated' : 'activated'}`,
        timer: 2000,
      });
      fetchCategories();
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to toggle category status';
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
      key: 'sno',
      align: 'center',
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
      width: 80,
      responsive: ['sm'],
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      align: 'center',
      render: (active) => (
        <span className={`px-2 py-1 rounded text-xs ${active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/dashboard/visits/${record.id}`)}
            style={{ backgroundColor: '#008cba', borderColor: '#008cba' }}
            size="medium"
          >
            View Visits
          </Button>
          <Button
            type="primary"
            onClick={() => handleToggle(record.id, record.active)}
            style={{
              backgroundColor: record.active ? '#f5222d' : '#1ab394',
              borderColor: record.active ? '#f5222d' : '#1ab394',
            }}
            size="medium"
          >
            {record.active ? 'Deactivate' : 'Activate'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Categories Management</h1>
        <p className="text-gray-600 mt-2">Manage all categories and their status</p>
      </div>
      
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <Input
            placeholder="Search by category name..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: '400px' }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
            style={{ backgroundColor: '#1ab394', borderColor: '#1ab394' }}
          >
            Add Category
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredCategories}
          rowKey="id"
          loading={loading}
          bordered
          scroll={{ x: '100%' }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredCategories.length,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`,
            pageSizeOptions: ['5', '10', '20', '50'],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </div>

      <Modal
        title={
          <span style={{ fontWeight: 700, color: '#008cba' }}>
            Create New Category
          </span>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setCategoryName('');
          setErrors({});
        }}
        footer={null}
        width={500}
      >
        <Form layout="vertical">
          <Form.Item
            label={<span style={{ color: '#008cba', fontWeight: 600 }}>Category Name</span>}
            validateStatus={errors.name ? 'error' : ''}
            help={errors.name || ''}
          >
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name (2-50 characters)"
              maxLength={50}
              showCount
              style={{ borderColor: '#1ab8cb' }}
              size="middle"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
            <Space>
              <Button
                type="primary"
                onClick={handleCreate}
                style={{ backgroundColor: '#008cba', borderColor: '#008cba' }}
                size="middle"
              >
                Create Category
              </Button>
              <Button 
                onClick={() => {
                  setModalVisible(false);
                  setCategoryName('');
                  setErrors({});
                }}
                style={{ borderColor: '#1ab8cb', color: '#008cba' }}
                size="middle"
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

export default CategoriesManagement;
