import React, { useEffect } from 'react';
import { useProduct } from '../context/ProductContext';
import { useDataLayer } from '../hooks/useDataLayer';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';

export const MainPage: React.FC = () => {
    const { products } = useProduct();
    const { pushEvent } = useDataLayer();

    // Get top ranking products
    const rankingProducts = [...products]
        .sort((a, b) => b.sales_count - a.sales_count)
        .slice(0, 10);

    useEffect(() => {
        pushEvent({
            event_category: 'page_view',
            event_name: 'main_page_viewed',
            event_description: 'Main page viewed',
            user_id: null,
            session_id: '',
            additional_params: {}
        });
    }, []);

    return (
        <div className="bg-white">
            {/* Banner */}
            <div className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:mx-0">
                        <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">New Arrivals</h2>
                        <p className="mt-6 text-lg leading-8 text-gray-300">
                            Check out the latest trends in our summer collection.
                        </p>
                    </div>
                </div>
            </div>

            {/* Ranking */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Top Selling</h2>
                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                    {rankingProducts.map((product, index) => (
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
                            <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                                Rank {index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
