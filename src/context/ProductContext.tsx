import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import Papa from 'papaparse';
import { Product } from '../types/product';
import { getRandomInt } from '../utils/random';
import { STORAGE_KEYS } from '../constants';
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
    original_price: string;
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
            // localStorage 캐시 확인 (검증 포함)
            const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
            if (stored) {
                try {
                    const parsed: Product[] = JSON.parse(stored);
                    if (!Array.isArray(parsed)) {
                        throw new Error('Products cache is not an array');
                    }
                    // 레거시 더미 데이터 감지 시 제거 후 CSV 재로드
                    if (parsed.length > 0 && parsed[0].id.startsWith('prod_')) {
                        console.log('[ProductContext] Legacy data detected. Clearing and reloading from CSV.');
                        localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
                    } else {
                        setProducts(parsed);
                        extractMetadata(parsed);
                        return;
                    }
                } catch (e) {
                    console.error('[ProductContext] Failed to parse stored products:', e);
                    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
                }
            }

            // CSV 파싱
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
                            sales_count: getRandomInt(0, 1000)
                        };
                    });

                    setProducts(loadedProducts);
                    extractMetadata(loadedProducts);
                    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(loadedProducts));
                },
                error: (error: Error) => {
                    console.error('[ProductContext] CSV Parse Error:', error);
                }
            });
        };

        loadProducts();
    }, []);

    const extractMetadata = (items: Product[]) => {
        setCategories(Array.from(new Set(items.map(p => p.category))));
        setBrands(Array.from(new Set(items.map(p => p.brand))));
    };

    const toggleLike = (productId: string) => {
        setProducts(prev => {
            const newProducts = prev.map(p =>
                p.id === productId ? { ...p, is_liked: !p.is_liked } : p
            );
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(newProducts));
            return newProducts;
        });
    };

    const refreshRanking = () => {
        setProducts(prev => {
            const newProducts = prev.map(p => ({
                ...p,
                sales_count: getRandomInt(0, 1000)
            }));
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(newProducts));
            return newProducts;
        });
    };

    const getProduct = (id: string) => products.find(p => p.id === id);

    // Context value 메모이제이션 — 불필요한 하위 컴포넌트 리렌더 방지
    const value = useMemo<ProductContextType>(() => ({
        products,
        categories,
        brands,
        toggleLike,
        refreshRanking,
        getProduct,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [products, categories, brands]);

    return (
        <ProductContext.Provider value={value}>
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
