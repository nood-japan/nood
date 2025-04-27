/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { MarkerClusterer } from '@googlemaps/markerclusterer';

// 味フィルタ
const FLAVORS = [
  { label: '全て', value: '' },
  { label: '醤油', value: '醤油' },
  { label: '塩', value: '塩' },
  { label: '味噌', value: '味噌' },
  { label: '豚骨', value: '豚骨' },
  { label: '魚介系', value: '魚介' },
  { label: '鶏白湯', value: '鶏白湯' },
];

// 系統フィルタ
const STYLES = [
  { label: '全て', value: '' },
  { label: '家系', value: '家系' },
  { label: '二郎系', value: '二郎系' },
  { label: 'つけ麺', value: 'つけ麺' },
  { label: '油そば', value: '油そば' },
  { label: 'タンメン', value: 'タンメン' },
  { label: '担々麺', value: '担々麺' },
];

const GENRES = [
  { label: '全て', keyword: 'ラーメン 油そば' },
  { label: '二郎系', keyword: '二郎系ラーメン' },
  { label: '家系', keyword: '家系ラーメン' },
  { label: '油そば', keyword: '油そば' },
];

import React from 'react';
import { PREFECTURES } from './prefectures';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

export default function RamenMap({ height = '35vh' }: { height?: string }): React.ReactElement {
  const mapRef = useRef<HTMLDivElement>(null);
  // 都道府県選択
  const [pref, setPref] = useState<{ name: string; lat: number; lng: number; zoom: number }>(PREFECTURES.find(p => p.name === '沖縄県')!);

  // 初回のみIPジオロケーションAPIで自動地域判定（pref依存を絶対に付けない！）
  useEffect(() => {
    let isFirst = true;
    if (!isFirst) return;
    isFirst = false;
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        console.log('IPジオロケーション結果:', data);
        if (data && data.latitude && data.longitude) {
          // 都道府県名が取れればPREFECTURESから選択、なければ緯度経度で直接セット
          const prefMatch = PREFECTURES.find(p => data.region && (p.name === data.region || p.name.replace('県','') === data.region.replace('県','')));
          if (prefMatch) {
            setPref(prefMatch);
          } else {
            setPref({ name: data.region || '推定エリア', lat: data.latitude, lng: data.longitude, zoom: 10 });
          }
        }
      })
      .catch(() => {/* 失敗時は何もしない（沖縄県fallback） */});
  }, []);

  // 現在地ボタンハンドラ
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('このブラウザは位置情報取得に対応していません');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setPref({ name: '現在地', lat: latitude, lng: longitude, zoom: 13 });
        if (mapInstance.current) {
          mapInstance.current.setCenter({ lat: latitude, lng: longitude });
          mapInstance.current.setZoom(13);
        }
      },
      err => {
        alert('位置情報の取得に失敗しました');
      }
    );
  };
  const [flavor, setFlavor] = useState(FLAVORS[0].value);
  const [style, setStyle] = useState(STYLES[0].value);
  const [genre, setGenre] = useState(GENRES[0].keyword);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);

  // 系統ごとのイメージカラー
  // 系列キーワード取得ユーティリティ
function getStyleKeywords(style: string): string[] {
  const STYLE_KEYWORDS: Record<string, string[]> = {
    '家系': ['家系', '吉村家', '豚骨醤油', 'ほうれん草', 'のり'],
    '二郎系': ['二郎', 'ニンニク', 'ヤサイマシ', '極太麺', 'マシマシ'],
    'つけ麺': ['つけ麺', '特製つけ麺'],
    '油そば': ['油そば', 'まぜそば'],
    'タンメン': ['タンメン'],
    '担々麺': ['担々麺', '坦々麺', 'ごま', '辣油'],
  };
  return style && STYLE_KEYWORDS[style] ? STYLE_KEYWORDS[style] : style ? [style] : [];
}


