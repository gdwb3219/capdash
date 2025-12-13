import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import DashboardPage from "./pages/DashboardPage";
import Layout from "./components/layouts/Layout";
import DashboardPage2 from "./pages/DashboardPage2";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard2" element={<DashboardPage2 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
