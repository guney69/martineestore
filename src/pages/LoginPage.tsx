import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

export const LoginPage: React.FC = () => {
    const [userId, setUserId] = useState('');
    const { login, signup } = useSession();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId.trim()) return;

        // For simulator simplicity, any ID works.
        // Logic: if new, signup. If exists, login.
        // SessionContext handles this logic usually or we separate it?
        // My SessionContext has `login` and `signup`. 
        // `login` assumes user exists or creates?
        // Let's just call login(), but wait, the requirements say:
        // "ID만 입력하면 자동 회원가입 완료"
        // "회원가입 완료 시 완료 페이지 이동"
        // "로그인 시 100 포인트 자동 지급"

        // Complex logic for simulator:
        // Check if user exists in localStorage?
        const storedUser = localStorage.getItem(`user_${userId}`);
        if (storedUser) {
            login(userId);
            navigate('/');
        } else {
            signup(userId);
            navigate('/signup-success');
        }
    };

    return (
        <div className="flex min-h-[80vh] flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    New users will be automatically registered
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="userId" className="block text-sm font-medium leading-6 text-gray-900">
                            User ID
                        </label>
                        <div className="mt-2">
                            <input
                                id="userId"
                                name="userId"
                                type="text"
                                required
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Sign in / Register
                        </button>
                    </div>
                </form>

                <div className="mt-6 border-t border-gray-200 pt-6">
                    <button
                        type="button"
                        onClick={() => {
                            if (window.confirm('Reset all app data? This fixes white screen issues.')) {
                                localStorage.clear();
                                window.location.reload();
                            }
                        }}
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        🔄 Reset App Data (Fix Errors)
                    </button>
                </div>
            </div>
        </div>
    );
};
