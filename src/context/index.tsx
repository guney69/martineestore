import React, { ReactNode } from 'react';
import { SessionProvider } from './SessionContext';
import { ProductProvider } from './ProductContext';
import { CartProvider } from './CartContext';
import { ExperimentProvider } from './ExperimentContext';

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <SessionProvider>
            <ExperimentProvider>
                <ProductProvider>
                    <CartProvider>
                        {children}
                    </CartProvider>
                </ProductProvider>
            </ExperimentProvider>
        </SessionProvider>
    );
};
