import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDataLayer } from '../hooks/useDataLayer';
import { useSession } from '../context/SessionContext';

export const OrderCompletePage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { pushEvent } = useDataLayer();
    const { user, sessionId } = useSession();

    const order = user?.orders.find(o => o.id === orderId);

    useEffect(() => {
        if (!order) return;
        pushEvent({
            event_category: 'commerce',
            event_name: 'order_completed',
            event_description: 'User viewed order complete page',
            user_id: user?.id || null,
            session_id: sessionId,
            additional_params: {
                category1_name: order.items.map(i => i.category),
                brand_name: order.items.map(i => i.brand),
                item_name: order.items.map(i => i.name),
                item_id: order.items.map(i => i.id),
                item_org_price: order.items.map(i => i.original_price),
                item_price: order.items.map(i => i.price),
                item_discount_rate: order.items.map(i => Number((i.discount_rate / 100).toFixed(2))),
                isSoldout: order.items.map(i => i.stock <= 0),
                item_img: order.items.map(i => i.image_url),
                item_size: order.items.map(i => i.selectedSize),
                item_color: order.items.map(i => i.selectedColor),
                coupon_name: user?.coupons.length ? 'Welcome Sign-up Bonus' : '',
                coupon_id: user?.coupons.length ? 'WELCOME_10_PERCENT' : '',
                coupon_type: user?.coupons.length ? 'Welcome' : '',
                coupon_exp_date: user?.coupons.length ? '2026-12-31' : ''
            }
        });
    }, [orderId, sessionId, user?.id, order]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-white">
            <div className="rounded-full bg-green-100 p-3 mb-6">
                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-500 mb-8">Order ID: {orderId}</p>

            <Link to="/" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Continue Shopping &rarr;
            </Link>
        </div>
    );
};
