import React, { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Dropdown, Button } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  TeamOutlined,
  FileTextOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Header, Sider, Content, Footer } = Layout;

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const primaryType = localStorage.getItem("primaryType");
 
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const userMenu = {
    items: [
     
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Logout",
        onClick: handleLogout,
      },
    ],
  };

  const getMenuItems = () => {
    if (primaryType === "HELPDESKADMIN" || primaryType === "HELPDESKSUPERADMIN") {
      return [
        {
          key: "/dashboard/categories",
          icon: <AppstoreOutlined />,
          label: "Categories",
          onClick: () => navigate("/dashboard/categories"),
        },
      ];
    }

    return [
      {
        key: "/dashboard/user-categories",
        icon: <AppstoreOutlined />,
        label: "Categories",
        onClick: () => navigate("/dashboard/user-categories"),
      },
     
     
    ];
  };

  return (
    <Layout style={{ minHeight: "100vh", width: "100%" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth={isMobile ? 0 : 80}
        width={240}
        style={{ background: "#1a202c" }}
      >
        <div
          className="flex items-center justify-center h-16"
          style={{ background: "#0f172a" }}
        >
          <h1 className="text-white font-bold text-lg">
            {collapsed ? "OXY" : "OXYVISITS"}
          </h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          style={{ background: "#1a202c", borderRight: 0 }}
          className="custom-menu"
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <div className="flex justify-between items-center px-4 md:px-6">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: "16px", width: 64, height: 64 }}
            />
            <div className="flex items-center gap-2 md:gap-4">
              <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">
                {primaryType === "HELPDESKADMIN" ||
                primaryType === "HELPDESKSUPERADMIN"
                  ? "Admin Panel"
                  : "User Panel"}
              </span>
              <Dropdown menu={userMenu} placement="bottomRight">
                <Avatar
                  style={{ backgroundColor: "#008cba", cursor: "pointer" }}
                  icon={<UserOutlined />}
                />
              </Dropdown>
            </div>
          </div>
        </Header>
        <Content
          style={{
            margin: "16px",
            padding: "16px",
            background: "#fff",
            minHeight: 280,
            borderRadius: "8px",
          }}
          className="md:m-6 md:p-6"
        >
          <Outlet />
        </Content>
        <Footer
          style={{
            textAlign: "center",
            background: "#f9fafb",
            padding: "16px",
          }}
        >
          <div className="text-gray-600 text-xs md:text-sm">
            © {new Date().getFullYear()} OXYVISITS. All rights reserved.
          </div>
        </Footer>
      </Layout>
      <style>{`
        .ant-menu::-webkit-scrollbar { width: 5px; }
        .ant-menu::-webkit-scrollbar-track { background: #1a202c; }
        .ant-menu::-webkit-scrollbar-thumb { background-color: #4a5568; border-radius: 10px; }
        .ant-menu { scrollbar-width: thin; scrollbar-color: #4a5568 #1a202c; }

        .ant-layout-sider::-webkit-scrollbar { width: 5px; }
        .ant-layout-sider::-webkit-scrollbar-track { background: #1a202c; }
        .ant-layout-sider::-webkit-scrollbar-thumb { background-color: #4a5568; border-radius: 10px; }
        .ant-layout-sider { scrollbar-width: thin; scrollbar-color: #4a5568 #1a202c; }

        .ant-menu-dark,
        .ant-menu-dark .ant-menu-sub,
        .ant-layout-sider .ant-menu {
          background: #1a202c;
          color: #e2e8f0;
        }

        .ant-layout-sider .ant-menu-item,
        .ant-layout-sider .ant-menu-submenu-title {
          color: #e2e8f0;
        }

        .ant-layout-sider .ant-menu-item a,
        .ant-layout-sider .ant-menu-submenu-title span {
          color: #e2e8f0;
        }

        .ant-layout-sider .ant-menu-item:hover,
        .ant-layout-sider .ant-menu-item-active,
        .ant-layout-sider .ant-menu-submenu-title:hover,
        .ant-layout-sider .ant-menu-submenu-open,
        .ant-layout-sider .ant-menu-item-selected {
          background-color: #2d3748 !important;
          color: #ffffff !important;
        }

        .ant-layout-sider .ant-menu-item:hover a,
        .ant-layout-sider .ant-menu-item-active a,
        .ant-layout-sider .ant-menu-item-selected a,
        .ant-layout-sider .ant-menu-submenu-title:hover span {
          color: #ffffff !important;
        }

        .custom-menu .ant-menu-item:hover {
          background-color: #374151 !important;
        }
        .custom-menu .ant-menu-item-selected {
          background-color: #374151 !important;
        }
        @media (max-width: 768px) {
          .ant-layout-sider {
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 999;
          }
        }
      `}</style>
    </Layout>
  );
};

export default DashboardLayout;
