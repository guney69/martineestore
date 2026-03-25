import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useDataLayer } from '../hooks/useDataLayer';
import { useSession } from '../context/SessionContext';
import { formatPrice } from '../utils/format';
import { formatProductForBraze } from '../utils/analyticsHelpers';

export const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getProduct, toggleLike } = useProduct();
    const { addToCart } = useCart();
    const { pushEvent } = useDataLayer();
    const { sessionId } = useSession();
    const navigate = useNavigate();

    const product = getProduct(id || '');

    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');

    useEffect(() => {
        if (product) {
            pushEvent({
                event_category: 'view',
                event_name: 'item_detail_page_viewed',
                event_description: 'Product detail page viewed',
                user_id: null,
                session_id: sessionId,
                additional_params: formatProductForBraze(product)
            });
        }
    }, [product, sessionId]);

    if (!product) {
        return <div className="p-10 text-center">Product not found</div>;
    }

    const handleAddToCart = () => {
        if (!selectedSize || !selectedColor) {
            alert('Please select size and color');
            return;
        }
        addToCart(product, selectedSize, selectedColor);
        if (confirm('Item added to cart. Go to cart?')) {
            navigate('/cart');
        }
    };

    const handleLike = () => {
        toggleLike(product.id);
        const eventName = !product.is_liked ? 'item_added_to_liked' : 'item_deleted_from_liked';
        pushEvent({
            event_category: 'interaction',
            event_name: eventName,
            event_description: 'User toggled like',
            user_id: null,
            session_id: sessionId,
            additional_params: { 
                category1_name: product.category,
                category1_id: null,
                brand_name: product.brand,
                brand_id: null,
                item_name: product.name,
                item_id: product.id
            }
        });
    };

    return (
        <div className="bg-white">
            <div className="pt-6 pb-16 sm:pb-24">
                <div className="mx-auto mt-8 max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                        {/* Image */}
                        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-100 sm:aspect-h-3 sm:aspect-w-2">
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover object-center"
                            />
                        </div>

                        {/* Info */}
                        <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>

                            <div className="mt-3">
                                <h2 className="sr-only">Product information</h2>
                                <p className="text-3xl tracking-tight text-gray-900">
                                    {formatPrice(product.price)}
                                    {product.discount_rate > 0 && (
                                        <span className="ml-2 text-lg text-gray-500 line-through">{formatPrice(product.original_price)}</span>
                                    )}
                                    {product.discount_rate > 0 && (
                                        <span className="ml-2 text-lg text-red-600 font-bold">{product.discount_rate}% OFF</span>
                                    )}
                                </p>
                            </div>

                            <div className="mt-6">
                                <h3 className="sr-only">Description</h3>
                                <p className="text-base text-gray-700">
                                    Brand: <Link to={`/brands/${encodeURIComponent(product.brand)}`} className="font-semibold text-indigo-600 hover:text-indigo-500">{product.brand}</Link> <br />
                                    Category: <Link to={`/categories/${encodeURIComponent(product.category)}`} className="font-semibold text-indigo-600 hover:text-indigo-500">{product.category}</Link>
                                </p>
                            </div>

                            <div className="mt-6">
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center">
                                        {[0, 1, 2, 3, 4].map((rating) => (
                                            <svg
                                                key={rating}
                                                className={`${product.review_rating > rating ? 'text-yellow-400' : 'text-gray-200'
                                                    } h-5 w-5 flex-shrink-0`}
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                aria-hidden="true"
                                            >
                                                <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="sr-only">{product.review_rating} out of 5 stars</p>
                                    <span className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                        {product.review_count} reviews
                                    </span>
                                </div>
                            </div>

                            <form className="mt-6">
                                {/* Colors */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Color</h3>
                                    <div className="flex items-center space-x-3 mt-2">
                                        {product.options.colors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`
                           relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none ring-gray-400
                           ${selectedColor === color ? 'ring ring-offset-1' : ''}
                         `}
                                                onClick={() => setSelectedColor(color)}
                                            >
                                                <span id={`color-choice-${color}-label`} className="sr-only">{color}</span>
                                                <span
                                                    aria-hidden="true"
                                                    className="h-8 w-8 rounded-full border border-black border-opacity-10 bg-gray-200"
                                                    style={{ backgroundColor: color.toLowerCase() }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sizes */}
                                <div className="mt-8">
                                    <h3 className="text-sm font-medium text-gray-900">Size</h3>
                                    <div className="grid grid-cols-4 gap-4 sm:grid-cols-4 lg:grid-cols-4 mt-2">
                                        {product.options.sizes.map((size) => (
                                            <button
                                                key={size}
                                                type="button"
                                                className={`
                          group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1
                          ${selectedSize === size ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300'}
                        `}
                                                onClick={() => setSelectedSize(size)}
                                            >
                                                <span id={`size-choice-${size}-label`}>{size}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-10 flex">
                                    <button
                                        type="button"
                                        onClick={handleAddToCart}
                                        className="flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent bg-black px-8 py-3 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 sm:w-full"
                                    >
                                        Add to Cart
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleLike}
                                        className={`ml-4 flex items-center justify-center rounded-md px-3 py-3 hover:bg-gray-100 ${product.is_liked ? 'text-red-500' : 'text-gray-400'}`}
                                    >
                                        <span className="sr-only">Like</span>
                                        <svg className="h-6 w-6 flex-shrink-0" fill={product.is_liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
