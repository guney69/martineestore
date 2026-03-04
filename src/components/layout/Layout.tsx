import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useDataLayer } from '../../hooks/useDataLayer';
import { useSession } from '../../context/SessionContext';

export const Layout: React.FC = () => {
    const { pathname } = useLocation();
    const { pushEvent } = useDataLayer();
    const { sessionId } = useSession();

    // Page View Tracking
    useEffect(() => {
        // Map pathnames to event names if needed, or just use generic page_view
        // User request:
        // Main -> main_page_viewed
        // Category -> category_list_viewed 
        // etc.

        let eventName = 'page_viewed';
        let additionalParams = {};

        if (pathname === '/') eventName = 'main_page_viewed';
        if (pathname === '/cart') eventName = 'cart_page_viewed';
        if (pathname.startsWith('/categories')) eventName = 'category_list_viewed';
        if (pathname.startsWith('/brands')) eventName = 'brand_list_viewed';
        if (pathname.startsWith('/product/')) eventName = 'item_detail_page_viewed'; // We might need to handle this in comp for details
        if (pathname === '/login') eventName = 'login_page_viewed';

        // We trigger it here for generic pages, but maybe specific pages should trigger their own for more details?
        // Let's rely on this generic one for high level, but components can fire specific ones.
        // Actually, duplication is bad.
        // Let's ONLY fire here if it's a generic page or we can determine everything.
        // For product detail, we need product info, so maybe better in the ProductDetail page.

        // For now, let's just log "screen_view" or similar.
        // Or we stick to the plan:
        // main_page_viewed (HERE is fine)
        // cart_page_viewed (HERE is fine)

        if (eventName === 'main_page_viewed' || eventName === 'cart_page_viewed') {
            pushEvent({
                event_category: 'view',
                event_name: eventName,
                event_description: `User viewed ${pathname}`,
                user_id: null,
                session_id: sessionId,
                additional_params: additionalParams
            });
        }

    }, [pathname, sessionId, pushEvent]);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};
