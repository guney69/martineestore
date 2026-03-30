import React, { useEffect, useRef, useState } from 'react';
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


export const BrazePlacements: React.FC = () => {
    const [contentCards, setContentCards] = useState<BrazeCard[]>([]);
    const [hasBanner, setHasBanner] = useState(false);
    const bannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Subscribe to Content Cards
        const cardSubscription = braze.subscribeToContentCardsUpdates((updates) => {
            console.log(`✅ [Braze] Content Cards 수신: 전체 ${updates.cards.length}개`);
            console.log('[Braze] 원본 카드 목록:', updates.cards.map(c => ({ id: c.id, extras: (c as any).extras })));

            // Filter Content Cards by explicit placement_id in extras, or display all if unspecified.
            // Braze Dashboard 설정 시 Key-Value (extras) 에 placement_id: 'gnb_content_card' 를 넣으시면 됩니다.
            const placementId = 'gnb_content_card';
            const filteredCards = updates.cards.filter(card => {
                const extras = (card as any).extras || {};
                const pid = extras['placement_id'];
                // null/undefined 체크 + 대소문자/공백 무시
                return pid != null && String(pid).trim() === placementId;
            });

            console.log(`🎯 [Braze] 필터링 후: ${filteredCards.length}개 (placement_id: ${placementId})`);

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
            bannerSubscription = brazeObj.subscribeToBannersUpdates((updates: Record<string, any>) => {
                const banner = updates?.[BRAZE_PLACEMENTS.GNB_BANNER];
                console.log(`✅ [Braze] Banner 수신: placement=${BRAZE_PLACEMENTS.GNB_BANNER}`, banner);

                if (banner && bannerRef.current) {
                    // Braze 공식 insertBanner API로 HTML 렌더링
                    bannerRef.current.innerHTML = '';
                    brazeObj.insertBanner(banner, bannerRef.current);
                    setHasBanner(true);
                } else {
                    setHasBanner(false);
                }
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

    // bannerRef가 마운트된 후 업데이트가 왔을 때를 위해 별도 effect
    useEffect(() => {
        if (!hasBanner || !bannerRef.current) return;
        const banner = (braze as any).getBanner?.(BRAZE_PLACEMENTS.GNB_BANNER);
        if (banner) {
            bannerRef.current.innerHTML = '';
            (braze as any).insertBanner(banner, bannerRef.current);
        }
    }, [hasBanner]);

    if (contentCards.length === 0 && !hasBanner) {
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
                    {/* Render Banner via Braze insertBanner API */}
                    <div ref={bannerRef} className={hasBanner ? 'w-full' : 'hidden'} />

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
