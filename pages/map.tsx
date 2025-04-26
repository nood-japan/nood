import { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 26.2124, lng: 127.6809 }, // 沖縄県那覇市
      zoom: 11,
    });

    let markers: google.maps.Marker[] = [];
    const service = new window.google.maps.places.PlacesService(map);

    const searchRamen = () => {
      const bounds = map.getBounds();
      if (!bounds) return;
      // 既存マーカーを削除
      markers.forEach(marker => marker.setMap(null));
      markers = [];
      service.nearbySearch(
        {
          bounds,
          keyword: 'ラーメン 油そば',
          type: 'restaurant',
          rankBy: google.maps.places.RankBy.PROMINENCE,
        },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            results.slice(0, 20).forEach(place => {
              if (!place.geometry?.location) return;
              const marker = new window.google.maps.Marker({
                map,
                position: place.geometry.location,
                title: place.name,
              });
              markers.push(marker);
            });
          }
        }
      );
    };

    map.addListener('idle', searchRamen);
    // 初回も検索
    window.google.maps.event.addListenerOnce(map, 'idle', searchRamen);
    // クリーンアップ
    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
  }, []);

  return (
    <Box sx={{ height: '90vh', width: '100%' }}>
      <Typography variant="h6" align="center" sx={{ mt: 2 }}>
        沖縄県のラーメン店マップ
      </Typography>
      <Box ref={mapRef} sx={{ height: '85vh', width: '100%' }} id="map" />
    </Box>
  );
}
