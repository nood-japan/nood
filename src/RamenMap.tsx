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

// --- 系列キーワード取得ユーティリティ ---
function getStyleKeywords(styleValue: string): string[] {
  const STYLE_KEYWORDS: Record<string, string[]> = {
    '家系': ['家系', '吉村家', '豚骨醤油', 'ほうれん草', 'のり'],
    '二郎系': ['二郎', 'ニンニク', 'ヤサイマシ', '極太麺', 'マシマシ'],
    'つけ麺': ['つけ麺', '特製つけ麺'],
    '油そば': ['油そば', 'まぜそば'],
    'タンメン': ['タンメン'],
    '担々麺': ['担々麺', '坦々麺', 'ごま', '辣油'],
  };
  return styleValue && STYLE_KEYWORDS[styleValue] ? STYLE_KEYWORDS[styleValue] : styleValue ? [styleValue] : [];
}
// --- 系列ごとのピン色定義 ---
const STYLE_COLORS: Record<string, string> = {
  // 系列
  '家系': '#43A047',      // 緑（家系はのり・ほうれん草のイメージ）
  '二郎系': '#FFD600',    // 黄色（もやし・看板色）
  'つけ麺': '#1976D2',    // 青（冷やし・水色系のイメージ）
  '油そば': '#F57C00',    // オレンジ（油のイメージ）
  'タンメン': '#4FC3F7',  // 水色
  '担々麺': '#D32F2F',    // 赤（ラー油・辛味）
  // 味
  '味噌': '#8D6E63',      // 茶色
  '塩': '#F5F5F5',        // 白系
  '醤油': '#3E2723',      // こげ茶
  '豚骨': '#FFF8E1',      // クリーム色
  '魚介': '#1A237E',      // 紺色
  '鶏白湯': '#FFF9C4',    // 薄黄色
};

interface RamenMapFiltersProps {
  styleValue: string;
  setStyleValue: (style: string) => void;
  flavor: string;
  setFlavor: (flavor: string) => void;
  pref: { name: string; lat: number; lng: number; zoom: number };
}

