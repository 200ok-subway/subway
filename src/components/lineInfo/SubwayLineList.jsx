import { useState } from "react";
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from "react-kakao-maps-sdk";
import { useNavigate } from "react-router-dom";
import "./SubwayLineList.css";
import listGeom from "../../data/listGeom.js";
import { get1To9LineOnOrigin } from "../../utils/listSubwayGeom1to9Util.js"; 
import { removeParenAndRemoveYeok, removeParenAndMinusZero } from "../../utils/subwaySearchUtil.js";

export default function SubwayLineList() {
  // useNavigate: react-router-dom에서 제공하는 훅으로 라우트(페이지) 이동을 프로그램적으로 수행
  const navigate = useNavigate();

  // ---------- get subway list(CORS 해결 후 API 호출 복원) ----------
  // useEffect(() => {
    // dispatch(getSubwayList()); 
  // }, [dispatch]);


  // ---------- kakao Map ----------
  // useKakaoLoader 훅은 카카오 지도 SDK를 비동기 로딩하고 성공/실패/로딩 상태를 반환
  // - appkey: 카카오 개발자 앱 키 (환경변수 사용)
  // - libraries: 추가 라이브러리 (예: services, clusterer 등)
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_APP_KEY, // kakao app key
    libraries: ["services", "clusterer"]
  });


  // ---------- kakao Map center ----------
  // useState로 중심 좌표를 관리, 초기값은 서울역 근처 좌표로 설정되어 있다.
  // setCoordinate로 갱신하면 Map의 center에 바인딩되어 지도가 해당 좌표로 이동
  const [coordinate, setCoordinate] = useState({lat: 37.554648, lng: 126.970607}); // 초기값 서울역
  const MAP_LEVEL = 5; // kakao map 확대(초기값 5)


  // ---------- kakao Marker ----------
  // markerItem은 사용자가 검색 결과에서 선택한 역의 데이터를 보관하는 state
  // 이 값이 있으면 지도에 마커와 오버레이(말풍선)로 표시된다.
  const [markerItem, setMarkerItem] = useState(null); // markeritem은 선택한 역의 마커 정보 스테이트


  // 검색창에서 선택한 역정보 마커와 좌표 셋팅
  function selectStation(item) {
    // 선택한 item을 markerItem으로 저장
    setMarkerItem(item);
    // item.convY, item.convX는 문자열일 수 있으므로 Number로 변환해 좌표로 설정
    setCoordinate({ lat: Number(item.convY), lng: Number(item.convX) });
  }


  // ---------- search ----------
  // 실제 배포 시에는 리덕스나 API로부터 받아올 수 있으나 현재는 로컬 데이터(listGeom)에서 파생한다.
  // get1To9LineOnOrigin: 로컬 listGeom을 받아 1~9호선에 해당하는 항목만 추출/정제한다.
  // const stationList = useSelector(state => state.subwayLineList.stationList);
  const stationList = get1To9LineOnOrigin(listGeom); // 로컬 데이터 사용

  // 로컬 검색 결과 목록을 저장할 state. 사용자가 입력할 때마다 필터된 결과로 갱신된다.
  const [searchList, setSearchList] = useState([]); // 빈 배열로 초기화


  // 검색 처리 함수
  function searchStationList(e) {
    // 이벤트 대상의 value를 가져와 앞뒤 공백을 제거 (trim)
    const query = e.target.value.trim();

    // stationList에서 역명(stnKrNm)에 query가 포함된 항목만 필터
    // includes는 대소문자 구분, 한국어의 경우 그대로 포함 검사
    const searchList = stationList.filter(item => item.stnKrNm.includes(query));

    // 로컬 state 갱신: 렌더 트리거
    setSearchList(searchList);
  }
  
  // ---------- redirect (역 상세 페이지로 이동) ----------
  function goToStationDetail(item) {
    // 역명, 호선명 정규화: 유틸 함수로 괄호/접미사/0패딩 제거
    const name =  removeParenAndRemoveYeok(item.stnKrNm);     // 예: "서울역(1번출구)" => "서울"
    const line = removeParenAndMinusZero(item.lineNm);       // 예: "1호선(급행)" / "01호선" => "1호선"

    // react-router의 navigate로 경로 이동. 템플릿 리터럴(``) 사용
    navigate(`/line-diagrams/${name}/${line}`);
  }

  // ---------- 로더/에러 상태 처리: 지도 로드 실패 또는 로드 중에 표시할 UI ----------
  if (error) {
    // error가 truthy이면 로드 실패 화면을 반환 (컴포넌트 렌더링 중단)
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
    // loading이 true면 로딩 스켈레톤 표시
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


  // ---------- 실제 렌더링되는 UI (지도 + 검색영역) ----------
  return (
  <>
    <div className="subwaylinelist-title"><h1>지하철역 정보 검색</h1></div>

    <div className="subwaylinelist-container">  {/* 좌(검색)·우(지도) 2영역을 담는 컨테이너 */}
  {/* ---------- search  ---------- */}
      <div className="subwaylinelist-search-container"> {/* 왼쪽 검색 카드; 내부를 탭/검색바/결과 영역 3행으로 구성 */}
        <div className="subwaylinelist-tabs"> {/* 탭 버튼 래퍼; 현재는 “역 정보 검색”만 활성화 상태 */}
          <button className="subwaylinelist-tab active">역 정보 검색</button>
          <button className="subwaylinelist-time-table-tab">역 시간표 보기</button>
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
  </>
  );
}