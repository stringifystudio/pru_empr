import React from 'react';
import { Link } from 'react-router-dom';
import { Shirt, Gem, Watch, ShoppingBag, BadgePercent, Footprints } from 'lucide-react';
import { Category } from '../../types';

interface CategoryListProps {
  categories: Category[];
}

const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  const getIconForCategory = (iconName: string) => {
    switch (iconName) {
      case 'shirt':
        return <Shirt size={24} className="mb-2" />;
      case 'gem':
        return <Gem size={24} className="mb-2" />;
      case 'watch':
        return <Watch size={24} className="mb-2" />;
      case 'shopping-bag':
        return <ShoppingBag size={24} className="mb-2" />;
      case 'badge-percent':
        return <BadgePercent size={24} className="mb-2" />;
      case 'footprints':
        return <Footprints size={24} className="mb-2" />;
      default:
        return <Shirt size={24} className="mb-2" />;
    }
  };

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Browse Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.id}`}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 text-center"
          >
            <div className="text-blue-600 mb-2">
              {getIconForCategory(category.icon)}
            </div>
            <span className="text-sm font-medium text-gray-700">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;