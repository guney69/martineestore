import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSession } from '../context/SessionContext';
import { useDataLayer } from '../hooks/useDataLayer';
import { formatPrice } from '../utils/format';

export const CartPage: React.FC = () => {
    const { items, removeFromCart, totalAmount } = useCart();
    const { isAuthenticated } = useSession();
    const navigate = useNavigate();
    const { pushEvent } = useDataLayer();
    const { sessionId } = useSession();

    useEffect(() => {
        pushEvent({
            event_category: 'view',
            event_name: 'cart_page_viewed',
            event_description: 'User viewed cart',
            user_id: null,
            session_id: sessionId,
            additional_params: {
                total_amount: totalAmount,
                item_count: items.length
            }
        });
    }, [sessionId, totalAmount, items.length]);

    const handleCheckout = () => {
        if (!isAuthenticated) {
            alert('Please log in to checkout');
            navigate('/login');
            return;
        }

        if (items.length === 0) return;

        navigate('/checkout');
    };

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Shopping Cart</h1>

                {items.length === 0 ? (
                    <div className="mt-12 text-center">
                        <p className="text-xl text-gray-500">Your cart is empty.</p>
                        <Link to="/" className="mt-6 inline-block bg-black text-white px-6 py-3 rounded-md">Continue Shopping</Link>
                    </div>
                ) : (
                    <form className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
                        <section aria-labelledby="cart-heading" className="lg:col-span-7">
                            <h2 id="cart-heading" className="sr-only">Items in your shopping cart</h2>

                            <ul role="list" className="divide-y divide-gray-200 border-b border-t border-gray-200">
                                {items.map((product) => (
                                    <li key={`${product.id}-${product.selectedSize}-${product.selectedColor}`} className="flex py-6 sm:py-10">
                                        <div className="h-24 w-24 flex-shrink-0 rounded-md border border-gray-200 sm:h-48 sm:w-48 bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="h-full w-full object-cover object-center"
                                            />
                                        </div>

                                        <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                                            <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                                <div>
                                                    <div className="flex justify-between">
                                                        <h3 className="text-sm">
                                                            <Link to={`/product/${product.id}`} className="font-medium text-gray-700 hover:text-gray-800">
                                                                {product.name}
                                                            </Link>
                                                        </h3>
                                                    </div>
                                                    <div className="mt-1 flex text-sm">
                                                        <p className="text-gray-500">{product.selectedColor}</p>
                                                        <p className="ml-4 border-l border-gray-200 pl-4 text-gray-500">{product.selectedSize}</p>
                                                    </div>
                                                    <p className="mt-1 text-sm font-medium text-gray-900">{formatPrice(product.price)}</p>
                                                </div>

                                                <div className="mt-4 sm:mt-0 sm:pr-9">
                                                    <label className="sr-only">Quantity, {product.name}</label>
                                                    <span className="text-gray-900">Qty {product.quantity}</span>

                                                    <div className="absolute right-0 top-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFromCart(product.id, product.selectedSize, product.selectedColor)}
                                                            className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500"
                                                        >
                                                            <span className="sr-only">Remove</span>
                                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Order summary */}
                        <section
                            aria-labelledby="summary-heading"
                            className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
                        >
                            <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
                                Order summary
                            </h2>

                            <dl className="mt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600">Subtotal</dt>
                                    <dd className="text-sm font-medium text-gray-900">{formatPrice(totalAmount)}</dd>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                    <dt className="text-base font-medium text-gray-900">Order total</dt>
                                    <dd className="text-base font-medium text-gray-900">{formatPrice(totalAmount)}</dd>
                                </div>
                            </dl>

                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={handleCheckout}
                                    className="w-full rounded-md border border-transparent bg-black px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                                >
                                    Checkout
                                </button>
                            </div>
                        </section>
                    </form>
                )}
            </div>
        </div>
    );
};
