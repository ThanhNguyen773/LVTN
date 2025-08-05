import { useEffect } from "react";
import CategoryItem from "../components/CategoryItem";
import FeaturedProducts from "../components/FeaturedProducts";
import { useProductStore } from "../stores/useProductStore";
import { Link } from "react-router-dom";
import BannerSlider from "../components/BannerSlider";
import NewProducts from "../components/NewProducts";

const categories = [
  { href: "/hg", name: "High Grade (HG)", imageUrl: "/hg.jpg" },
  { href: "/rg", name: "Real Grade (RG)", imageUrl: "/rg.jpg" },
  { href: "/mg", name: "Master Grade (MG)", imageUrl: "/mg.jpg" },
  { href: "/pg", name: "Perfect Grade (PG)", imageUrl: "/pg.jpg" },
  { href: "/sd", name: "Super Deformed (SD)", imageUrl: "/sd.jpg" },
  { href: "/tools", name: "Tools", imageUrl: "/tools.jpg" },
  { href: "/decal", name: "Paint & Decal", imageUrl: "/decal.jpg" },
  { href: "/other", name: "Other Product", imageUrl: "/other.jpg" },
  { href: "/accessories", name: "Accessories", imageUrl: "/accessories.jpg" }
];


const HomePage = () => {

  const {
    fetchFeaturedProducts,
    fetchAllProducts,
    featuredProducts = [],
    products = [],
    loading,
  } = useProductStore();


	useEffect(() => {
  fetchFeaturedProducts();
  fetchAllProducts(); 
}, []);



  return (
    <div className='relative min-h-screen text-white overflow-hidden'>
      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>

       
        <Link to="/products">
          <h1 title="See All Products" className='text-center text-5xl sm:text-6xl font-bold text-blue-300 mb-4 hover:text-blue-400 transition-colors duration-200 cursor-pointer'>
            Explore the World of Gundam
          </h1>
        </Link>
        
        <p className='text-center text-xl text-blue-100 mb-12 '  >
          From High Grade to Perfect Grade — your favorite Gunpla kits are here - Click "Explore the World of Gundam" to see all products
        </p>
        
         <BannerSlider />
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {categories.map(category => (
            <CategoryItem
              category={category}
              key={category.name}
            />
          ))}
        </div>
        {!loading && Array.isArray(featuredProducts)  && featuredProducts.length > 0 && <FeaturedProducts featuredProducts={featuredProducts} />}
        {/* {!isLoading && products.length > 0 && <FeaturedProducts featuredProducts={products} />} */}
        {!loading && Array.isArray(products) && products.length > 0 && (<NewProducts products={products} />)}
      </div>
      
    </div>
    
  );
};
 
export default HomePage;