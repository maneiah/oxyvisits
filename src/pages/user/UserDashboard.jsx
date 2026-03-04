import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Table,
  Image,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Upload,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  AppstoreOutlined,
  EditOutlined,
  SearchOutlined,
  UploadOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import BASE_URL from "../../core/config/Config";

const { Title, Text } = Typography;

const API_BASE = `${BASE_URL}/ai-service`;

const UserDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    categories: 0,
    visits: 0,
    todayVisits: 0,
  });
  const [userVisits, setUserVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    contactNumber: "",
    description: "",
    webLink: "",
    image: null,
  });
  const [errors, setErrors] = useState({});
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const filtered = userVisits.filter((visit) => {
      const q = (searchText || "").toLowerCase();
      return (
        (visit.categoryName || "").toLowerCase().includes(q) ||
        (visit.name || "").toLowerCase().includes(q)
      );
    });

    setFilteredVisits(filtered);

    const uniqueCategories = new Set(filtered.map((v) => v.categoryId)).size;
    const today = new Date().toISOString().split("T")[0];
    const todayCount = filtered.filter((visit) => {
      const dateField = visit.createdAt || visit.createdDate;
      if (!dateField) return false;
      const visitDate = String(dateField).split(" ")[0];
      return visitDate === today;
    }).length;

    setStats({
      categories: uniqueCategories,
      visits: filtered.length,
      todayVisits: todayCount,
    });
  }, [searchText, userVisits]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const userIdLocal = localStorage.getItem("userId");
      const categoriesUrl = `${API_BASE}/categories`;
      const visitsUrl = `${API_BASE}/visits?userId=${userIdLocal}`;

      const categoriesRes = await axios.get(categoriesUrl);
      const visitsRes = await axios.get(visitsUrl);

      const activeCategories = (categoriesRes.data || []).filter(
        (cat) => cat.active,
      ).length;
      const today = new Date().toISOString().split("T")[0];

      const todayVisits = (visitsRes.data || []).filter((visit) => {
        const dateField = visit.createdAt || visit.createdDate;
        if (!dateField) return false;
        const visitDate = String(dateField).split(" ")[0];
        return visitDate === today;
      }).length;

      if (visitsRes.data?.length > 0 && visitsRes.data[0].userName) {
        localStorage.setItem("userName", visitsRes.data[0].userName);
      }

      setStats({
        categories: activeCategories,
        visits: visitsRes.data?.length || 0,
        todayVisits,
      });

      setUserVisits(visitsRes.data || []);
      setFilteredVisits(visitsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      console.error("Error response:", error?.response);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Visit name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^[0-9]+$/.test(formData.contactNumber)) {
      newErrors.contactNumber = "Must be only digits";
    }

    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.webLink && !/^https?:\/\/.+/.test(formData.webLink)) {
      newErrors.webLink = "Must be a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (visit) => {
    setSelectedVisit(visit);
    setFormData({
      name: visit.name || "",
      location: visit.location || "",
      contactNumber: visit.contactNumber || "",
      description: visit.description || "",
      webLink: visit.webLink || "",
      image: null,
    });
    setEditModalVisible(true);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Geolocation is not supported by your browser.",
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
          icon: "error",
          title: "Error",
          text: "Unable to get location. Please enable location access.",
        });
      },
    );
  };

  const handleUpdateVisit = async () => {
    if (!validateForm()) return;

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("location", formData.location);
      data.append("contactNumber", formData.contactNumber);
      data.append("description", formData.description);
      if (formData.webLink) data.append("webLink", formData.webLink);
      if (formData.image) data.append("image", formData.image);

      const token = localStorage.getItem("token");

      await axios.patch(
        `${API_BASE}/visits/${selectedVisit.visitId}?userId=${userId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Visit updated successfully",
        timer: 2000,
      });

      setEditModalVisible(false);
      setSelectedVisit(null);
      setFormData({
        name: "",
        location: "",
        contactNumber: "",
        description: "",
        webLink: "",
        image: null,
      });
      setErrors({});
      fetchStats();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to update visit";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "S.No",
        key: "sno",
        align: "center",
        render: (_, __, index) => <span>{index + 1}</span>,
      
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
        title: "Contact",
        dataIndex: "contactNumber",
        key: "contactNumber",
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
        title: "Description",
        dataIndex: "description",
        key: "description",
        align: "center",
        render: (text) => (
          <span>
            {text?.length > 50 ? `${text.substring(0, 50)}...` : text}
          </span>
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
      // {
      //   title: "Web Link",
      //   dataIndex: "webLink",
      //   key: "webLink",
      //   align: "center",
      //   render: (link) =>
      //     link ? (
      //       <a href={link} target="_blank" rel="noopener noreferrer">
      //         Visit Site
      //       </a>
      //     ) : (
      //       <span>-</span>
      //     ),
      // },
      {
        title: "Action",
        key: "action",
        align: "center",
        render: (_, record) => (
          <Button icon={<EditOutlined />} style={{color:"white",backgroundColor:"#008cba"}} onClick={() => handleEdit(record)}>
            Edit
          </Button>
        ),
      },
      {
        title: "Created Date",
        dataIndex: "createdAt",
        key: "createdAt",
        align: "center",
        render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
      },
    ],
    [],
  );

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 240,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      {/* Top: Left title + Right search (responsive) */}
      <Row
        gutter={[12, 12]}
        align="middle"
        justify="space-between"
        style={{ marginBottom: 12 }}
      >
        <Col xs={24} md={12}>
          <Title level={3} style={{ margin: 0 }}>
            My Visits
          </Title>
          <Text type="secondary">User Visits Dashboard</Text>
        </Col>

        <Col xs={24} md={12}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Input
              placeholder="Search by category or visit name..."
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

      {/* Stats Cards */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            onClick={() => navigate("/dashboard/user-categories")}
            style={{
              cursor: "pointer",
              borderRadius: 14,
              background:
                "linear-gradient(135deg, rgba(24,144,255,0.18), rgba(24,144,255,0.06))",
              border: "1px solid rgba(24,144,255,0.25)",
            }}
          >
            <Statistic
              title="Categories"
              value={stats.categories}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            onClick={() => navigate("/dashboard/user-all-visits")}
            style={{
              cursor: "pointer",
              borderRadius: 14,
              background:
                "linear-gradient(135deg, rgba(82,196,26,0.18), rgba(82,196,26,0.06))",
              border: "1px solid rgba(82,196,26,0.25)",
            }}
          >
            <Statistic
              title="My Visits"
              value={stats.visits}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            style={{
              borderRadius: 14,
              background:
                "linear-gradient(135deg, rgba(255,77,79,0.18), rgba(255,77,79,0.06))",
              border: "1px solid rgba(255,77,79,0.25)",
            }}
          >
            <Statistic
              title="Today's Visits"
              value={stats.todayVisits}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card style={{ marginTop: 14, borderRadius: 14 }}>
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
      </Card>

      {/* Edit Modal */}
      <Modal
        title={
          <span style={{ fontWeight: 700, color: "#008cba" }}>
            Edit Visit
            {selectedVisit?.categoryName
              ? ` - ${selectedVisit.categoryName}`
              : ""}
          </span>
        }
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedVisit(null);
          setFormData({
            name: "",
            location: "",
            contactNumber: "",
            description: "",
            webLink: "",
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
                label={<span style={{ color: "#008cba", fontWeight: 600 }}>Visit Name</span>}
                validateStatus={errors.name ? "error" : ""}
                help={errors.name || ""}
              >
                <Input
                  size="middle"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter visit name"
                  style={{ borderColor: "#1ab8cb" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span style={{ color: "#008cba", fontWeight: 600 }}>Contact Number</span>}
                validateStatus={errors.contactNumber ? "error" : ""}
                help={errors.contactNumber || ""}
              >
                <Input
                  size="middle"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, contactNumber: e.target.value })
                  }
                  placeholder="Enter contact number"
                  style={{ borderColor: "#1ab8cb" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span style={{ color: "#008cba", fontWeight: 600 }}>Location</span>}
                validateStatus={errors.location ? "error" : ""}
                help={errors.location || ""}
              >
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    size="middle"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Click 'Get Location' for current position"
                    style={{ borderColor: "#1ab8cb" }}
                  />
                  <Button
                    size="middle"
                    onClick={getCurrentLocation}
                    icon={<EnvironmentOutlined />}
                    style={{ backgroundColor: "#008cba", borderColor: "#008cba", color: "white" }}
                  >
                    Get Location
                  </Button>
                </Space.Compact>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span style={{ color: "#008cba", fontWeight: 600 }}>Web Link</span>}
                validateStatus={errors.webLink ? "error" : ""}
                help={errors.webLink || ""}
              >
                <Input
                  size="middle"
                  value={formData.webLink}
                  onChange={(e) =>
                    setFormData({ ...formData, webLink: e.target.value })
                  }
                  placeholder="https://example.com"
                  style={{ borderColor: "#1ab8cb" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span style={{ color: "#008cba", fontWeight: 600 }}>Description</span>}
                validateStatus={errors.description ? "error" : ""}
                help={errors.description || ""}
              >
                <Input.TextArea
                  size="middle"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  placeholder="Enter description"
                  style={{ borderColor: "#1ab8cb" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span style={{ color: "#008cba", fontWeight: 600 }}>Image</span>}>
                <Upload
                  maxCount={1}
                  beforeUpload={(file) => {
                    setFormData({ ...formData, image: file });
                    return false;
                  }}
                  onRemove={() => setFormData({ ...formData, image: null })}
                  listType="picture"
                >
                  <Button 
                    size="middle" 
                    icon={<UploadOutlined />}
                    style={{ borderColor: "#1ab8cb", color: "#008cba" }}
                  >
                    Select Image
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
            <Space>
              <Button 
                type="primary" 
                onClick={handleUpdateVisit} 
                size="middle"
                style={{ backgroundColor: "#008cba", borderColor: "#008cba" }}
              >
                Update Visit
              </Button>
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  setSelectedVisit(null);
                  setFormData({
                    name: "",
                    location: "",
                    contactNumber: "",
                    description: "",
                    webLink: "",
                    image: null,
                  });
                  setErrors({});
                }}
                size="middle"
                style={{ borderColor: "#1ab8cb", color: "#008cba" }}
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

export default UserDashboard;
