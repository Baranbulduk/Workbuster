import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto lg:ml-0">
        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout; 