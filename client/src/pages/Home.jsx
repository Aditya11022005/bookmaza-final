import { useState, useEffect } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import HeroSlider from '../components/home/HeroSlider';
import CategoryGrid from '../components/home/CategoryGrid';
import BookSlider from '../components/home/BookSlider';
import FeaturesList from '../components/home/FeaturesList';
import PromotionalBanner from '../components/home/PromotionalBanner';
import Testimonials from '../components/home/Testimonials';
import Newsletter from '../components/home/Newsletter';
import axios from '../api/axios';

const Home = () => {
  usePageMeta('Home', 'Pustak Maza is a premium publication house offering ebooks, audiobooks, and hardcopy books in English and Marathi.');
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: booksData } = await axios.get('/books');
        setFeaturedBooks(booksData);
      } catch (err) {
        console.error(err);
      }
      try {
        const { data: bannersData } = await axios.get('/banners');
        setBanners(bannersData);
      } catch (err) {
        console.error(err);
      }
      try {
        const { data: catsData } = await axios.get('/categories');
        setCategories(catsData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const heroBanners = banners.filter(b => b.type === 'hero' || !b.type);
  const promoBanner = banners.find(b => b.type === 'promo');

  return (
    <div className="flex flex-col bg-[#f8fafc] w-full pt-0">
      {/* 1. Hero Matrix */}
      <HeroSlider banners={heroBanners} />

      {/* 2. Categorization Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-20">
        <CategoryGrid categories={categories} />
      </div>

      {/* 3. Primary Trending */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pb-16">
        <BookSlider 
          title="Trending Now" 
          subtitle="Discover what readers are obsessed with this month." 
          books={featuredBooks} 
          badge="TRENDING" 
        />
      </div>

      {/* 4. Best Sellers Layout Zone */}
      <div className="w-full bg-white border-y border-[#e2e8f0] py-16 mb-20 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
          <BookSlider 
            title="Best Sellers" 
            subtitle="Our highest-rated titles across all genres." 
            books={[...featuredBooks].reverse()} 
            badge="BESTSELLER"
          />
        </div>
      </div>

      {/* 5. Promotional Event */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        <PromotionalBanner banner={promoBanner} />
      </div>

      {/* 6. Why Choose Us / Trust Features */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-16">
        <FeaturesList />
      </div>

      {/* 7. Readership Verification */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pb-16">
        <Testimonials />
      </div>

      {/* 8. Conversion Capture */}
      <Newsletter />
    </div>
  );
};

export default Home;
