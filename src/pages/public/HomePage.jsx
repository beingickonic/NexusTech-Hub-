import HeroSection from '../../components/HeroSection';
import TrustBadges from '../../components/TrustBadges';
import CategorySection from '../../components/CategorySection';
import FeaturedProducts from '../../components/FeaturedProducts';
import PromoBanner from '../../components/PromoBanner';
import NewArrivals from '../../components/NewArrivals';
import FeaturesGrid from '../../components/FeaturesGrid';
import Newsletter from '../../components/Newsletter';

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <TrustBadges />
      <CategorySection />
      <FeaturedProducts />
      <PromoBanner />
      <NewArrivals />
      <FeaturesGrid />
      <Newsletter />
    </>
  );
};

export default HomePage;
