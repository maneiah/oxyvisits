import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Spin, Tag, Input, Space, Image } from 'antd';
import { ArrowLeftOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import BASE_URL from '../../core/config/Config';

const API_BASE = `${BASE_URL}/ai-service`;

const VisitsManagement = () => {
  const [visits, setVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const { categoryId } = useParams();

  useEffect(() => {
    if (categoryId) {
      fetchVisits();
    }
  }, [categoryId]);

  useEffect(() => {
    const filtered = visits.filter(visit =>
      visit.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      visit.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
      visit.location?.toLowerCase().includes(searchText.toLowerCase()) ||
      visit.contactNumber?.includes(searchText)
    );
    setFilteredVisits(filtered);
  }, [searchText, visits]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/visits?categoryId=${categoryId}`);
      setVisits(response.data.reverse());
      setFilteredVisits(response.data.reverse());
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
      title: "#",
      key: "sno",
      align: "center",
      render: (_, __, index) => (
        <span>{(currentPage - 1) * pageSize + index + 1}</span>
      ),
    },
    {
      title: "User",
      dataIndex: "userName",
      key: "userName",
      align: "center",
      render: (text) => (
        <div className="flex gap-2">
        
          <span>{text}</span>
        </div>
      ),
      sorter: (a, b) => a.userName.localeCompare(b.userName),
    },
    {
      title: "Visit Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (text) => <div>{text}</div>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      align: "center",
      render: (text) => <div>{text}</div>,
    },
    {
      title: "Contact",
      dataIndex: "contactNumber",
      key: "contactNumber",
      align: "center",
      render: (text) => <div>{text}</div>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      align: "center",
      render: (text) => (
        <div>
          {text?.length > 80 ? (
            <span title={text}>{text.substring(0, 80)}...</span>
          ) : (
            text
          )}
        </div>
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
            style={{ borderRadius: "8px", objectFit: "cover" }}
            preview={{
              mask: <div>View</div>,
            }}
          />
        ) : (
          <span>No image</span>
        ),
    },
    {
      title: "Website",
      dataIndex: "webLink",
      key: "webLink",
      align: "center",
      render: (link) =>
        link ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            Visit
          </a>
        ) : (
          <span>No link</span>
        ),
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard/categories')}
          className="mb-4"
        >
          Back to Categories
        </Button>
        
        <div className="p-2 md:p-4 rounded-xl">
          <h1 className="text-xl md:text-1xl font-bold">
            Visits Management
            {categoryName && (
              <span> - {categoryName}</span>
            )}
          </h1>
          <p className="mt-2">View and manage all visits in this category</p>
        </div>
      </div>
      
      <Card className="rounded-xl">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <Spin size="large" />
            <p className="mt-4">Loading visits...</p>
          </div>
        ) : (
          <>
            <div className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-bold">
                    All Visits
                  </h2>
                  <p className="text-sm">
                    Total: {filteredVisits.length} visits
                    {searchText && (
                      <span> (filtered from {visits.length})</span>
                    )}
                  </p>
                </div>
                <div className="w-full sm:w-auto">
                  <Input
                    placeholder="Search visits, users, locations..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    size="large"
                    style={{ minWidth: '300px' }}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6">
              <Table
                columns={columns}
                  dataSource={filteredVisits}
                   bordered
                rowKey="visitId"
                scroll={{ x: "100%" }}
                size="small"
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: filteredVisits.length,
                  showSizeChanger: true,
                  showQuickJumper: true,
                 
                  showTotal: (total, range) => (
                    `${range[0]}-${range[1]} of ${total} visits`
                  ),
                  pageSizeOptions: ['5', '10', '20', '50'],
                  onChange: (page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                  },
                }}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default VisitsManagement;