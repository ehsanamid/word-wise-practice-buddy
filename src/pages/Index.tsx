
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/components/auth/Login';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {user ? <Dashboard /> : <Login />}
    </div>
  );
};

export default Index;
