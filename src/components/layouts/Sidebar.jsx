import { Link } from 'react-router-dom';

function Sidebar({ isOpen }) {
  const sidebarStyle = {
    width: isOpen ? '250px' : '0',
    backgroundColor: '#1a202c',
    color: 'white',
    padding: isOpen ? '2rem 1rem' : '0',
    transition: 'width 0.3s ease-in-out',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    whiteSpace: 'nowrap',
  };

  const linkStyle = {
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    transition: 'background-color 0.2s',
  };

  function handleMouseEnter(e) {
    e.currentTarget.style.backgroundColor = '#2d3748';
  }

  function handleMouseLeave(e) {
    e.currentTarget.style.backgroundColor = 'transparent';
  }

  return (
    <aside style={sidebarStyle}>
      <h1 style={{ textAlign: 'center', margin: '0 0 2rem 0' }}>My App</h1>
      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        <Link
          to="/"
          style={linkStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          홈
        </Link>
        <Link
          to="/about"
          style={linkStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          소개
        </Link>
        <Link
          to="/dashboard"
          style={linkStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          대시보드
        </Link>
      </nav>
    </aside>
  );
}

export default Sidebar;
