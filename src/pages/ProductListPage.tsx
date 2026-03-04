import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { useDataLayer } from '../hooks/useDataLayer';
import { formatPrice } from '../utils/format';

export const ProductListPage: React.FC<{ type: 'category' | 'brand' }> = ({ type }) => {
    const { id } = useParams<{ id: string }>(); // category name or brand name
    const { products, categories, brands } = useProduct();
    const { pushEvent } = useDataLayer();

    // Determine the list items based on type
    const navItems = type === 'category' ? categories : brands;
    const linkPrefix = type === 'category' ? '/categories' : '/brands';

    // Filter products
    const filteredProducts = products.filter(p =>
        type === 'category' ? p.category === id : p.brand === id
    );

    useEffect(() => {
        pushEvent({
            event_category: 'view',
            event_name: type === 'category' ? 'category_list_viewed' : 'brand_list_viewed',
            event_description: `User viewed ${type} list`,
            user_id: null,
            session_id: '',
            additional_params: { [type]: id }
        });
    }, [id, type]);

    return (
        <div className="bg-white">
            {/* Horizontal GNB */}
            <div className="border-b border-gray-200 bg-white sticky top-16 z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 overflow-x-auto py-4 scrollbar-hide">
                        {navItems.map((item) => (
                            <Link
                                key={item}
                                to={`${linkPrefix}/${encodeURIComponent(item)}`}
                                className={`whitespace-nowrap text-sm font-medium ${item === id
                                    ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 capitalize">{id}</h2>
                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="group relative">
                            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                                />
                            </div>
                            <div className="mt-4 flex justify-between">
                                <div>
                                    <h3 className="text-sm text-gray-700">
                                        <Link to={`/product/${product.id}`}>
                                            <span aria-hidden="true" className="absolute inset-0" />
                                            {product.name}
                                        </Link>
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-900">{formatPrice(product.price)}</p>
                            </div>
                        </div>
                    ))}
                    {filteredProducts.length === 0 && (
                        <p className="text-gray-500 col-span-full text-center py-10">No products found for this {type}.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
