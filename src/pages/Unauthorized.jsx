import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary" onClick={() => navigate('/login')}>
            Back to Login
          </Button>
        }
      />
    </div>
  );
};

export default Unauthorized;
