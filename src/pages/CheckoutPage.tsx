import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSession } from '../context/SessionContext';
import { useDataLayer } from '../hooks/useDataLayer';
import { generateRandomId } from '../utils/random';
import { formatPrice } from '../utils/format';
import { formatCartItemsForAnalytics } from '../utils/analyticsHelpers';

export const CheckoutPage: React.FC = () => {
    const { items, totalAmount, clearCart } = useCart();
    const { user, sessionId, addOrder } = useSession();
    const { pushEvent } = useDataLayer();
    const navigate = useNavigate();
    const [isProccessing, setIsProcessing] = useState(false);

    const handleOrder = async () => {
        setIsProcessing(true);

        // 1. Order Button Clicked
        pushEvent({
            event_category: 'commerce',
            event_name: 'order_button_clicked',
            event_description: 'User clicked place order',
            user_id: user?.id || null,
            session_id: sessionId,
            additional_params: formatCartItemsForAnalytics(items)
        });

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 2. Order Confirmed (API success)
        const orderId = generateRandomId('ORD-');
        const orderDate = new Date().toISOString().split('T')[0];

        // Save order to SessionContext (My Page)
        if (user) {
            addOrder({
                id: orderId,
                date: orderDate,
                items: [...items],
                totalAmount: totalAmount
            });
        }

        pushEvent({
            event_category: 'commerce',
            event_name: 'order_confirm_completed',
            event_description: 'Order confirmed by backend',
            user_id: user?.id || null,
            session_id: sessionId,
            additional_params: formatCartItemsForAnalytics(items, {
                order_id: orderId
            })
        });

        // Clear Cart
        clearCart();

        // Redirect
        navigate(`/order-complete/${orderId}`);
    };

    if (items.length === 0) {
        return <div className="p-10 text-center">Cart is empty</div>;
    }

    return (
        <div className="bg-white px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-lg">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 text-center">Checkout</h1>

                <div className="mt-10 border-t border-gray-200 pt-10">
                    <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                    <ul role="list" className="divide-y divide-gray-200">
                        {items.map(product => (
                            <li key={product.id} className="flex py-6 space-x-6">
                                <div className="flex-auto">
                                    <h3 className="text-gray-900">{product.name}</h3>
                                    <p className="text-gray-500">{product.selectedSize} / {product.selectedColor}</p>
                                    <p className="text-gray-900 font-medium">x{product.quantity} - {formatPrice(product.price * product.quantity)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="border-t border-gray-200 pt-6 mt-6 flex justify-between">
                        <span className="text-base font-medium text-gray-900">Total</span>
                        <span className="text-base font-medium text-gray-900">{formatPrice(totalAmount)}</span>
                    </div>

                    <button
                        type="button"
                        onClick={handleOrder}
                        disabled={isProccessing}
                        className="w-full mt-10 rounded-md border border-transparent bg-black px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-800 disabled:bg-gray-400"
                    >
                        {isProccessing ? 'Processing...' : 'Place Order'}
                    </button>
                </div>
            </div>
        </div>
    );
};
