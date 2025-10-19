import { useEffect, useState } from "react";
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from "react-kakao-maps-sdk";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./SubwayLineList.css";
import { useDispatch } from "react-redux";
import listGeom from "../../data/listGeom.js";
import { get1To9LineOnOrigin } from "../../utils/listSubwayGeom1to9Util.js";
import SubwayLineDetail from "./SubwayLineDetail.jsx";  


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
  const MAP_LEVEL = 5; // kakao map 확대(초기값 5)

  // ---------- kakao Marker ----------
  const [markerItem, setMarkerItem] = useState(null);
  

  // 검색창에서 선택한 역정보 마커와 좌표 셋팅
  function selectStation(item) {
    setMarkerItem(item);
    setCoordinate({lat: item.convY,lng: item.convX})
  }

  // ---------- search ----------
  // const stationList = useSelector(state => state.subwayLineList.stationList);
  const stationList = get1To9LineOnOrigin(listGeom); // 로컬 데이터 사용
  const [searchList, setSearchList] = useState([]); // 검색 결과 배열
  



  // 검색 처리 함수 // sara (Redux → setState로 변경)
  function searchStationList(e) {
    const searchStationNameOnInput = e.target.value.trim();

    if (!searchStationNameOnInput) {
      setSearchList([]);
      return;
    }
    const nextList = stationList.filter(item => 
      String(item.stnKrNm ?? "").includes(searchStationNameOnInput)
    );
    //   dispatch(setSearchList(searchList)); 리덕스 디스패치 사용 안함 
    setSearchList(nextList);   
  }
 
  // 검색 처리 함수 // bj T // Redux error #7 때문에 주석처리. (dispatch에 액션 아닌 함수/배열 넣어서 나던 에러)
  // function searchStationList(e) {
  //   const searchList = stationList.filter(item => item.stnKrNm.includes(e.target.value.trim()));
  //   dispatch(setSearchList(searchList));
  // }


  

  // ---------- redirect ----------
   function goToStationDetail(item) {
    //  navigate(`/line-diagrams/${stnKrNm}`);
    navigate(`/line-diagrams?name=${item.stnKrNm}&line=${item.lineNm}`);
   }

  // 쿼리스트링 감지해서 디테일로 스위칭 ( 리스트 파일 안에 디테일컴포넌트 아예 넣어주기 )
  const [sp] = useSearchParams();
  const hasDetail = !!sp.get("name");
  if (hasDetail) {
    return <SubwayLineDetail />; // 디테일 컴포넌트 자체가 useSearchParams로 name/line 읽음
  }

  return (
    <div className="subway-container">
      {/* ---------- Left: 검색 패널 ---------- */}
      <aside className="subway-left">
        <div className="subway-tabs">
          <button className="subway-tab active">정류장검색</button>
          <button className="subway-tab">경로검색</button>
        </div>

        <div className="subway-search">
          <input
            onChange={searchStationList}
            placeholder="역명을 입력해주세요"
          />
        </div>

        <div className={`subway-results ${searchList.length === 0 && "subway-results-items-center"}`}>
          {searchList.length === 0 && (
            <div className="subway-empty">예) "서울" → 서울역, 서울대입구</div>
          )}

          {searchList.length > 0 &&
            searchList.map((item, idx) => (
              <div
                className="subway-item"
                key={`${item.outStnNum}-${idx}`}
                onClick={() => selectStation(item)}
              >
                <div className="subway-item-name">{item.stnKrNm}</div>
                <div className="subway-item-line">{item.lineNm}</div>
              </div>
            ))}
        </div>
      </aside>

      {/* ---------- Map ---------- */}
      <section className="subway-map">
        <Map center={coordinate} style={{ width: "100%", height: "400px" }} level={MAP_LEVEL}>
          {markerItem && (
            <>
              <MapMarker position={coordinate} onClick={() => goToStationDetail(markerItem)} />
              <CustomOverlayMap position={coordinate}>
                <div className="subway-overlay clickable" onClick={() => goToStationDetail(markerItem)}>
                  <div className="subway-ov-title">
                    {markerItem.stnKrNm} {markerItem.lineNm}
                  </div>
                </div>
              </CustomOverlayMap>
            </>
          )}
        </Map>
      </section>
    </div>
  );
}