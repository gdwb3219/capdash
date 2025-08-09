import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  function toggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar isOpen={isSidebarOpen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {/* 페이지 컨텐츠가 이 부분에 렌더링됩니다. */}
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
