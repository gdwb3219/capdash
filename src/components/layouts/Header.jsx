import { ChevronLeft, Menu } from 'lucide-react';

function Header({ onToggleSidebar, isSidebarOpen }) {
  const headerStyle = {
    padding: '1rem 2rem',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
  };

  const buttonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginRight: '1rem',
  };

  return (
    <header style={headerStyle}>
      <button onClick={onToggleSidebar} style={buttonStyle}>
        {isSidebarOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
      </button>
      <h2>페이지 제목</h2>
    </header>
  );
}

export default Header;
