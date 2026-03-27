// ─── localStorage Keys ───────────────────────────────────────────────────────
export const STORAGE_KEYS = {
    SESSION_ID:      'martinee_session_id',
    LAST_ACTIVE:     'martinee_last_active',
    USER:            'martinee_user',
    CART:            'martinee_cart',
    PRODUCTS:        'martinee_products',
    INITIAL_UTMS:    'martinee_initial_utms',
    USER_PREFIX:     'user_',
} as const;

// ─── Session ──────────────────────────────────────────────────────────────────
/** 30분 (밀리초) */
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

/** 액티비티 트래킹 debounce 간격 (밀리초) */
export const ACTIVITY_DEBOUNCE_MS = 5_000;

// ─── Braze Placement IDs ─────────────────────────────────────────────────────
export const BRAZE_PLACEMENTS = {
    GNB_CONTENT_CARD: 'gnb_content_card',
    GNB_BANNER:       'gnb_banner',
} as const;

// ─── URL 허용 도메인 (오픈 리다이렉트 방어) ──────────────────────────────────
export const ALLOWED_REDIRECT_ORIGINS = [
    'https://martineestore.vercel.app',
    'http://localhost:5173',
] as const;
