import React, { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import BASE_URL from "../core/config/Config";

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Please enter your password';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      triggerShakeAnimation();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        email: email.trim(),
        password: password,
      };

      const response = await axios.post(
        `${BASE_URL}/user-service/userEmailPassword`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      if (response.data?.status === "Login Successful") {
        localStorage.setItem("token", response.data.accessToken || response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("primaryType", response.data.primaryType);
        localStorage.setItem("userId", response.data.userId);
        localStorage.setItem("lastLogin", new Date().toISOString());
        localStorage.setItem("savedEmail", email.trim());

        const primaryType = response.data.primaryType;

        if (primaryType === "EMPLOYEE" || primaryType === "HELPDESKADMIN" || primaryType === "HELPDESKSUPERADMIN") {
          message.success("Login successful! Redirecting...", 2);
          setTimeout(() => {
            if (primaryType === "HELPDESKSUPERADMIN" || primaryType === "HELPDESKADMIN") {
              navigate("/dashboard/categories");
            } else if (primaryType === "EMPLOYEE") {
              navigate("/dashboard/user-categories");
            }
          }, 1000);
        } else {
          setError("Access denied. Invalid user type.");
          triggerShakeAnimation();
        }
      } else {
        setError("Invalid credentials. Please try again.");
        triggerShakeAnimation();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.status || error.response?.data?.message || "Authentication failed.";
      setError(errorMsg);
      triggerShakeAnimation();
    } finally {
      setLoading(false);
    }
  };

  const triggerShakeAnimation = () => {
    const formElement = document.querySelector(".login-form");
    if (formElement) {
      formElement.classList.add("shake-animation");
      setTimeout(() => formElement.classList.remove("shake-animation"), 500);
    }
  };

  return (
    <div className="min-h-screen min-w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="text-emerald-600">OXY</span>
            <span className="text-orange-500">VISITS</span>
          </h1>
          <p className="text-gray-500 text-sm">Welcome back! Please login to continue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 text-center">Sign In</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start text-sm">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <Form layout="vertical" className="login-form">
            <Form.Item
              label={<span className="text-gray-700 font-medium text-sm">Email Address</span>}
              validateStatus={errors.email ? 'error' : ''}
              help={errors.email || ''}
            >
              <Input 
                size="large" 
                type="email" 
                placeholder="your.email@example.com" 
                prefix={<UserOutlined className="text-gray-400" />} 
                className="rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-700 font-medium text-sm">Password</span>}
              validateStatus={errors.password ? 'error' : ''}
              help={errors.password || ''}
            >
              <Input.Password 
                size="large" 
                placeholder="Enter your password" 
                prefix={<LockOutlined className="text-gray-400" />} 
                className="rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button 
                type="primary" 
                onClick={handleLogin} 
                loading={loading} 
                size="large" 
                block 
                className="h-12 text-base font-medium rounded-lg" 
                style={{ background: "linear-gradient(to right, #10b981, #059669)", border: "none" }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-6">
            <span className="text-gray-600 text-sm">Don't have an account? </span>
            <Link to="/register" className="text-emerald-600 font-semibold hover:text-emerald-700 text-sm">
              Register
            </Link>
          </div>
        </div>

        <div className="text-center mt-6 text-gray-500 text-xs">
          <p>© {new Date().getFullYear()} OXYVISITS. All rights reserved.</p>
        </div>
      </div>

      <style>{`
        .shake-animation {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
}

export default AdminLogin;
