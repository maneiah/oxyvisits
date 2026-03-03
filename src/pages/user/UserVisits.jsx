import React, { useState, useEffect } from 'react';
import { Card, Button, Spin, Empty, Table, Image } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import BASE_URL from '../../core/config/Config';
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
      render: (text) => <span>{text}</span>,
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
  ];

  return (
    <div className="p-4 md:p-6">
      <div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard/user-categories')}
          className="mb-4"
        >
          Back to Categories
        </Button>
        <div className="p-6 rounded-xl">
          <h1 className="text-xl md:text-1xl font-bold">
            My Visits {categoryName && <span>- {categoryName}</span>}
          </h1>
          <p className="mt-2">View and manage your personal visits</p>
        </div>
      </div>

      <Card className="rounded-xl">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" tip="Loading your visits..." />
          </div>
        ) : visits.length === 0 ? (
          <Empty 
            description="You haven't added any visits in this category yet"
            className="py-12"
          />
        ) : (
          <Table
            columns={columns}
            dataSource={visits}
            rowKey="visitId"
            loading={loading}
            bordered
            scroll={{ x: 'max-content' }}
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
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default UserVisits;
