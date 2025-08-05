import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ items }) => {
  return (
    <nav className="text-sm mb-6">
      <ol className="flex flex-wrap items-center space-x-1 text-gray-400">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-1 text-gray-500" />
            )}
            {item.href ? (
              <Link
                to={item.href}
                className="hover:underline hover:text-blue-400 transition font-medium text-white"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-300">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
