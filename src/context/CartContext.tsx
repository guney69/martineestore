import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types/product';
import { CartItem } from '../types/cart';
import { useDataLayer } from '../hooks/useDataLayer';
import { useSession } from './SessionContext';
import { formatProductForBraze } from '../utils/analyticsHelpers';

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
            user_id: null, 
            session_id: sessionId,
            additional_params: formatProductForBraze(product, {
                item_size: size,
                item_color: color
            })
        });
    };

    const removeFromCart = (productId: string, size: string, color: string) => {
        // Find the product being removed to log its details
        const itemToRemove = items.find(item => item.id === productId && item.selectedSize === size && item.selectedColor === color);

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
