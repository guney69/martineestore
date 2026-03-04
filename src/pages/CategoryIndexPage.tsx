import React from 'react';
import { Link } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';

export const CategoryIndexPage: React.FC = () => {
    const { categories } = useProduct();
    return (
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8">Categories</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {categories.map(cat => (
                    <Link key={cat} to={`/categories/${encodeURIComponent(cat)}`} className="block p-8 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
                        <span className="text-xl font-medium text-gray-900">{cat}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export const BrandIndexPage: React.FC = () => {
    const { brands } = useProduct();
    return (
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8">Brands</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {brands.map(brand => (
                    <Link key={brand} to={`/brands/${encodeURIComponent(brand)}`} className="block p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
                        <span className="text-md font-medium text-gray-900">{brand}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};
