import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDataLayer } from '../hooks/useDataLayer';
import { useSession } from '../context/SessionContext';

export const OrderCompletePage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { pushEvent } = useDataLayer();
    const { user, sessionId } = useSession();

    useEffect(() => {
        pushEvent({
            event_category: 'commerce',
            event_name: 'order_completed',
            event_description: 'User viewed order complete page',
            user_id: user?.id || null,
            session_id: sessionId,
            additional_params: { order_id: orderId }
        });
    }, [orderId, sessionId, user?.id]);

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
