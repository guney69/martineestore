import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Papa from 'papaparse';
import { Product } from '../types/product'; // Removed CATEGORIES, BRANDS imports as they will be dynamic
import { getRandomInt } from '../utils/random';
// @ts-ignore
import productsCsvText from '../assets/products.csv?raw';

interface ProductContextType {
    products: Product[];
    categories: string[];
    brands: string[];
    toggleLike: (productId: string) => void;
    refreshRanking: () => void;
    getProduct: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Raw CSV Row Interface
interface CsvProductRow {
    product_id: string;
    product_name: string;
    category_depth1_id: string;
    category_depth1_name: string;
    category_depth2_id: string;
    category_depth2_name: string;
    brand_id: string;
    brand_name: string;
    original_price: string; // CSV numbers are strings
    discount_amount: string;
    discounted_price: string;
    img_url: string;
}

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [brands, setBrands] = useState<string[]>([]);

    useEffect(() => {
        const loadProducts = () => {
            // Check local storage first
            const stored = localStorage.getItem('martinee_products');
            if (stored) {
                const parsed: Product[] = JSON.parse(stored);
                // Check if data is legacy (dummy data IDs start with 'prod_')
                // If so, discard it and load from CSV.
                if (parsed.length > 0 && parsed[0].id.startsWith('prod_')) {
                    console.log("Legacy data detected. Clearing and reloading from CSV.");
                    localStorage.removeItem('martinee_products');
                } else {
                    setProducts(parsed);
                    extractMetadata(parsed);
                    return;
                }
            }

            // Parse CSV
            Papa.parse<CsvProductRow>(productsCsvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const loadedProducts: Product[] = results.data.map((row) => {
                        const originalPrice = parseInt(row.original_price, 10);
                        const price = parseInt(row.discounted_price, 10);

                        return {
                            id: row.product_id,
                            name: row.product_name,
                            brand: row.brand_name,
                            category: row.category_depth1_name,
                            price: price,
                            original_price: originalPrice,
                            discount_rate: Math.round(((originalPrice - price) / originalPrice) * 100),
                            image_url: row.img_url,
                            is_liked: false,
                            stock: getRandomInt(0, 100),
                            review_count: getRandomInt(0, 500),
                            review_rating: Number((Math.random() * 2 + 3).toFixed(1)),
                            options: {
                                sizes: ['S', 'M', 'L', 'XL'],
                                colors: ['Black', 'White', 'Navy', 'Gray']
                            },
                            sales_count: getRandomInt(0, 1000) // Initial random sales for ranking
                        };
                    });

                    setProducts(loadedProducts);
                    extractMetadata(loadedProducts);
                    localStorage.setItem('martinee_products', JSON.stringify(loadedProducts));
                },
                error: (error: Error) => { // Type annotation for error
                    console.error("CSV Parse Error:", error);
                }
            });
        };

        loadProducts();
    }, []);

    const extractMetadata = (items: Product[]) => {
        const uniqueCategories = Array.from(new Set(items.map(p => p.category)));
        const uniqueBrands = Array.from(new Set(items.map(p => p.brand)));
        setCategories(uniqueCategories);
        setBrands(uniqueBrands);
    };

    const toggleLike = (productId: string) => {
        setProducts(prev => {
            const newProducts = prev.map(p =>
                p.id === productId ? { ...p, is_liked: !p.is_liked } : p
            );
            localStorage.setItem('martinee_products', JSON.stringify(newProducts));
            return newProducts;
        });
    };

    const refreshRanking = () => {
        setProducts(prev => {
            const newProducts = prev.map(p => ({
                ...p,
                sales_count: getRandomInt(0, 1000) // Randomize sales to shift ranking
            }));
            localStorage.setItem('martinee_products', JSON.stringify(newProducts));
            return newProducts;
        });
    };

    const getProduct = (id: string) => products.find(p => p.id === id);

    return (
        <ProductContext.Provider value={{
            products,
            categories,
            brands,
            toggleLike,
            refreshRanking,
            getProduct
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProduct = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProduct must be used within a ProductProvider');
    }
    return context;
};
