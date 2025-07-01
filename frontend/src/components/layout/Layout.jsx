import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gradient-radial dark:from-[#4a0046] dark:via-[#2d002f] dark:to-[#1d001f]">
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