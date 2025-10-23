import { useState } from "react";
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from "react-kakao-maps-sdk";
import { useNavigate } from "react-router-dom";
import "./SubwayLineList.css";
import listGeom from "../../data/listGeom.js";
import { get1To9LineOnOrigin } from "../../utils/listSubwayGeom1to9Util.js"; 
import { removeParenAndRemoveYeok, removeParenAndMinusZero } from "../../utils/subwaySearchUtils.js";

export default function SubwayLineList() {
  const navigate = useNavigate();

  // ---------- get subway list(CORS 해결 후 API 호출 복원) ----------
  // useEffect(() => {
    // dispatch(getSubwayList()); 
  // }, [dispatch]);

  // ---------- kakao MAp ----------
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_APP_KEY, // kakao app key
    libraries: ["services", "clusterer"]
  });

  // ---------- kakao Map center ----------
  const [coordinate, setCoordinate] = useState({lat: 37.554648, lng: 126.970607}); // 초기값 서울역
  const MAP_LEVEL = 5; // kakao map 확대(초기값 5)

  // ---------- kakao Marker ----------
  const [markerItem, setMarkerItem] = useState(null); // markeritem은 선택한 역의 마커 정보 스테이트 

  // 검색창에서 선택한 역정보 마커와 좌표 셋팅
  function selectStation(item) {
    setMarkerItem(item);
    setCoordinate({ lat: Number(item.convY), lng: Number(item.convX) });
  }

  // ---------- search ----------
  // const stationList = useSelector(state => state.subwayLineList.stationList);
  const stationList = get1To9LineOnOrigin(listGeom); // 로컬 데이터 사용

  const [searchList, setSearchList] = useState([]); // 로컬 검색 결과: 이름 변경

  // 검색 처리 함수 
  function searchStationList(e) {
    const query = e.target.value.trim();
    const searchList = stationList.filter(item => item.stnKrNm.includes(query));
    setSearchList(searchList); // 로컬 state만 갱신
  }
  
  // ---------- redirect ----------
  function goToStationDetail(item) {
    const name =  removeParenAndRemoveYeok(item.stnKrNm);     // 끝 괄호 + '역' 제거(역명 정규화)
    const line = removeParenAndMinusZero(item.lineNm);       // 끝 괄호 + 0패드 제거(호선 정규화)
    navigate(`/line-diagrams/${name}/${line}`);
  }

  if (error) {
    return (
      <div className="subwaylinelist-state">
        <div className="subwaylinelist-state-panel">
          <p className="subwaylinelist-state-text">지도를 불러오지 못했어요.</p>
        </div>
        <div className="subwaylinelist-state-map" aria-hidden="true" />
      </div>
    );
  }

  if (loading) {
  return (
    <div className="subwaylinelist-state">
      <div className="subwaylinelist-state-panel">
        <span className="subwaylinelist-spinner" aria-hidden="true" />
        <p className="subwaylinelist-state-text">지도를 불러오는 중이에요...</p>
      </div>
      <div className="subwaylinelist-state-map skeleton" aria-hidden="true" />
    </div>
  );
}

  return (
    <div className="subwaylinelist-header">지하철 역 정보 검색</div>,
    <div className="subwaylinelist-container">  {/* 좌(검색)·우(지도) 2영역을 담는 컨테이너 */}
      
  {/* ---------- search  ---------- */}
      <div className="subwaylinelist-search-container"> {/* 왼쪽 검색 카드; 내부를 탭/검색바/결과 영역 3행으로 구성 */}
        <div className="subwaylinelist-tabs"> {/* 탭 버튼 래퍼; 현재는 “역 정보 검색”만 활성화 상태 */}
          <button className="subwaylinelist-tab active">역 정보 검색</button>
          {/* <button className="subway-tab active">역 시간표 보기 후움 나중에 추가 해보기</button> */}
        </div>

         {/* 조건부로 빈 상태 정렬 클래스를 추가 */}
        <div className="subwaylinelist-search">
          <input onChange={searchStationList} placeholder="역명을 입력해주세요"/>   {/* 입력 변화 시 로컬 searchList를 갱신 */}
        </div>
         
        <div className={`subwaylinelist-search-list-container ${searchList.length === 0 && "subwaylinelist-search-list-container-items-center"}`}>
          {searchList.length === 0 && (
            <div className="subwaylinelist-empty">예) "서울" → 서울역, 서울대입구</div>
          )}

          {searchList.length > 0 && searchList.map((item, idx) => (
              <div className="subway-item"
                key={`${item.outStnNum}-${idx}`} onClick={() => selectStation(item)}>
                <div className="subwaylinelist-item-name">{item.stnKrNm}</div>    {/* 표시는 원본 그대로 */}
                <div className="subwaylinelist-item-line">{item.lineNm}</div>
              </div>
            ))}
        </div>
      </div>
    
  {/* ---------- Map ---------- */}
      <div className="subwaylinelist-map"> {/* 지도 영역 */}
        <Map center={coordinate} style={{ width: "100%", height: "500px" }} level={MAP_LEVEL}> {/* 카카오 지도 본체, markerItem = 선택한 역이 있을 때만 마커/오버레이 표시  */}
          {markerItem && (
            <>
              <MapMarker position={coordinate} onClick={() => goToStationDetail(markerItem)} />
              <CustomOverlayMap position={coordinate}>
                <div className="subwaylinelist-overlay clickable" onClick={() => goToStationDetail(markerItem)}>
                  <div className="subwaylinelist-overlay-title">{markerItem.stnKrNm}{markerItem.lineNm}</div>
                </div>
              </CustomOverlayMap>
            </>
          )}
        </Map>
      </div>
    </div>
  );
}