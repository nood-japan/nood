/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography, TextField, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { MarkerClusterer } from '@googlemaps/markerclusterer';

// 味フィルタ
const FLAVORS = [
  { label: '未指定', value: '' },
  { label: '醤油', value: '醤油' },
  { label: '塩', value: '塩' },
  { label: '味噌', value: '味噌' },
  { label: '豚骨', value: '豚骨' },
  { label: '魚介系', value: '魚介' },
  { label: '鶏白湯', value: '鶏白湯' },
];

// 系統フィルタ
const STYLES = [
  { label: '未指定', value: '' },
  { label: '家系', value: '家系' },
  { label: '二郎系', value: '二郎系' },
  { label: 'つけ麺', value: 'つけ麺' },
  { label: '油そば', value: '油そば' },
  { label: '湯麺', value: 'タンメン' },
  { label: '担々麺', value: '担々麺' },
];

const GENRES = [
  { label: '全て', keyword: 'ラーメン 油そば' },
  { label: '二郎系', keyword: '二郎系ラーメン' },
  { label: '家系', keyword: '家系ラーメン' },
  { label: '油そば', keyword: '油そば' },
];

import React from 'react';



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
}

export const RamenMapFilters: React.FC<RamenMapFiltersProps> = ({
  flavor,
  styleValue,
  setFlavor,
  setStyleValue,
}) => {
  // RamenMapFilters内で外部のsearchRamenを直接呼べないため、親でsetFlavor/setStyleをラップし再検索を即時トリガーする仕組みを使う
  // ここではonChangeで渡されたsetFlavor/setStyleが即時反映される前提（useEffectで十分な場合はこのままでもOK）

  return (
    <Box data-testid="filter-group" aria-label="フィルタ" sx={{ width: '100%', minHeight: 89, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 2.6, px: 1.6, gap: 2.6/1.618, background: 'rgba(255,255,255,0.95)', borderRadius: 2.6, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* --- 味フィルタ --- */}
      <Box data-testid="flavor-filter" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.6/1.618, gap: 1.6, width: '100%' }}>
        <Typography variant="subtitle2" sx={{ mr: 1.6, minWidth: 32, color: 'text.secondary', fontWeight: 700, flexShrink: 0 }}>味</Typography>
        <Box sx={{ overflowX: 'auto', whiteSpace: 'nowrap', flex: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
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
      </Box>
      {/* --- 系列フィルタ --- */}
      <Box data-testid="style-filter" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0, gap: 1.6, width: '100%' }}>
        <Typography variant="subtitle2" sx={{ mr: 1.6, minWidth: 32, color: 'text.secondary', fontWeight: 700, flexShrink: 0 }}>系統</Typography>
        <Box sx={{ overflowX: 'auto', whiteSpace: 'nowrap', flex: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
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
    </Box>
  );
};

type RamenMapProps = { height?: string, showOnlyMap?: boolean, searchKeyword?: string };

export default function RamenMap({ height = '35vh', showOnlyMap = false, searchKeyword = '' }: RamenMapProps): any {
  // --- 検索キーワードのローカル状態 ---
  const [loading, setLoading] = useState(false);
  const [localSearch, setLocalSearch] = useState<string>(searchKeyword || '');
  // --- フック・ロジックはここから ---
  const mapRef = useRef<HTMLDivElement>(null);
  // Google Mapsインスタンスとピン・クラスタ参照を必ず宣言
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  // 初期地図位置はIPアドレスから取得、日本外や失敗時は日本全体
  const JAPAN_CENTER = { lat: 36.2048, lng: 138.2529, zoom: 5 };
  const [center, setCenter] = useState<{ lat: number; lng: number; zoom: number }>(JAPAN_CENTER);

  const [flavor, setFlavorState] = useState(FLAVORS[0].value);
  const [styleValue, setStyleValueState] = useState(STYLES[0].value);

  // --- 初回のみIPアドレスから位置情報を取得しcenterをセット ---
  useEffect(() => {
    fetch('/api/ipgeo')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          setCenter({ lat: data.latitude, lng: data.longitude, zoom: 13 });
        } else {
          setCenter(JAPAN_CENTER);
        }
      })
      .catch(() => {
        setCenter(JAPAN_CENTER);
      });
  }, []);

  // centerが変わったときのみピン再描画（地名・都道府県・初期表示すべて対応）
  useEffect(() => {
    if (!window.google || !mapInstance.current) return;
    // center更新時にGoogle Mapインスタンスへ反映
    mapInstance.current.setCenter({ lat: center.lat, lng: center.lng });
    mapInstance.current.setZoom(center.zoom);
    searchRamen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, flavor, styleValue]);

  // 非同期ピン再検索関数
  async function searchRamen() {
    setLoading(true);
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
    // ここでは何もしない（centerの更新はユーザー操作時のみ）

    // 3. 従来通りnearbySearchでラーメン店一覧
    const bounds = map.getBounds();
    if (!bounds) {
      setLoading(false);
      return;
    }
    const keyword = `${styleValue ? styleValue + ' ' : (!styleValue && flavor ? flavor + ' ' : '')}ラーメン`.trim();
    service.nearbySearch({
      bounds,
      keyword,
      type: 'restaurant',
      rankBy: google.maps.places.RankBy.PROMINENCE,
    }, (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        // InfoWindowは1つだけ生成し使い回す
        const infoWindow = new google.maps.InfoWindow();
        results.forEach(place => {
          if (!place.geometry || !place.geometry.location) return;
          // 系統・味の判定（name, types, vicinity, etc.から判別）
          let pinColor = '#D32F2F'; // デフォルト赤
          // 系統優先
          for (const s of STYLES) {
            if (s.value && place.name && place.name.includes(s.value)) {
              pinColor = STYLE_COLORS[s.value] || pinColor;
              break;
            }
          }
          // 系統ヒットしなければ味で色分け
          if (pinColor === '#D32F2F') {
            for (const f of FLAVORS) {
              if (f.value && place.name && place.name.includes(f.value)) {
                pinColor = '#1976D2'; // 味噌・塩・醤油などは青系で仮設定（必要ならFLAVORSに色を追加してもOK）
                break;
              }
            }
          }
          const marker = new google.maps.Marker({
            map,
            position: place.geometry.location,
            title: place.name,
            icon: getPinSvg(pinColor),
          });
          let infoWindow: google.maps.InfoWindow | null = null;
          if (place.name) {
            const rating = place.rating || null;
const ratingCount = place.user_ratings_total || null;
const scoreText = rating ? `<span style='font-size:13px;font-weight:500;color:#888;margin-left:4px;'>${Number(rating).toFixed(1)} ${'★'.repeat(Math.round(Number(rating)))}${'☆'.repeat(5-Math.round(Number(rating)))}</span>` : '';
const ratingCountText = ratingCount ? `<span style='font-size:11px;color:#bbb;margin-left:2px;'>(${ratingCount})</span>` : '';
infoWindow = new google.maps.InfoWindow({
  content: `<div style="font-size:13px;font-weight:600;padding:4px 10px 3px 10px;background:#fff;border-radius:8px;border:none !important;box-shadow:none !important;white-space:nowrap;color:#222;min-width:0;display:flex;flex-direction:column;align-items:flex-start;line-height:1.2;position:relative;">
    <div style='font-size:13px;font-weight:700;margin-bottom:2px;'>${place.name.replace(/"/g, '&quot;')}</div>
    ${scoreText}${ratingCountText}
    <style>
      .gm-ui-hover-effect{display:none!important;}
      .gm-style-iw{border:none!important;box-shadow:none!important;}
    </style>
  </div>`,
  disableAutoPan: true,
});
            marker.addListener('mouseover', () => {
              infoWindow?.open({ map, anchor: marker, shouldFocus: false });
            });
            marker.addListener('mouseout', () => {
              infoWindow?.close();
            });
            marker.addListener('click', () => {
              infoWindow?.open({ map, anchor: marker, shouldFocus: false });
            });
            map.addListener('click', () => {
              infoWindow?.close();
            });
          }
          markersRef.current.push(marker);
        });
        // マーカークラスタリング
        clustererRef.current = new MarkerClusterer({
          map,
          markers: markersRef.current,
        });
      }
      setLoading(false);
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

  useEffect(() => {
    if (window.google && mapRef.current && !mapInstance.current) {
      console.log('Google Mapsを初期化:', mapRef.current, center);
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: center.lat, lng: center.lng },
        zoom: center.zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        rotateControl: false,
        scaleControl: false,
        panControl: false,
        disableDefaultUI: false,
        mapId: undefined,
      });
    }
  }, [center, mapRef.current]);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, maxWidth: 400 }}>
        <form style={{ width: '100%' }} onSubmit={e => { e.preventDefault();
          if (localSearch && localSearch.trim() !== '') {
            const google = window.google as typeof window.google;
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: localSearch }, (results, status) => {
              if (status === 'OK' && results && results.length > 0) {
                const loc = results[0].geometry.location;
                setCenter({ lat: loc.lat(), lng: loc.lng(), zoom: 13 });
                
              }
            });
          }
        }}>
          <TextField
            size="small"
            fullWidth
            variant="outlined"
            placeholder="地名・駅名・店名などで検索"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="検索"
                    onClick={() => {
                      if (localSearch && localSearch.trim() !== '') {
                        const google = window.google as typeof window.google;
                        const geocoder = new google.maps.Geocoder();
                        geocoder.geocode({ address: localSearch }, (results, status) => {
                          if (status === 'OK' && results && results.length > 0) {
                            const loc = results[0].geometry.location;
                            setCenter({ lat: loc.lat(), lng: loc.lng(), zoom: 13 });

                          }
                        });
                      }
                    }}
                    edge="end"
                    size="small"
                  >
                    <span role="img" aria-label="検索">🔍</span>
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </form>
      </Box>
      <Box data-testid="ramen-map-section" sx={{ width: '100%', maxWidth: 900, mx: 'auto', mt: 2, position: 'relative' }}>

        <div ref={mapRef} style={{ width: '100%', height: '56vw', maxHeight: 600, minHeight: 360, background: '#eee', aspectRatio: '16/9' }} onClick={() => {
          if (window.google && mapRef.current && !mapInstance.current) {
            console.log('【手動】Google Mapsを再初期化:', mapRef.current, center);
            mapInstance.current = new window.google.maps.Map(mapRef.current, {
              center: { lat: center.lat, lng: center.lng },
              zoom: center.zoom,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              zoomControl: true,
              rotateControl: false,
              scaleControl: false,
              panControl: false,
              disableDefaultUI: false,
              mapId: undefined,
            });
          }
        }} />
        {loading && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)' }}>
            <CircularProgress />
          </Box>
        )}
      </Box>
      {!showOnlyMap && (
        <RamenMapFilters
          flavor={flavor}
          styleValue={styleValue}
          setFlavor={setFlavorState}
          setStyleValue={setStyleValueState}


        />
      )}
    </Box>
  );
}
