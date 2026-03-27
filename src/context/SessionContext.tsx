import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { generateUUID } from '../utils/random';
import { useDataLayer } from '../hooks/useDataLayer';
import { CartItem } from '../types/cart';
import * as braze from '@braze/web-sdk';
import {
    STORAGE_KEYS,
    SESSION_TIMEOUT_MS,
    ACTIVITY_DEBOUNCE_MS,
} from '../constants';

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

/** User 인터페이스 기본 검증 */
const isValidUser = (data: unknown): data is User => {
    if (!data || typeof data !== 'object') return false;
    const u = data as Record<string, unknown>;
    return (
        typeof u.id === 'string' &&
        typeof u.points === 'number' &&
        Array.isArray(u.coupons) &&
        Array.isArray(u.orders)
    );
};

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

    // 세션 초기화 및 유저 복원
    useEffect(() => {
        const storedSession = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
        const lastActive = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE);
        const now = Date.now();

        let newSessionId = storedSession;

        // 타임아웃 체크 (30분)
        if (!storedSession || !lastActive || (now - parseInt(lastActive) > SESSION_TIMEOUT_MS)) {
            newSessionId = generateUUID();
            localStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
        }

        setSessionId(newSessionId!);
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, now.toString());

        // Native Bridge 감지 로그
        const isAndroidBridge = !!(window as any).AppboyJavascriptInterface;
        const isIosBridge = !!(window as any).webkit?.messageHandlers?.brazeWebMessageHandler;
        console.log(`📊 [Braze] Bridge Status - Android: ${isAndroidBridge}, iOS: ${isIosBridge}`);

        // 저장된 유저 복원 (스키마 검증 포함)
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);

                // Braze: Re-identify user on page load/restoral
                console.log(`[Braze] Identifying user on restoral: ${parsed.id}`);
                braze.changeUser(parsed.id);
                // changeUser() 후 반드시 Content Cards를 재요청해야 식별된 유저의 카드가 수신됨
                braze.requestContentCardsRefresh();
            } catch (e) {
                console.error('[SessionContext] Failed to parse stored user:', e);
                localStorage.removeItem(STORAGE_KEYS.USER);
            }
        }
    }, []);

    // 액티비티 트래킹 — debounce 적용 (5초에 1회만 localStorage 쓰기)
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | null = null;

        const updateActivity = () => {
            if (timer) return; // 이미 대기 중이면 무시
            timer = setTimeout(() => {
                localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, Date.now().toString());
                timer = null;
            }, ACTIVITY_DEBOUNCE_MS);
        };

        window.addEventListener('click', updateActivity);
        window.addEventListener('scroll', updateActivity);

        return () => {
            window.removeEventListener('click', updateActivity);
            window.removeEventListener('scroll', updateActivity);
            if (timer) clearTimeout(timer);
        };
    }, []);

    const refreshSession = () => {
        const newId = generateUUID();
        setSessionId(newId);
        localStorage.setItem(STORAGE_KEYS.SESSION_ID, newId);
        return newId;
    };

    const login = (userId: string) => {
        const newSession = refreshSession();

        console.log(`[Braze] Identifying user on login: ${userId}`);
        braze.changeUser(userId);
        // changeUser() 후 반드시 Content Cards를 재요청해야 식별된 유저의 카드가 수신됨
        braze.requestContentCardsRefresh();

        const storedUser = localStorage.getItem(`${STORAGE_KEYS.USER_PREFIX}${userId}`);
        let newUser: User;

        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (isValidUser(parsed)) {
                    newUser = { ...parsed, points: parsed.points + 100 };
                } else {
                    newUser = { id: userId, points: 100, coupons: [], orders: [] };
                }
            } catch {
                newUser = { id: userId, points: 100, coupons: [], orders: [] };
            }
        } else {
            newUser = { id: userId, points: 100, coupons: [], orders: [] };
        }

        setUser(newUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        localStorage.setItem(`${STORAGE_KEYS.USER_PREFIX}${userId}`, JSON.stringify(newUser));

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

        console.log(`[Braze] Identifying user on signup: ${userId}`);
        braze.changeUser(userId);
        // changeUser() 후 반드시 Content Cards를 재요청해야 식별된 유저의 카드가 수신됨
        braze.requestContentCardsRefresh();

        const newUser: User = {
            id: userId,
            points: 0,
            coupons: ['WELCOME_10_PERCENT'],
            orders: []
        };

        localStorage.setItem(`${STORAGE_KEYS.USER_PREFIX}${userId}`, JSON.stringify(newUser));
        setUser(newUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));

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
            additional_params: {
                coupon_name: 'Welcome Sign-up Bonus',
                coupon_id: 'WELCOME_10_PERCENT',
                coupon_type: 'Welcome',
                coupon_exp_date: '2026-12-31'
            }
        });
    };

    const addOrder = (order: Order) => {
        if (!user) return;
        const updatedUser = { ...user, orders: [order, ...user.orders] };
        setUser(updatedUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        localStorage.setItem(`${STORAGE_KEYS.USER_PREFIX}${user.id}`, JSON.stringify(updatedUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEYS.USER);
        refreshSession();
    };

    // Context value 메모이제이션 — 불필요한 하위 컴포넌트 리렌더 방지
    const value = useMemo<SessionContextType>(() => ({
        sessionId,
        user,
        login,
        signup,
        logout,
        refreshSession,
        addOrder,
        isAuthenticated: !!user,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [sessionId, user]);

    return (
        <SessionContext.Provider value={value}>
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
