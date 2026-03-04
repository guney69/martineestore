import React from 'react';
import { useSession } from '../context/SessionContext';
import { useNavigate } from 'react-router-dom';

// Static Coupon Data Dictionary
const COUPON_DETAILS: Record<string, { name: string; discount: string; expires: string }> = {
    'WELCOME_10_PERCENT': {
        name: 'Welcome Sign-up Bonus',
        discount: '10% OFF',
        expires: '2026-12-31'
    },
    'SUMMER_SALE': {
        name: 'Summer Season Off',
        discount: '5,000 KRW',
        expires: '2026-08-31'
    }
};

export const CouponsPage: React.FC = () => {
    const { user, isAuthenticated } = useSession();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    if (!user) return <div className="p-8 text-center">Loading...</div>;

    const userCoupons = user.coupons || [];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 text-gray-500 hover:text-black">
                    &larr; Back
                </button>
                <h1 className="text-2xl font-bold">My Coupons</h1>
            </div>

            {userCoupons.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg text-gray-500">
                    No coupons available.
                </div>
            ) : (
                <div className="space-y-4">
                    {userCoupons.map((couponId, idx) => {
                        const details = COUPON_DETAILS[couponId] || {
                            name: 'Unknown Coupon',
                            discount: '???',
                            expires: 'Unknown'
                        };
                        return (
                            <div key={`${couponId}-${idx}`} className="border rounded-lg p-4 flex justify-between items-center bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div>
                                    <h3 className="font-bold text-lg text-indigo-600">{details.discount}</h3>
                                    <p className="font-medium text-gray-800">{details.name}</p>
                                    <p className="text-sm text-gray-400 mt-1">Code: {couponId}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                                        Expires: {details.expires}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
