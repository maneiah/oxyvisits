import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { MailOutlined, LockOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import BASE_URL from '../core/config/Config';

function Register() {
  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailOtpSession, setEmailOtpSession] = useState('');
  const [salt, setSalt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async () => {
    if (!email) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please enter your email' });
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/user-service/userEmailPassword`, { email });
      setIsEmailSubmitted(true);
      setEmailOtpSession(response.data.emailOtpSession);
      setSalt(response.data.salt);
      Swal.fire({ icon: 'success', title: 'Success', text: 'OTP has been sent to your email', timer: 2000 });
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) && (err.response?.data?.error || err.response?.data?.message) || 'Network error. Please try again later.';
      Swal.fire({ icon: 'error', title: 'Error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOtp = async () => {
    if (!emailOtp) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please enter the OTP' });
      return;
    }
    if (!name) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please enter your name' });
      return;
    }
    if (!password) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please enter the password' });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/user-service/userEmailPassword`, {
        email,
        emailOtp,
        emailOtpSession,
        password,
        primaryType: 'EMPLOYEE',
        salt,
        name,
      });

      if (response.data.userId !== null) {
        Swal.fire({ icon: 'success', title: 'Success', text: 'Registration successful!', timer: 2000 });
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) && (err.response?.data?.error || err.response?.data?.message) || 'OTP verification failed';
      Swal.fire({ icon: 'error', title: 'Error', text: errorMessage });
    } finally {
      setLoading(false);
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
          <p className="text-gray-500 text-sm">Create your account to get started</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 text-center">Register</h2>

          <Form layout="vertical">
            {!isEmailSubmitted ? (
              <>
                <Form.Item label={<span className="text-gray-700 font-medium text-sm">Email Address</span>} required>
                  <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    size="large"
                    className="rounded-lg"
                  />
                </Form.Item>

                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={handleEmailSubmit}
                  loading={loading}
                  className="h-12 text-base font-medium rounded-lg"
                  style={{ background: 'linear-gradient(to right, #10b981, #059669)', border: 'none' }}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </>
            ) : (
              <>
                <Form.Item label={<span className="text-gray-700 font-medium text-sm">Email Address</span>} required>
                  <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    type="email"
                    value={email}
                    disabled
                    size="large"
                    className="rounded-lg bg-gray-50"
                  />
                </Form.Item>

                <Form.Item label={<span className="text-gray-700 font-medium text-sm">OTP</span>} required>
                  <Input
                    prefix={<SafetyOutlined className="text-gray-400" />}
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    size="large"
                    className="rounded-lg"
                  />
                </Form.Item>

                <Form.Item label={<span className="text-gray-700 font-medium text-sm">Full Name</span>} required>
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    size="large"
                    className="rounded-lg"
                  />
                </Form.Item>

                <Form.Item label={<span className="text-gray-700 font-medium text-sm">Password</span>} required>
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    size="large"
                    className="rounded-lg"
                  />
                </Form.Item>

                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={handleSubmitOtp}
                  loading={loading}
                  className="h-12 text-base font-medium rounded-lg"
                  style={{ background: 'linear-gradient(to right, #10b981, #059669)', border: 'none' }}
                >
                  {loading ? 'Verifying...' : 'Verify & Register'}
                </Button>
              </>
            )}

            <div className="text-center mt-6">
              <span className="text-gray-600 text-sm">Already have an account? </span>
              <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700 text-sm">
                Login
              </Link>
            </div>
          </Form>
        </div>

        <div className="text-center mt-6 text-gray-500 text-xs">
          <p>© {new Date().getFullYear()} OXYVISITS. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default Register;
