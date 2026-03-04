import React, { useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { useDataLayer } from '../hooks/useDataLayer';
import { formatPrice } from '../utils/format';

export const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const { products } = useProduct();
    const { pushEvent } = useDataLayer();

    const filteredProducts = useMemo(() => {
        if (!query.trim()) return [];
        const lowerQuery = query.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.brand.toLowerCase().includes(lowerQuery)
        );
    }, [query, products]);

    useEffect(() => {
        if (query) {
            pushEvent({
                event_category: 'view',
                event_name: 'search_results_viewed',
                event_description: 'User viewed search results',
                user_id: null,
                session_id: '',
                additional_params: {
                    search_term: query,
                    result_count: filteredProducts.length
                }
            });
        }
    }, [query, filteredProducts.length]);

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    Search Results for "{query}"
                </h2>

                {filteredProducts.length === 0 ? (
                    <div className="mt-12 text-center">
                        <p className="text-xl text-gray-500">No products found matching your search.</p>
                        <Link to="/" className="mt-6 inline-block text-indigo-600 hover:text-indigo-500">
                            Back to Home
                        </Link>
                    </div>
                ) : (
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
                    </div>
                )}
            </div>
        </div>
    );
};
