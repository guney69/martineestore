export interface Product {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    original_price: number;
    discount_rate: number;
    image_url: string;
    is_liked: boolean;
    stock: number;
    review_count: number;
    review_rating: number; // 0-5
    options: {
        sizes: string[];
        colors: string[];
    };
    sales_count: number; // For ranking
}

export const CATEGORIES = [
    'Top', 'Outer', 'Pants', 'Skirt', 'Shoes', 'Bag'
];

export const BRANDS = Array.from({ length: 20 }, (_, i) => `Brand ${String.fromCharCode(65 + i)}`);
