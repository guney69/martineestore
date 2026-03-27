import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { useCart } from '../../context/CartContext';
import { useDataLayer } from '../../hooks/useDataLayer';
import { BrazePlacements } from '../braze/BrazePlacements';

export const Header: React.FC = () => {
    const { user, isAuthenticated, logout, sessionId } = useSession();
    const { totalQuantity } = useCart();
    const navigate = useNavigate();
    const { pushEvent } = useDataLayer();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        pushEvent({
            event_category: 'search',
            event_name: 'search_completed',
            event_description: 'User searched for a term',
            user_id: user?.id || null,
            session_id: sessionId,
            additional_params: { keyword: searchTerm }
        });

        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        setSearchTerm(''); // Optional: clear search after submit
    };

    const onLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-2xl font-bold text-black tracking-tighter">
                            MARTINEE
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex space-x-8">
                        <Link to="/categories" className="text-gray-900 hover:text-black font-medium">Categories</Link>
                        <Link to="/brands" className="text-gray-900 hover:text-black font-medium">Brands</Link>
                    </nav>

                    {/* Search, Cart, User */}
                    <div className="flex items-center space-x-6">
                        <form onSubmit={handleSearch} className="hidden sm:block">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="border rounded-full px-4 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </form>

                        <Link to="/cart" className="relative text-gray-900 hover:text-black">
                            <span className="sr-only">Cart</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {totalQuantity > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                    {totalQuantity}
                                </span>
                            )}
                        </Link>

                        {isAuthenticated ? (
                            <div className="relative group">
                                <Link to="/mypage" className="text-sm font-medium hover:text-gray-600 flex items-center">
                                    <span className="mr-1">👤</span> {user?.id}
                                </Link>
                                <div className="absolute right-0 w-48 bg-white shadow-lg rounded-md py-1 hidden group-hover:block border">
                                    <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="text-sm font-medium hover:text-gray-600">
                                Log in
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            <BrazePlacements />
        </header>
    );
};
