import { Product } from '../types/product';

export const formatProductForBraze = (product: Product, additionalProps?: Record<string, any>) => ({
    category1_name: product.category,
    category1_id: null,
    brand_name: product.brand,
    brand_id: null,
    item_name: product.name,
    item_id: product.id,
    item_org_price: product.original_price,
    item_price: product.price,
    item_discount_rate: Number((product.discount_rate / 100).toFixed(2)),
    isSoldout: product.stock <= 0,
    item_img: product.image_url,
    ...additionalProps
});
