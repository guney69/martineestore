import React from 'react';
import { Link } from 'react-router-dom';
// import { useSession } from '../context/SessionContext';

export const SignupSuccessPage: React.FC = () => {
    // const { user } = useSession();

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl font-bold text-green-600 mb-4">Welcome!</h1>
            <p className="text-xl text-gray-700 mb-8">
                Your account has been created successfully.<br />
                We've sent you a <strong>10% Discount Coupon</strong>!
            </p>

            <div className="p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 mb-8">
                <span className="text-sm text-gray-500 block mb-2">Your Coupon Code</span>
                <span className="text-2xl font-mono font-bold text-black">WELCOME_10_PERCENT</span>
            </div>

            <Link to="/" className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors">
                Start Shopping
            </Link>
        </div>
    );
};
