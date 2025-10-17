import { useEffect, useMemo, useRef, useState } from "react";
import {
  Map,
  MapMarker,
  CustomOverlayMap,
  MarkerClusterer,
  useKakaoLoader,
} from "react-kakao-maps-sdk";
import { useNavigate } from "react-router-dom";
import "./SubwayLineList.css";

//유틸
import {
  normalizeBigdataToStations,
  findStationByName,
} from "../../utils/listSubwayGeom1to9Util.js";
import { listPresentAndNameList } from "../../utils/subwaySearchUtils.js";
import listGeom from "../../data/listGeom.js";

export default function SubwayLineList({ level = 5, useCluster = true }) {
  const navigate = useNavigate();

  // Kakao SDK
  const appkey = import.meta.env.VITE_KAKAO_APP_KEY;
  useKakaoLoader({ appkey, libraries: ["services", "clusterer"] });

  // 검색어
  const [q, setQ] = useState("");

  // 좌표: 로컬 JSON만 사용
  const stations = useMemo(() => normalizeBigdataToStations(listGeom), []);

  // 왼쪽 리스트: 유틸로 필터 (로컬만)
  const displayList = useMemo(
    () => listPresentAndNameList(listGeom, q).nameList,
    [q]
  );

  const mapRef = useRef(null);
  const [searchMarker, setSearchMarker] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const lastAlertedRef = useRef("");

  // 기본 중심점
  const initialCenter = useMemo(() => {
    const s = findStationByName(stations, "서울역");
    return s ? { lat: s.lat, lng: s.lng } : { lat: 37.554648, lng: 126.970607 };
  }, [stations]);

  // 리스트 클릭 → 지도 이동 + 마커
  const focusStation = (name, line) => {
    const kakao = window.kakao;
    if (!kakao || !mapRef.current) return;

    const hit = findStationByName(stations, name);
    if (hit) {
      const pos = { lat: hit.lat, lng: hit.lng };
      mapRef.current.setCenter(new kakao.maps.LatLng(pos.lat, pos.lng));
      mapRef.current.setLevel(4);
      setSearchMarker({ pos, title: hit.name, line: hit.line || line || "" });
      setInfoOpen(true);
      lastAlertedRef.current = "";
      return;
    }
    setInfoOpen(false);
    setSearchMarker(null);
    if (lastAlertedRef.current !== name) {
      lastAlertedRef.current = name;
      window.alert("데이터에 해당 역이 없습니다.");
    }
  };

  return (
    <div className="subway-container">
      {/* ---------- Left: 검색 패널 ---------- */}
      <aside className="subway-left">
        <div className="subway-tabs">
          <button className="subway-tab active">정류장검색</button>
          <button className="subway-tab">뭐넣지?</button>
        </div>

        <div className="subway-search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="정류장명을 입력해주세요"
          />
          <button onClick={() => { /* 로컬 모드: 버튼은 디바운스 없이 즉시 반영됨 */ }}>
            검색
          </button>
        </div>

        <div className="subway-results">
          {(!displayList || displayList.length === 0) && (
            <div className="subway-empty">예) "서울" → 서울역, 서울대입구</div>
          )}
          {displayList?.map((it, idx) => (
            <div
              key={`${it.name}-${idx}`}
              className="subway-item"
              onClick={() => focusStation(it.name, it.line)}
              title={`${it.name} • ${it.line}`}
            >
              <div className="subway-item-name">{it.name}</div>
              <div className="subway-item-line">{it.line}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* ---------- Right: 지도 ---------- */}
      <section className="subway-map">
        <Map
          center={searchMarker?.pos || initialCenter}
          level={level}
          style={{ width: "100%", height: "clamp(260px, 48vh, 640px)" }}
          onCreate={(map) => (mapRef.current = map)}
        >
          {/* 검색 마커 */}
          {searchMarker?.pos && (
            <>
              <MapMarker
                position={searchMarker.pos}
                onClick={() => setInfoOpen((v) => !v)}
                title={searchMarker.title}
              />
              {infoOpen && (
                <CustomOverlayMap position={searchMarker.pos} yAnchor={1.35}>
                  <div
                    className="subway-overlay clickable"
                    onClick={() =>
                      navigate(
                        `/line-list?name=${encodeURIComponent(searchMarker.title || "")}` +
                          `&line=${encodeURIComponent(searchMarker.line || "")}`
                      )
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        navigate(
                          `/line-list?name=${encodeURIComponent(searchMarker.title || "")}` +
                            `&line=${encodeURIComponent(searchMarker.line || "")}`
                        );
                      }
                    }}
                  >
                    <div className="subway-ov-title">{searchMarker.title}</div>
                    {searchMarker.line && (
                      <div className="subway-ov-addr">{searchMarker.line}</div>
                    )}
                  </div>
                </CustomOverlayMap>
              )}
            </>
          )}

          {/* 1~9호선 역 마커 */}
          {stations.length > 0 &&
            (useCluster ? (
              <MarkerClusterer averageCenter minLevel={6}>
                {stations.map((s) => (
                  <MapMarker
                    key={s.id}
                    position={{ lat: s.lat, lng: s.lng }}
                    title={`${s.name} (${s.line})`}
                    onClick={() => focusStation(s.name, s.line)}
                  />
                ))}
              </MarkerClusterer>
            ) : (
              stations.map((s) => (
                <MapMarker
                  key={s.id}
                  position={{ lat: s.lat, lng: s.lng }}
                  title={`${s.name} (${s.line})`}
                />
              ))
            ))}
        </Map>
      </section>
    </div>
  );
}






