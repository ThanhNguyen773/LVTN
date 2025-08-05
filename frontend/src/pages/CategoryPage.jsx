import  { useEffect } from 'react'
import { useProductStore } from '../stores/useProductStore';
import { useParams } from 'react-router-dom';
import { motion } from "framer-motion";
import ProductCard from '../components/ProductCard';
import Breadcrumb from "../components/Breadcrumb";
import LoadingSpinner from '../components/LoadingSpinner';

const categoryLabels = {
  hg: "High Grade",
  rg: "Real Grade",
  mg: "Master Grade",
  pg: "Perfect Grade",
  sd: "Super Deformed",
  tools: "Tools",
  decal: "Paint & Decal",
  other: "Other Product",
  accessories: "Accessories",
};

const CategoryPage = () => {
	const { fetchProductsByCategory, products, loading } = useProductStore();

	const { category } = useParams();

	useEffect(() => {
		fetchProductsByCategory(category);
	}, [fetchProductsByCategory, category]);

  const label = categoryLabels[category] || category;

	const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "All Products", href: "/products" },
  { label: label }
];
  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen mb-12">
      {/* Background Gradient Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-b from-[#0a0a1f] to-transparent w-full py-6 shadow-sm"
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-3xl sm:text-5xl font-bold text-blue-300 mt-2 text-center">{label}</h1>
        </div>
      </motion.div>

      {/* Product List Section */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {products?.length === 0 && (
            <h2 className="text-3xl font-semibold text-gray-300 text-center col-span-full">
              No products foundcls
            </h2>
          )}
          {products?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </motion.div>
      </div>
    </div>

  )
};



export default CategoryPage;