import React, { useEffect, useRef, useCallback } from 'react';

const KakaoMap = ({ markets, style = {} }) => {
    const mapRef = useRef(null);

    const initMap = useCallback((node) => {
        if (!node) return;
        mapRef.current = node;

        const tryInit = () => {
            if (!window.kakao || !window.kakao.maps) {
                setTimeout(tryInit, 300);
                return;
            }

            const { kakao } = window;
            const map = new kakao.maps.Map(node, {
                center: new kakao.maps.LatLng(37.5665, 126.9780),
                level: 5
            });

            if (!markets || markets.length === 0) return;

            const bounds = new kakao.maps.LatLngBounds();
            markets.forEach(market => {
                if (!market.latitude || !market.longitude) return;
                const position = new kakao.maps.LatLng(market.latitude, market.longitude);
                const marker = new kakao.maps.Marker({ map, position, title: market.marketName });
                const infoContent = `
                    <div style="padding:8px 12px; font-size:13px; font-weight:700;">
                        🏪 ${market.marketName}
                        <div style="font-size:11px; color:#666; margin-top:4px;">
                            ${market.items?.map(i => i.name).join(', ')}
                        </div>
                    </div>
                `;
                const infoWindow = new kakao.maps.InfoWindow({ content: infoContent });
                kakao.maps.event.addListener(marker, 'click', () => infoWindow.open(map, marker));
                bounds.extend(position);
            });

            if (markets.length > 0) map.setBounds(bounds);
        };

        tryInit();
    }, [markets]);

    return (
        <div
            ref={initMap}
            style={{ width: '100%', height: '280px', ...style }}
        />
    );
};

export default KakaoMap;