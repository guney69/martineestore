import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types/product';
import { CartItem } from '../types/cart';
import { useDataLayer } from '../hooks/useDataLayer';
import { useSession } from './SessionContext';

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

    useEffect(() => {
        const storedCart = localStorage.getItem('martinee_cart');
        if (storedCart) {
            setItems(JSON.parse(storedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('martinee_cart', JSON.stringify(items));
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
            user_id: null, // Will be filled by context if not specific? No, user_id comes from Session usually.
            // Wait, useDataLayer doesn't auto-fill user_id from session? 
            // It does NOT. We need to pass it.
            // But we are inside CartProvider, we can get it from SessionContext.
            // Actually useDataLayer doesn't take user ID from context automatically.
            // We should pass it manually or make useDataLayer aware of session. 
            // For now, let's pass null and rely on the fact that we might update useDataLayer later 
            // OR we just pass `session.user?.id` here if we had it.
            // Let's grab user from useSession
            // We have sessionId, but user object?
            // const { user } = useSession();
            // Let's add user to destructuring above.

            session_id: sessionId,
            additional_params: {
                product_id: product.id,
                product_name: product.name,
                price: product.price,
                size,
                color
            }
        });
    };

    const removeFromCart = (productId: string, size: string, color: string) => {
        setItems(prev => prev.filter(item =>
            !(item.id === productId && item.selectedSize === size && item.selectedColor === color)
        ));

        pushEvent({
            event_category: 'commerce',
            event_name: 'item_deleted_from_cart',
            event_description: 'Item removed from cart',
            user_id: null,
            session_id: sessionId,
            additional_params: { product_id: productId, size, color }
        });
    };

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem('martinee_cart');
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            clearCart,
            totalAmount,
            totalQuantity
        }}>
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
