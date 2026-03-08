import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateUUID } from '../utils/random';
import { useDataLayer } from '../hooks/useDataLayer';
import { CartItem } from '../types/cart';
import * as braze from '@braze/web-sdk';

interface Order {
    id: string;
    date: string;
    items: CartItem[];
    totalAmount: number;
}

interface User {
    id: string;
    points: number;
    coupons: string[];
    orders: Order[];
}

interface SessionContextType {
    sessionId: string;
    user: User | null;
    login: (userId: string) => void;
    signup: (userId: string) => void;
    logout: () => void;
    refreshSession: () => void;
    addOrder: (order: Order) => void;
    isAuthenticated: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [sessionId, setSessionId] = useState<string>('');
    const [user, setUser] = useState<User | null>(null);
    const { pushEvent } = useDataLayer();

    useEffect(() => {
        const storedSession = localStorage.getItem('martinee_session_id');
        const lastActive = localStorage.getItem('martinee_last_active');
        const now = Date.now();

        let newSessionId = storedSession;

        // Check timeout (30 mins = 1800000ms)
        if (!storedSession || !lastActive || (now - parseInt(lastActive) > 1800000)) {
            newSessionId = generateUUID();
            localStorage.setItem('martinee_session_id', newSessionId);
        }

        setSessionId(newSessionId!);
        localStorage.setItem('martinee_last_active', now.toString());

        // Check for Native Bridge presence
        const isAndroidBridge = !!(window as any).AppboyJavascriptInterface;
        const isIosBridge = !!(window as any).webkit?.messageHandlers?.brazeWebMessageHandler;
        console.log(`📊 [Braze] Bridge Status - Android: ${isAndroidBridge}, iOS: ${isIosBridge}`);

        // Restore user if exists
        const storedUser = localStorage.getItem('martinee_user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);

                // Braze: Re-identify user on page load/restoral
                console.log(`[Braze] Identifying user on restoral: ${parsed.id}`);
                braze.changeUser(parsed.id);
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('martinee_user');
            }
        }
    }, []);

    // Update last active on any interaction
    useEffect(() => {
        const updateActivity = () => {
            localStorage.setItem('martinee_last_active', Date.now().toString());
        };
        window.addEventListener('click', updateActivity);
        window.addEventListener('scroll', updateActivity);
        return () => {
            window.removeEventListener('click', updateActivity);
            window.removeEventListener('scroll', updateActivity);
        };
    }, []);

    const refreshSession = () => {
        const newId = generateUUID();
        setSessionId(newId);
        localStorage.setItem('martinee_session_id', newId);
        return newId;
    };

    const login = (userId: string) => {
        const newSession = refreshSession();

        // Braze: Identify user
        console.log(`[Braze] Identifying user on login: ${userId}`);
        braze.changeUser(userId);

        // Check if user has stored data
        const storedUser = localStorage.getItem(`user_${userId}`);
        let newUser: User;

        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            newUser = {
                ...parsed,
                points: parsed.points + 100 // Login bonus
            };
        } else {
            newUser = {
                id: userId,
                points: 100,
                coupons: [],
                orders: []
            };
        }

        setUser(newUser);
        localStorage.setItem('martinee_user', JSON.stringify(newUser));
        localStorage.setItem(`user_${userId}`, JSON.stringify(newUser));

        pushEvent({
            event_category: 'auth',
            event_name: 'login_completed',
            event_description: 'User logged in',
            user_id: userId,
            session_id: newSession,
            additional_params: { method: 'id_only' }
        });
    };

    const signup = (userId: string) => {
        const newSession = sessionId;

        // Braze: Identify user
        console.log(`[Braze] Identifying user on signup: ${userId}`);
        braze.changeUser(userId);

        const newUser: User = {
            id: userId,
            points: 0,
            coupons: ['WELCOME_10_PERCENT'],
            orders: []
        };

        localStorage.setItem(`user_${userId}`, JSON.stringify(newUser));
        setUser(newUser);
        localStorage.setItem('martinee_user', JSON.stringify(newUser));

        pushEvent({
            event_category: 'auth',
            event_name: 'sign_up_completed',
            event_description: 'User signed up',
            user_id: userId,
            session_id: newSession,
            additional_params: {}
        });

        pushEvent({
            event_category: 'marketing',
            event_name: 'coupon_issued',
            event_description: 'Welcome coupon issued',
            user_id: userId,
            session_id: newSession,
            additional_params: { coupon_id: 'WELCOME_10_PERCENT' }
        });
    };

    const addOrder = (order: Order) => {
        if (!user) return;
        const updatedUser = {
            ...user,
            orders: [order, ...user.orders]
        };
        setUser(updatedUser);
        localStorage.setItem('martinee_user', JSON.stringify(updatedUser));
        localStorage.setItem(`user_${user.id}`, JSON.stringify(updatedUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('martinee_user');
        refreshSession();
        // Option: braze.changeUser(null) to go back to anonymous, 
        // but Braze usually handles this by clearing session.
    };

    return (
        <SessionContext.Provider value={{
            sessionId,
            user,
            login,
            signup,
            logout,
            refreshSession,
            addOrder,
            isAuthenticated: !!user
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};
