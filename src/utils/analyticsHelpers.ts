import { Product } from '../types/product';
import { CartItem } from '../types/cart';

/**
 * 단일 상품 → Braze/Amplitude 이벤트 파라미터 포맷
 * (item_added_to_cart, item_deleted_from_cart 등 단일 상품 이벤트에 사용)
 */
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

/**
 * 카트 아이템 배열 → Braze/Amplitude 이벤트 파라미터 포맷
 * (cart_page_viewed, order_button_clicked, order_confirm_completed, order_completed 등 복수 상품 이벤트에 사용)
 */
export const formatCartItemsForAnalytics = (
    items: CartItem[],
    additionalProps?: Record<string, any>
) => ({
    category1_name:    items.map(i => i.category),
    brand_name:        items.map(i => i.brand),
    item_name:         items.map(i => i.name),
    item_id:           items.map(i => i.id),
    item_org_price:    items.map(i => i.original_price),
    item_price:        items.map(i => i.price),
    item_discount_rate: items.map(i => Number((i.discount_rate / 100).toFixed(2))),
    isSoldout:         items.map(i => i.stock <= 0),
    item_img:          items.map(i => i.image_url),
    item_size:         items.map(i => i.selectedSize),
    item_color:        items.map(i => i.selectedColor),
    ...additionalProps
});
