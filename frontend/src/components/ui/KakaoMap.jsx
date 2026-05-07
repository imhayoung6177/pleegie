import React, { useEffect, useRef } from 'react';

const KakaoMap = ({ markets, style = {} }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        let mounted = true;

        const initMap = () => {
            if (!mounted || !containerRef.current) return;
            const { kakao } = window;
            const container = containerRef.current;

            const center = new kakao.maps.LatLng(37.5665, 126.9780);
            const map = new kakao.maps.Map(container, { center, level: 5 });

            if (!markets || markets.length === 0) return;

            const bounds = new kakao.maps.LatLngBounds();
            let hasValidMarker = false;

            markets.forEach(market => {
                if (!market.latitude || !market.longitude) return;
                const position = new kakao.maps.LatLng(market.latitude, market.longitude);
                const marker = new kakao.maps.Marker({ map, position, title: market.marketName });
                const infoContent = `
                    <div style="padding:8px 12px;font-size:13px;font-weight:700;min-width:120px;">
                        🏪 ${market.marketName}
                        <div style="font-size:11px;color:#666;margin-top:4px;">
                            ${market.items?.map(i => i.name).join(', ') || ''}
                        </div>
                    </div>
                `;
                const infoWindow = new kakao.maps.InfoWindow({ content: infoContent });
                kakao.maps.event.addListener(marker, 'click', () => infoWindow.open(map, marker));
                bounds.extend(position);
                hasValidMarker = true;
            });

            if (hasValidMarker) map.setBounds(bounds);
        };

        const tryLoad = () => {
            if (!mounted) return;
            if (!window.kakao || !window.kakao.maps) {
                setTimeout(tryLoad, 300);
                return;
            }
            if (typeof window.kakao.maps.Map !== 'function') {
                window.kakao.maps.load(initMap);
            } else {
                initMap();
            }
        };

        tryLoad();

        return () => { mounted = false; };
    }, [markets]);

    return (
        <div
            ref={containerRef}
            style={{ width: '100%', height: '100%', minHeight: '280px', ...style }}
        />
    );
};

export default KakaoMap;
