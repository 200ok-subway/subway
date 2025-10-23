import { useEffect, useState } from "react";
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from "react-kakao-maps-sdk";
import { useNavigate } from "react-router-dom";
import "./SubwayLineList.css";
import { useDispatch } from "react-redux";
import listGeom from "../../data/listGeom.js";
import { get1To9LineOnOrigin } from "../../utils/listSubwayGeom1to9Util.js";

export default function SubwayLineList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // dispatch(getSubwayList()); // 원래는 API로 실시간으로 받아오려했으나, CORS 대응이 안되어 있어 불가
  }, [dispatch]);

  // ---------- kakao MAp ----------
  const appkey = import.meta.env.VITE_KAKAO_APP_KEY; // kakao app key
  useKakaoLoader({ appkey, libraries: ["services", "clusterer"] }); // kakao map loder
  const [coordinate, setCoordinate] = useState({lat: 37.554648, lng: 126.970607}); // 좌표 스테이트(초기값 서울역)
  const MAP_LAVEL = 5; // kakao map 확대(초기값 5)

  // ---------- kakao Marker ----------
  const [markerItem, setMarkerItem] = useState(null);

  // 검색창에서 선택한 역정보 마커와 좌표 셋팅
  function selectStation(item) {
    setMarkerItem(item);
    setCoordinate({lat: item.convY,lng: item.convX})
  }

  // ---------- search ----------
  // const stationList = useSelector(state => state.subwayLineList.stationList);
  const stationList = get1To9LineOnOrigin(listGeom);
  const [searchList, setSearchList] = useState([]); // 검색 결과 배열
  
  // 검색 처리 함수
  function searchStationList(e) {
    const searchList = stationList.filter(item => item.stnKrNm.includes(e.target.value.trim()));
    dispatch(setSearchList(searchList));
  }

  // ---------- redirect ----------
  function goToStationDetail(stnKrNm) {
    navigate(`/station/${stnKrNm}`);
  }

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
            onChange={searchStationList}
            placeholder="정류장명을 입력해주세요"
          />
        </div>

        <div className={`subway-results ${searchList.length === 0 && 'subway-results-items-center'}`}>
          {
            searchList.length === 0 && <div className="subway-empty">예) "서울" → 서울역, 서울대입구</div>
          }
          {
            searchList.length > 0 && searchList.map((item, idx) => {
              return (
                <div className="subway-item" key={`${item.outStnNum}-${idx}`} onClick={() => { selectStation(item) }}>
                  <div className="subway-item-name">{item.stnKrNm}</div>
                  <div className="subway-item-line">{item.lineNm}</div>
                </div>
              )
            })
          }
        </div>
      </aside>
      <section className="subway-map">
        <Map
          center={coordinate}
          style={{ width: "100%", height: "400px" }}
          level={MAP_LAVEL}
        >
          {
            markerItem && (
              <>
                <MapMarker position={coordinate} onClick={() => { goToStationDetail(markerItem.stnKrNm) }} />
                <CustomOverlayMap position={coordinate}>
                  <div className="subway-overlay clickable" onClick={() => { goToStationDetail(markerItem.stnKrNm) }}>
                      <div className="subway-ov-title">{markerItem.stnKrNm} {markerItem.lineNm}</div>
                  </div>
                </CustomOverlayMap>
              </>
            )
          }
        </Map>
      </section>
    </div>
  );
}