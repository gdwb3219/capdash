function Footer() {
  const footerStyle = {
    padding: '1rem 2rem',
    backgroundColor: '#e2e8f0',
    textAlign: 'center',
    color: '#4a5568',
    marginTop: 'auto',
  };

  return (
    <footer style={footerStyle}>
      <p>&copy; {new Date().getFullYear()} My App. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
