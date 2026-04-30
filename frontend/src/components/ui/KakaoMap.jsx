import React, {useEffect, useRef} from "react";

const KakaoMap = ({markets}) =>{
  const mapRef = useRef(null);

  useEffect(()=>{
    if(!window.kakao || !mapRef.current) return;

    const {kakao} = window;

    const map=new kakao.maps.Map(mapRef.current,{
      center: new kakao.maps.LatLng(37.5665, 126.9780),
      level: 5
    });

    if(markets.length ===0) return;

    const bounds = new kakao.maps.LatLngBounds();

    markets.forEach(market=>{
      if(!market.latitude || !market.longitude) return;

      const position = new kakao.maps.LatLng(
        market.latitude, market.longitude
      );

      const marker = new kakao.maps.Marker({
        map,
        position,
        title: market.marketName
      });

      const infoContent = `
        <div style = "padding:8px 12px; font-size:16px; font-weight:700;">
        🏪 ${market.marketName}
        <div style="font-size:13px; color:#666; margin-top:4px;>
        ${market.item?.map(i=>i.name).join(', ')}
        </div>
        </div>
      `;

      const infoWindow = new kakao.maps.InfoWindow({
        content: infoContent
      });

      kakao.maps.event.addListener(marker, 'click', ()=>{
        infoWindow.open(map, marker);
      });
      bounds.extend(position);
    });
    map.setBounds(bounds);
  },[markets]);
  return(
    <div ref={mapRef} style={{width:'100%', height:'300px'}}/>
  );
};

export default KakaoMap;