import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Product } from '../types/product';
import { CartItem } from '../types/cart';
import { useDataLayer } from '../hooks/useDataLayer';
import { useSession } from './SessionContext';
import { formatProductForBraze } from '../utils/analyticsHelpers';
import { STORAGE_KEYS } from '../constants';

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, size: string, color: string) => void;
    removeFromCart: (productId: string, size: string, color: string) => void;
    clearCart: () => void;
    totalAmount: number;
    totalQuantity: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const { pushEvent } = useDataLayer();
    const { sessionId } = useSession();

    // localStorage → 상태 복원 (검증 포함)
    useEffect(() => {
        const storedCart = localStorage.getItem(STORAGE_KEYS.CART);
        if (!storedCart) return;
        try {
            const parsed = JSON.parse(storedCart);
            if (Array.isArray(parsed)) {
                setItems(parsed);
            } else {
                console.warn('[CartContext] Stored cart is not an array, clearing.');
                localStorage.removeItem(STORAGE_KEYS.CART);
            }
        } catch (e) {
            console.error('[CartContext] Failed to parse stored cart:', e);
            localStorage.removeItem(STORAGE_KEYS.CART);
        }
    }, []);

    // 상태 변경 → localStorage 동기화
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
    }, [items]);

    const addToCart = (product: Product, size: string, color: string) => {
        setItems(prev => {
            const existing = prev.find(item =>
                item.id === product.id && item.selectedSize === size && item.selectedColor === color
            );
            if (existing) {
                return prev.map(item =>
                    item.id === product.id && item.selectedSize === size && item.selectedColor === color
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1, selectedSize: size, selectedColor: color }];
        });

        pushEvent({
            event_category: 'commerce',
            event_name: 'item_added_to_cart',
            event_description: 'Item added to cart',
            user_id: null,
            session_id: sessionId,
            additional_params: formatProductForBraze(product, {
                item_size: size,
                item_color: color
            })
        });
    };

    const removeFromCart = (productId: string, size: string, color: string) => {
        const itemToRemove = items.find(
            item => item.id === productId && item.selectedSize === size && item.selectedColor === color
        );

        setItems(prev => prev.filter(item =>
            !(item.id === productId && item.selectedSize === size && item.selectedColor === color)
        ));

        if (itemToRemove) {
            pushEvent({
                event_category: 'commerce',
                event_name: 'item_deleted_from_cart',
                event_description: 'Item removed from cart',
                user_id: null,
                session_id: sessionId,
                additional_params: formatProductForBraze(itemToRemove, {
                    item_size: size,
                    item_color: color
                })
            });
        }
    };

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem(STORAGE_KEYS.CART);
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    // Context value 메모이제이션 — 불필요한 하위 컴포넌트 리렌더 방지
    const value = useMemo<CartContextType>(() => ({
        items,
        addToCart,
        removeFromCart,
        clearCart,
        totalAmount,
        totalQuantity,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [items, totalAmount, totalQuantity]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
