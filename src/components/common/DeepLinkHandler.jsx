import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';

const DeepLinkHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let appUrlOpenListener;

    const setupDeepLinks = async () => {
      appUrlOpenListener = await CapacitorApp.addListener('appUrlOpen', (event) => {
        // Example URL: nexustechhub://products/123
        const slug = event.url.split('nexustechhub://').pop();
        if (slug) {
          // ensure the slug starts with a forward slash for internal navigation
          navigate(`/${slug}`);
        }
      });
    };

    setupDeepLinks();

    return () => {
      if (appUrlOpenListener) {
        appUrlOpenListener.remove();
      }
    };
  }, [navigate]);

  return null;
};

export default DeepLinkHandler;
