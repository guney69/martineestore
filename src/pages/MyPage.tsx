import React, { useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { useNavigate, Link } from 'react-router-dom';

export const MyPage: React.FC = () => {
    const { user, isAuthenticated, logout } = useSession();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    if (!user) return <div className="p-10 text-center">Loading...</div>;

    const handleWithdraw = () => {
        if (window.confirm('정말 탈퇴하시겠어요? 탈퇴 시 모든 포인트와 쿠폰이 사라집니다.')) {
            // Delete user data from storage
            localStorage.removeItem(`user_${user.id}`);
            // Logout (clears current session)
            logout();
            alert('탈퇴가 완료되었습니다.');
            navigate('/');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 pb-20">
            <h1 className="text-2xl font-bold mb-6">My Page</h1>

            {/* User Profile Card */}
            <div className="bg-white shadow rounded-lg p-6 mb-6 flex items-center">
                <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600 mr-4">
                    {user.id.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-xl font-bold text-gray-900">{user.id}</p>
                    <p className="text-sm text-gray-500">Member since 2026</p>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-sm font-medium text-gray-500 mb-1">My Points</h2>
                    <p className="text-2xl font-bold text-indigo-600">{user.points.toLocaleString()} P</p>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Coupons</h2>
                    <p className="text-2xl font-bold text-indigo-600">{user.coupons.length} EA</p>
                </div>
            </div>

            {/* Menu List */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                <Link to="/mypage/coupons" className="block px-6 py-4 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-center">
                    <span className="font-medium text-gray-700">🎟️  Coupon Box</span>
                    <span className="text-gray-400">&rarr;</span>
                </Link>
                <div className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-center cursor-not-allowed opacity-50">
                    <span className="font-medium text-gray-700">📦  Order History (Coming Soon)</span>
                    <span className="text-xs text-gray-400">Updates Planned</span>
                </div>
                <Link to="/mypage/customer-center" className="block px-6 py-4 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-center">
                    <span className="font-medium text-gray-700">🎧  Customer Center</span>
                    <span className="text-gray-400">&rarr;</span>
                </Link>
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <button
                    onClick={logout}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200"
                >
                    Logout
                </button>
                <button
                    onClick={handleWithdraw}
                    className="w-full text-red-500 py-3 rounded-lg font-medium hover:bg-red-50 text-sm"
                >
                    Delete Account
                </button>
            </div>
        </div>
    );
};
