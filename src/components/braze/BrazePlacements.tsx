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
    // 배너 객체를 state에 저장 — ref 가용 여부와 독립적으로 관리
    const [bannerObj, setBannerObj] = useState<any>(null);
    const bannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Subscribe to Content Cards
        const cardSubscription = braze.subscribeToContentCardsUpdates((updates) => {
            console.log(`✅ [Braze] Content Cards 수신: 전체 ${updates.cards.length}개`);
            console.log('[Braze] 원본 카드 목록:', updates.cards.map(c => ({ id: c.id, extras: (c as any).extras })));

            const placementId = BRAZE_PLACEMENTS.GNB_CONTENT_CARD;
            const filteredCards = updates.cards.filter(card => {
                const extras = (card as any).extras || {};
                const pid = extras['placement_id'];
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
                const banner = updates?.[BRAZE_PLACEMENTS.GNB_BANNER] ?? null;
                console.log(`✅ [Braze] Banner 수신: placement=${BRAZE_PLACEMENTS.GNB_BANNER}`, banner);
                // state에만 저장 — 실제 insertBanner는 아래 useEffect에서 ref 준비 후 호출
                setBannerObj(banner);
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

    // bannerObj 또는 컴포넌트 재렌더 후 bannerRef가 준비되면 insertBanner 실행
    useEffect(() => {
        if (!bannerObj || !bannerRef.current) return;
        bannerRef.current.innerHTML = '';
        (braze as any).insertBanner(bannerObj, bannerRef.current);
    // bannerObj가 바뀔 때마다 실행 — ref는 컴포넌트가 렌더된 후엔 항상 있음
    }, [bannerObj]);

    const handleClick = (url?: string) => {
        if (!url) return;
        if (isSafeUrl(url)) {
            window.location.href = url;
        } else {
            console.warn('[BrazePlacements] Blocked unsafe redirect URL:', url);
        }
    };

    if (contentCards.length === 0 && !bannerObj) {
        return null;
    }

    return (
        <div className="w-full bg-gray-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                <div className="flex flex-col space-y-2">
                    {/* Banner container — bannerObj가 있을 때만 표시, insertBanner가 내부 렌더 담당 */}
                    <div ref={bannerRef} className={bannerObj ? 'w-full' : 'hidden'} />

                    {/* Content Cards */}
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