const STYLE_COLORS: Record<string, string> = {
  '二郎系': '#FFD600', // 黄色
  '家系': '#43A047',   // 緑
  'つけ麺': '#1976D2', // 青
  '油そば': '#FF9800', // オレンジ
  'タンメン': '#00BCD4', // 水色
  '担々麺': '#D32F2F', // 赤
};

  // SVGピン生成
  const getPinSvg = (color: string) => {
    return {
      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: '#333',
      scale: 2,
      anchor: new google.maps.Point(12, 24),
    } as google.maps.Symbol;
  };

  // 初回のみMap生成
  // 地図インスタンス生成は初回のみ
  useEffect(() => {
    if (!window.google || !mapRef.current || mapInstance.current) return;
    const google = window.google as typeof window.google;
    mapInstance.current = new google.maps.Map(mapRef.current, {
      center: { lat: pref.lat, lng: pref.lng },
      zoom: pref.zoom,
      mapId: '5bbba098b4313da1',
      // mapTypeControl: false,
      // streetViewControl: false,
      // fullscreenControl: false,
      // zoomControl: false,
      // rotateControl: false,
      // scaleControl: false,
      // clickableIcons: false,
      // keyboardShortcuts: false,
      // panControl: false,
      // doubleClickZoom: false, // MapOptions型に存在しないため削除
      // scrollwheel: false,
      // draggable: true, // 地図自体はドラッグ可（完全固定したい場合はfalseに）
    });
    // InfoWindowの閉じるボタンを非表示にするCSSを注入
    const style = document.createElement('style');
    style.innerHTML = '.gm-ui-hover-effect { display: none !important; }';
    document.head.appendChild(style);
  }, []);

  // pref変更時は地図中心だけ変更
  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.setCenter({ lat: pref.lat, lng: pref.lng });
    mapInstance.current.setZoom(pref.zoom);
  }, [pref]);

  // ジャンル変更・地図移動時にピン再検索
  useEffect(() => {
    if (!window.google || !mapInstance.current) return;
    const google = window.google as typeof window.google;
    const map = mapInstance.current;
    const service = new google.maps.places.PlacesService(map);

    function searchRamen() {
      const bounds = map.getBounds();
      if (!bounds) return;
      // 既存ピン削除
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
      service.nearbySearch({
        bounds,
        // 系列（style）が全て以外で選択されている場合は味を無視
        keyword: `${style ? style + ' ' : (!style && flavor ? flavor + ' ' : '')}ラーメン`.trim(),
        type: 'restaurant',
        rankBy: google.maps.places.RankBy.PROMINENCE,
      }, (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const styleKeywords = getStyleKeywords(style);
          const filterByDetails = async (places: google.maps.places.PlaceResult[]) => {
            if (!style || styleKeywords.length === 0) return places;
            const filtered: google.maps.places.PlaceResult[] = [];
            // 最大20件まで
            for (const place of places.slice(0, 20)) {
              let matched = false;
              // 店名判定
              if (place.name && styleKeywords.some(w => place.name!.includes(w))) {
                matched = true;
              }
              // 詳細取得（説明・口コミ）
              if (!matched && typeof place.place_id === 'string' && place.place_id) {
                await new Promise<void>(resolve => {
                  service.getDetails(
                    { placeId: place.place_id, fields: ['editorial_summary', 'reviews', 'formatted_address', 'name'] },
                    (details: google.maps.places.PlaceResult, status: google.maps.places.PlacesServiceStatus) => {
                      if (status === google.maps.places.PlacesServiceStatus.OK && details) {
                        // editorial_summaryは型定義にないため、anyで参照
                        const overview = (details as any).editorial_summary?.overview;
                        const texts = [
                          overview || '',
                          details.formatted_address || '',
                          ...(details.reviews?.map((r: google.maps.places.PlaceReview) => r.text || '') || [])
                        ].filter(Boolean).join(' ');
                        if (styleKeywords.some(w => texts.includes(w))) {
                          matched = true;
                        }
                      }
                      resolve();
                    }
                  );
                });
        resolve();
      }
    });

              }
              if (matched) filtered.push(place);
            }
            return filtered;
          };

          filterByDetails(results).then(filteredResults => {
            filteredResults.forEach(place => {
              if (!place.geometry?.location) return;
              // ピン色分岐: styleが全て以外ならその色、そうでなければ赤
              const pinColor = style && STYLE_COLORS[style] ? STYLE_COLORS[style] : '#D32F2F';
              const marker = new google.maps.Marker({
                map,
                position: place.geometry.location,
                title: place.name,
                icon: getPinSvg(pinColor),
              } else {
        // place_idがstring型でなければ即resolve
        resolve();
      }
    });

              // 店名ラベル（InfoWindow）はホバー/タップ時のみ表示
              let infoWindow: google.maps.InfoWindow | null = null;
              // @ts-ignore

              if (place.name) {
                infoWindow = new google.maps.InfoWindow({
                  content: `<div style="font-size:14px;font-weight:bold;padding:2px 6px;background:#fff;border-radius:6px;border:none;box-shadow:none;white-space:nowrap;color:#222;">${place.name.replace(/"/g, '&quot;')}</div>`,
                  disableAutoPan: true,
                } else {
        // place_idがstring型でなければ即resolve
        resolve();
      }
    });

                // PC: hover, モバイル: click/tap
                marker.addListener('mouseover', () => {
                  infoWindow?.open({ map, anchor: marker, shouldFocus: false });
                } else {
        // place_idがstring型でなければ即resolve
        resolve();
      }
    });

                marker.addListener('mouseout', () => {
                  infoWindow?.close();
                } else {
        // place_idがstring型でなければ即resolve
        resolve();
      }
    });

                marker.addListener('click', () => {
                  infoWindow?.open({ map, anchor: marker, shouldFocus: false });
                } else {
        // place_idがstring型でなければ即resolve
        resolve();
      }
    });

                // 地図クリック時にInfoWindowを閉じる
                map.addListener('click', () => {
                  infoWindow?.close();
                } else {
        // place_idがstring型でなければ即resolve
        resolve();
      }
    });

              }
              markersRef.current.push(marker);
            } else {
        // place_idがstring型でなければ即resolve
        resolve();
      }
    });

            // クラスタの再適用: まず古いクラスタをクリア
            if (clustererRef.current) {
              clustererRef.current.clearMarkers();
              clustererRef.current = null;
            }
            if (markersRef.current.length > 2) {
              // 3つ以上の時のみクラスタ化
              clustererRef.current = new MarkerClusterer({
                map,
                markers: markersRef.current,
              } else {
        // place_idがstring型でなければ即resolve
        resolve();
      }
    });

            } else {
              // 2つ以下なら個別ピンのみ
              markersRef.current.forEach(marker => marker.setMap(map));
            }
          } else {
        // place_idがstring型でなければ即resolve
        resolve();
      }
    });

        }
      } else {
        // place_idがstring型でなければ即resolve
        resolve();
      }
    });

    };
    // 地図移動やジャンル切り替えで再検索
    const idleListener = map.addListener('idle', searchRamen);
    // 初回も即検索
    searchRamen();
    return () => {
      google.maps.event.removeListener(idleListener);
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [flavor, style]);


  return (
    <Box>
      {/* 都道府県フィルタ */}

      <div ref={mapRef} style={{ width: '100%', height: height }} />
      {/* 味フィルタ */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, zIndex: 10, position: 'relative' }}>
        <ToggleButtonGroup
          value={flavor}
          exclusive
          onChange={(_e, newFlavor) => { if (newFlavor !== undefined) setFlavor(newFlavor); }}
          size="small"
          disabled={style !== ''}
        >
          {FLAVORS.map(f => (
            <ToggleButton key={f.value} value={f.value}>
              {f.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      {/* 系統フィルタ */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, zIndex: 10, position: 'relative' }}>
        <ToggleButtonGroup
          value={style}
          exclusive
          onChange={(_e, newStyle) => { if (newStyle !== undefined) setStyle(newStyle); }}
          size="small"
        >
          {STYLES.map(s => (
            <ToggleButton key={s.value} value={s.value}>
              {s.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}
