import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopHeader from '../components/TopHeader';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const PublicLayout = () => {
  return (
    <div className="min-h-screen font-sans flex flex-col transition-colors duration-300">
      <ScrollToTop />
      <TopHeader />
      <Navbar />
      <main className="flex-grow relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
