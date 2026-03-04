import React from 'react';
import { useNavigate } from 'react-router-dom';

const FAQS = [
    { q: 'How do I track my order?', a: 'You can check your order status in My Page > Order History.' },
    { q: 'What is the return policy?', a: 'Returns are accepted within 7 days of receipt. Please contact support.' },
    { q: 'How do I use my coupons?', a: 'Select your coupon at the checkout page before payment.' },
    { q: 'Can I change my shipping address?', a: 'You can change it before the order status becomes "Shipped".' }
];

export const CustomerCenterPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 text-gray-500 hover:text-black">
                    &larr; Back
                </button>
                <h1 className="text-2xl font-bold">Customer Center</h1>
            </div>

            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
                    <div className="bg-white shadow rounded-lg divide-y divide-gray-100">
                        {FAQS.map((faq, idx) => (
                            <div key={idx} className="p-5">
                                <h3 className="font-medium text-gray-900 mb-2">Q. {faq.q}</h3>
                                <p className="text-gray-600 text-sm">A. {faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-blue-50 p-6 rounded-lg text-center">
                    <p className="text-blue-800 font-medium mb-2">Need more help?</p>
                    <p className="text-sm text-blue-600">Contact us at support@martinee.com</p>
                    <p className="text-sm text-blue-600">Mon-Fri 09:00 - 18:00</p>
                </section>
            </div>
        </div>
    );
};
