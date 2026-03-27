import React, { useEffect, useState } from 'react';
import * as braze from '@braze/web-sdk';

interface BrazeCard {
    id: string;
    description: string;
    title?: string;
    imageUrl?: string;
    url?: string;
}

export const BrazePlacements: React.FC = () => {
    const [contentCards, setContentCards] = useState<BrazeCard[]>([]);
    const [banners, setBanners] = useState<BrazeCard[]>([]);

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

        // Some Braze versions export banner methods on the main braze instance, use casting if necessary
        const brazeObj = braze as any;
        let bannerSubscription: string | undefined;

        if (typeof brazeObj.subscribeToBannersUpdates === 'function') {
            bannerSubscription = brazeObj.subscribeToBannersUpdates((updates: any) => {
                // updates는 배열이 아니라 { [placementId: string]: Banner } 딕셔너리 객체임
                const bannerList = updates ? Object.values(updates).filter(Boolean) : [];
                console.log(`✅ [Braze] Banners 수신: ${bannerList.length}개`);
                const b = bannerList.map((banner: any) => ({
                    id: banner.id,
                    description: banner.html || banner.text || '',
                }));
                setBanners(b);
            });
            // Request Banners explicitly by placement_id
            if (typeof brazeObj.requestBannersRefresh === 'function') {
                brazeObj.requestBannersRefresh(['gnb_banner']);
            }
        }

        // Request initial content cards
        braze.requestContentCardsRefresh();

        return () => {
            // Clean up subscriptions
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
        if (url) {
            window.location.href = url;
            // Optionally log click here if custom handling needed, but standard URL clicks are often handled by browser
        }
    };

    return (
        <div className="w-full bg-gray-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                <div className="flex flex-col space-y-2">
                    {/* Render Banners */}
                    {banners.map(banner => (
                        <div key={banner.id} className="w-full bg-black text-white px-4 py-2 text-sm text-center roundedcursor-pointer cursor-pointer" dangerouslySetInnerHTML={{ __html: banner.description }}>
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
