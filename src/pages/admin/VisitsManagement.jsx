import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Spin, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import BASE_URL from '../../core/config/Config';

const API_BASE = `${BASE_URL}/ai-service`;

const VisitsManagement = () => {
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
      const response = await axios.get(`${API_BASE}/visits?categoryId=${categoryId}`);
      setVisits(response.data.reverse());
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
      title: 'S.No',
      key: 'sno',
      align: 'center',
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
      width: 70,
      responsive: ['md'],
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      align: 'center',
      responsive: ['md'],
    },
    {
      title: 'Contact Number',
      dataIndex: 'contactNumber',
      key: 'contactNumber',
      align: 'center',
    },
  
    {
      title: 'Web Link',
      dataIndex: 'webLink',
      key: 'webLink',
      align: 'center',
      render: (link) => link ? <a href={link} target="_blank" rel="noopener noreferrer">View</a> : '-',
      responsive: ['lg'],
    },
    {
      title: 'User Name',
      dataIndex: 'userName',
      key: 'userName',
      align: 'center',
      responsive: ['md'],
    },
    
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      align: 'center',
      render: (url) => url ? <a href={url} target="_blank" rel="noopener noreferrer">View</a> : '-',
      responsive: ['lg'],
    },
  
   
  ];

  return (
    <div>
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard/categories')}
          style={{ backgroundColor: '#008cba', borderColor: '#008cba', color: 'white', marginBottom: '16px' }}
        >
          Back to Categories
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Visits Management {categoryName && `- ${categoryName}`}
        </h1>
        <p className="text-gray-600 mt-2">View and manage all visits in this category</p>
      </div>
      
      <Card>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={visits}
            rowKey="visitId"
            scroll={{ x: 800 }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: visits.length,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`,
              pageSizeOptions: ['5', '10', '20', '50'],
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
              bordered
          />
        )}
      </Card>
    </div>
  );
};

export default VisitsManagement;