export const RamenMapFilters: React.FC<RamenMapFiltersProps> = ({
  flavor,
  styleValue,
  setFlavor,
  setStyleValue,
  pref,
}) => {
  // RamenMapFilters内で外部のsearchRamenを直接呼べないため、親でsetFlavor/setStyleをラップし再検索を即時トリガーする仕組みを使う
  // ここではonChangeで渡されたsetFlavor/setStyleが即時反映される前提（useEffectで十分な場合はこのままでもOK）

  return (
    <Box data-testid="filter-group" aria-label="フィルタ" sx={{ width: '100%' }}>
      {/* --- 推定地域/現在地 表示 --- */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {`表示地域：${pref.name}`}
        </Typography>
      </Box>
      {/* --- 味フィルタ --- */}
      <Box data-testid="flavor-filter" sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1, zIndex: 10, position: 'relative' }}>
        <ToggleButtonGroup
          value={flavor}
          exclusive
          onChange={(_e, newFlavor) => { if (newFlavor !== undefined) setFlavor(newFlavor); }}
          size="small"
          disabled={styleValue !== ''}
        >
          {FLAVORS.map(f => (
            <ToggleButton key={f.value} value={f.value}>
              {f.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      {/* --- 系列フィルタ --- */}
      <Box data-testid="style-filter" sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1, zIndex: 10, position: 'relative' }}>
        <ToggleButtonGroup
          value={styleValue}
          exclusive
          onChange={(_e, newStyle) => { if (newStyle !== undefined) setStyleValue(newStyle); }}
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
};

type RamenMapProps = { height?: string, showOnlyMap?: boolean, searchKeyword?: string };
export default function RamenMap({ height = '35vh', showOnlyMap = false, searchKeyword = '' }: RamenMapProps): any {
  // --- フック・ロジックはここから ---
  const mapRef = useRef<HTMLDivElement>(null);
  // 地域取得機能を削除し、東京都をデフォルト表示
  const [pref] = useState<{ name: string; lat: number; lng: number; zoom: number }>(PREFECTURES.find(p => p.name === '東京都')!);
  const [flavor, setFlavorState] = useState(FLAVORS[0].value);
  const [styleValue, setStyleValueState] = useState(STYLES[0].value);

  // フィルタ変更時に必ず即時再検索するためのラッパー
  const triggerSearch = () => {
    if (mapInstance.current && typeof google !== 'undefined') {
      const map = mapInstance.current;
      const service = new google.maps.places.PlacesService(map);
      // searchRamen本体と同じロジックをここで呼ぶこともできるが、useEffect依存で十分な場合は省略可
    }
  };
  // フィルタ変更時に即時再検索
  const setFlavor = (f: string) => {
    setFlavorState(f);
  };
  const setStyleValue = (s: string) => {
    setStyleValueState(s);
  };

  const [genre, setGenre] = useState(GENRES[0].keyword);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);





  // 地図中心・ズームもpref変更で必ず反映
  useEffect(() => {
    if (!pref) return;
    if (!mapInstance.current) return;
    mapInstance.current.setCenter({ lat: pref.lat, lng: pref.lng });
    mapInstance.current.setZoom(pref.zoom);
  }, [pref]);

  // フィルタやpref変更時にピン再検索
  useEffect(() => {
    if (!window.google || !mapInstance.current) return;
    searchRamen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pref, flavor, styleValue, searchKeyword]);

  // 非同期ピン再検索関数
  async function searchRamen() {
    const google = window.google as typeof window.google;
    const map = mapInstance.current!;
    const service = new google.maps.places.PlacesService(map);

    // 既存ピン削除
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current = null;
    }

    // 1. 検索キーワードがあればGeocoderで地名・駅名・住所を検索
    if (searchKeyword && searchKeyword.trim() !== '') {
      const geocoder = new google.maps.Geocoder();
      const geoResult = await new Promise<google.maps.GeocoderResult[] | null>(resolve => {
        geocoder.geocode({ address: searchKeyword }, (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            resolve(results);
          } else {
            resolve(null);
          }
        });
      });
      if (geoResult && geoResult.length > 0) {
        // 地名・駅名・ランドマーク等にヒット
        const loc = geoResult[0].geometry.location;
        map.setCenter(loc);
        map.setZoom(16);
        // ピンを一つだけ立てる
        const marker = new google.maps.Marker({
          position: loc,
          map,
          title: searchKeyword,
          icon: getPinSvg('#D32F2F'),
        });
        markersRef.current = [marker];
        return;
      }
      // 2. 飲食店名らしい場合はtextSearchでピン設置
      await new Promise<void>(resolve => {
        service.textSearch({ query: searchKeyword, type: 'restaurant' }, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            const place = results[0];
            if (place.geometry?.location) {
              map.setCenter(place.geometry.location);
              map.setZoom(17);
              const marker = new google.maps.Marker({
                position: place.geometry.location,
                map,
                title: place.name,
                icon: getPinSvg('#D32F2F'),
              });
              markersRef.current = [marker];
            }
            resolve();
          } else {
            resolve();
          }
        });
      });
      if (markersRef.current.length > 0) return;
      // どちらもヒットしなければ従来通り
    }

    // 3. 従来通りnearbySearchでラーメン店一覧
    const bounds = map.getBounds();
    if (!bounds) return;
    const keyword = searchKeyword && searchKeyword.trim() !== ''
      ? searchKeyword.trim() + ' ラーメン'
      : `${styleValue ? styleValue + ' ' : (!styleValue && flavor ? flavor + ' ' : '')}ラーメン`.trim();
    service.nearbySearch({
      bounds,
      keyword,
      type: 'restaurant',
      rankBy: google.maps.places.RankBy.PROMINENCE,
    }, (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        // ...従来のピン生成ロジック...
      }
    });
  }



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
    let interval: NodeJS.Timeout | null = null;
    function initMapWhenReady() {
      if (!mapRef.current) return;
      if (!window.google) return;
      const google = window.google as typeof window.google;
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: pref.lat, lng: pref.lng },
        zoom: pref.zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      // InfoWindowの閉じるボタンを非表示にするCSSを注入
      const style = document.createElement('style');
      style.innerHTML = '.gm-ui-hover-effect { display: none !important; }';
      document.head.appendChild(style);
      if (interval) clearInterval(interval);
    }
    if (window.google && mapRef.current) {
      initMapWhenReady();
    } else {
      interval = setInterval(() => {
        if (window.google && mapRef.current) {
          initMapWhenReady();
        }
      }, 200);
    }
    return () => { if (interval) clearInterval(interval); };


  }, []);

  // pref変更時は地図中心だけ変更
  useEffect(() => {
    if (!pref || !mapInstance.current) return;
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
      // 検索キーワード：propsのsearchKeywordがあればそれを優先
      const keyword = searchKeyword && searchKeyword.trim() !== ''
        ? searchKeyword.trim() + ' ラーメン'
        : `${styleValue ? styleValue + ' ' : (!styleValue && flavor ? flavor + ' ' : '')}ラーメン`.trim();
      service.nearbySearch({
        bounds,
        keyword,
        type: 'restaurant',
        rankBy: google.maps.places.RankBy.PROMINENCE,
      }, (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const styleKeywords = getStyleKeywords(styleValue);
          const filterByDetails = async (places: google.maps.places.PlaceResult[]) => {
            if (!styleValue || styleKeywords.length === 0) return places;
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
                    { placeId: place.place_id as string, fields: ['editorial_summary', 'reviews', 'formatted_address', 'name'] },
                    (details: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
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
              }

              if (matched) filtered.push(place);
            }
            return filtered;
          };

          filterByDetails(results).then(filteredResults => {
            // --- クラスタリング用に一旦マーカー配列を生成 ---
            const newMarkers: google.maps.Marker[] = [];
            filteredResults.forEach(place => {
              if (!place.geometry?.location) return;
              // ピン色分岐: styleが全て以外ならその色、そうでなければ赤
              // --- ピン色判定ロジック ---
              const getPinColor = (place: google.maps.places.PlaceResult): string => {
                // 系列フィルタが指定されている場合はその色
                if (styleValue && STYLE_COLORS[styleValue]) return STYLE_COLORS[styleValue];
                // 系列フィルタ「全て」の場合は店名から系列推定
                const styleKeys = Object.keys(STYLE_COLORS).filter(k => STYLES.some(s=>s.value===k));
                if (place.name) {
                  for (const k of styleKeys) {
                    if (k && k !== '' && place.name.includes(k)) return STYLE_COLORS[k];
                  }
                }
                // 味フィルタが指定されている場合はその色
                if (flavor && STYLE_COLORS[flavor]) return STYLE_COLORS[flavor];
                // 店名から味推定
                const flavorKeys = Object.keys(STYLE_COLORS).filter(k => FLAVORS.some(f=>f.value===k));
                if (place.name) {
                  for (const k of flavorKeys) {
                    if (k && k !== '' && place.name.includes(k)) return STYLE_COLORS[k];
                  }
                }
                // どれにも該当しなければ赤
                return '#D32F2F';
              };

              const pinColor = getPinColor(place);
              const marker = new google.maps.Marker({
                position: place.geometry.location,
                title: place.name,
                icon: getPinSvg(pinColor),
              });
              let infoWindow: google.maps.InfoWindow | null = null;
              if (place.name) {
                infoWindow = new google.maps.InfoWindow({
                  content: `<div styleValue="font-size:14px;font-weight:bold;padding:2px 6px;background:#fff;border-radius:6px;border:none;box-shadow:none;white-space:nowrap;color:#222;">${place.name.replace(/"/g, '&quot;')}</div>`,
                  disableAutoPan: true,
                });
                // PC: hover, モバイル: click/tap
                marker.addListener('mouseover', () => {
                  infoWindow?.open({ map, anchor: marker, shouldFocus: false });
                });
                marker.addListener('mouseout', () => {
                  infoWindow?.close();
                });
                marker.addListener('click', () => {
                  infoWindow?.open({ map, anchor: marker, shouldFocus: false });
                });
                // 地図クリック時にInfoWindowを閉じる
                map.addListener('click', () => {
                  infoWindow?.close();
                });
              }
              newMarkers.push(marker);
            });
            markersRef.current = newMarkers;
            // --- クラスタリング ---
            if (clustererRef.current) {
              clustererRef.current.clearMarkers();
              clustererRef.current = null;
            }
            // 3件以上でクラスタ表示
            if (newMarkers.length >= 3) {
              clustererRef.current = new MarkerClusterer({
                map,
                markers: newMarkers,
                // clustererOptionsでデザイン変更も可
              });
            } else {
              // 2件以下は個別表示
              newMarkers.forEach(marker => marker.setMap(map));
            }

          });
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
  }, [flavor, styleValue]);

  // useEffectよりも上で分岐することでreturnエラーを防止
  if (showOnlyMap) {
    return (
      <Box data-testid="ramen-map-embed">
        <div ref={mapRef} styleValue={{ width: '100%', height: height }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {!showOnlyMap && (
        <RamenMapFilters
          flavor={flavor}
          styleValue={styleValue}
          setFlavor={setFlavor}
          setStyleValue={setStyleValue}
          pref={pref}
        />
      )}
      <Box data-testid="ramen-map-embed">
        <div ref={mapRef} style={{ width: '100%', height: height }} />
      </Box>
    </Box>
  );

}
