
import CategoryItem from "../components/CategoryItem";


const categories = [
  { href: "/hg", name: "High Grade (HG)", imageUrl: "/hg.jpg" },
  { href: "/rg", name: "Real Grade (RG)", imageUrl: "/rg.jpg" },
  { href: "/mg", name: "Master Grade (MG)", imageUrl: "/mg.jpg" },
  { href: "/pg", name: "Perfect Grade (PG)", imageUrl: "/pg.jpg" },
  { href: "/sd", name: "Super Deformed (SD)", imageUrl: "/sd.jpg" },
  { href: "/tools", name: "Tools", imageUrl: "/tools.jpg" },
  { href: "/decal", name: "Paint & Decal", imageUrl: "/decal.jpg" }
];


const HomePage = () => {
  return (
    <div className='relative min-h-screen text-white overflow-hidden'>
      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <h1 className='text-center text-5xl sm:text-6xl font-bold text-blue-300 mb-4'>
          Explore the World of Gundam
        </h1>
        <p className='text-center text-xl text-blue-100 mb-12'>
          From High Grade to Perfect Grade — your favorite Gunpla kits are here 
        </p>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {categories.map(category => (
            <CategoryItem
              category={category}
              key={category.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
 
export default HomePage;