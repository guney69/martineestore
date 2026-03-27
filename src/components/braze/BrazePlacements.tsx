import React, { useEffect, useState } from 'react';
import * as braze from '@braze/web-sdk';
import { BRAZE_PLACEMENTS, ALLOWED_REDIRECT_ORIGINS } from '../../constants';

interface BrazeCard {
    id: string;
    description: string;
    title?: string;
    imageUrl?: string;
    url?: string;
}

/** 허용된 오리진으로의 이동만 허용 (오픈 리다이렉트 방지) */
const isSafeUrl = (url: string): boolean => {
    try {
        const parsed = new URL(url);
        return (ALLOWED_REDIRECT_ORIGINS as readonly string[]).includes(parsed.origin);
    } catch {
        return false;
    }
};

/** HTML 태그를 제거하고 텍스트만 추출 (XSS 방지) */
const stripHtml = (html: string): string => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent ?? tmp.innerText ?? '';
};

export const BrazePlacements: React.FC = () => {
    const [contentCards, setContentCards] = useState<BrazeCard[]>([]);
    const [banners, setBanners] = useState<BrazeCard[]>([]);

    useEffect(() => {
        // Subscribe to Content Cards
        const cardSubscription = braze.subscribeToContentCardsUpdates((updates) => {
            console.log('✅ [Braze] Raw Content Cards received:', updates.cards);

            const placementId = BRAZE_PLACEMENTS.GNB_CONTENT_CARD;
            const filteredCards = updates.cards.filter(card => {
                const cardExtras = (card as any).extras || {};
                console.log(`🔍 [Braze] Card ID: ${card.id}, Extras:`, cardExtras);
                // placement_id가 없으면 undefined → 필터링에서 제외
                const pid = cardExtras.placement_id;
                return pid != null && String(pid).trim() === placementId;
            });

            console.log('🎯 [Braze] Filtered Content Cards for placement:', filteredCards);

            const cards = filteredCards.map(card => ({
                id: card.id as string,
                description: 'description' in card ? (card as any).description : '',
                title: 'title' in card ? (card as any).title : '',
                imageUrl: 'imageUrl' in card ? (card as any).imageUrl : '',
                url: 'url' in card ? (card as any).url : ''
            }));
            setContentCards(cards);
        });

        const brazeObj = braze as any;
        let bannerSubscription: string | undefined;

        if (typeof brazeObj.subscribeToBannersUpdates === 'function') {
            bannerSubscription = brazeObj.subscribeToBannersUpdates((updates: any) => {
                const bannerList = updates ? Object.values(updates).filter(Boolean) : [];
                const b = bannerList.map((banner: any) => ({
                    id: banner.id,
                    // html 콘텐츠는 텍스트만 추출해 XSS 방지
                    description: stripHtml(banner.html || banner.text || ''),
                }));
                setBanners(b);
            });
            if (typeof brazeObj.requestBannersRefresh === 'function') {
                brazeObj.requestBannersRefresh([BRAZE_PLACEMENTS.GNB_BANNER]);
            }
        }

        braze.requestContentCardsRefresh();

        return () => {
            if (cardSubscription) braze.removeSubscription(cardSubscription);
            if (bannerSubscription && typeof brazeObj.removeSubscription === 'function') {
                brazeObj.removeSubscription(bannerSubscription);
            }
        };
    }, []);

    if (contentCards.length === 0 && banners.length === 0) {
        return null;
    }

    const handleClick = (url?: string) => {
        if (!url) return;
        if (isSafeUrl(url)) {
            window.location.href = url;
        } else {
            console.warn('[BrazePlacements] Blocked unsafe redirect URL:', url);
        }
    };

    return (
        <div className="w-full bg-gray-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                <div className="flex flex-col space-y-2">
                    {/* Render Banners — 텍스트만 렌더링 (XSS 방지) */}
                    {banners.map(banner => (
                        <div
                            key={banner.id}
                            className="w-full bg-black text-white px-4 py-2 text-sm text-center rounded cursor-pointer"
                        >
                            {banner.description}
                        </div>
                    ))}

                    {/* Render Content Cards */}
                    <div className="flex overflow-x-auto space-x-4 py-2 custom-scrollbar">
                        {contentCards.map(card => (
                            <div
                                key={card.id}
                                onClick={() => handleClick(card.url)}
                                className="flex-none w-64 bg-white border border-gray-200 rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                            >
                                {card.imageUrl && (
                                    <img src={card.imageUrl} alt={card.title} className="w-full h-32 object-cover rounded-md mb-2" />
                                )}
                                {card.title && <h4 className="text-sm font-bold text-gray-900 mb-1">{card.title}</h4>}
                                <p className="text-xs text-gray-600 line-clamp-2">{card.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
