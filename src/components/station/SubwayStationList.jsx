import './SubwayStationList.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useMemo } from 'react';
import { stationIndex } from '../../store/thunks/subwayStationListThunk.js';
import StationSearchbar from "./StationSearchbar.jsx";

function SubwayStationList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const stationList = useSelector(state => state.subwayStation.nameList);
  const search = useSelector(state => state.subwayStation.searchStationNm); // 확정 검색어(참고용)

  // draft: 인풋의 현재 값(조합 중 포함). 화면 필터는 draft만 기준으로 동작.
  const [draft, setDraft] = useState(search || "");

  // 최초 마운트 1회 전체 로드
  useEffect(() => { 
    dispatch(stationIndex());
  }, [dispatch]);

  // [변경] 화면 필터 키워드는 "무조건 draft"만 사용
  //  - 사용자가 모두 지우면 draft === "" → keyword === "" → 전체 리스트 노출
  const keyword = (draft ?? "").toLowerCase().trim(); // [변경]

  const filtered = useMemo(() => {
    if (!keyword) return stationList || []; // [변경] draft 비었으면 전체
    return (stationList || []).filter((it) => {
      const hay = `${it.name} ${it.line}`.toLowerCase();
      // 기본 포함 매칭
      if (hay.includes(keyword)) return true;
      // (선택) 역명 앞부분 일치 우선
      if (it.name?.toLowerCase().startsWith(keyword)) return true;
      return false;
    });
  }, [stationList, keyword]);

  return (
    <>
      <div className='SubwayStationList-title'><h1>지하철역 리스트</h1></div>

      <div className='SubwayStationList-searchbar'>
        <StationSearchbar onDraftChange={setDraft} /> {/* draft를 내려받아 화면 필터에만 사용 */}
      </div>
      
      <div className="SubwayStationList">
        {(filtered || []).map((item, idx) => {
          const name = item.name;
          const line = String(item.line); 
          const displayLine = /호선$/.test(line) ? line : (line ? `${line}호선` : "");
          
          return (
            <div
              key={`${name}-${line}-${idx}`}
              className='SubwayStationList-item'
              onClick={() => navigate(`/stationdetail/${encodeURIComponent(name)}/${encodeURIComponent(displayLine)}`)}
            >
              <div className='SubwayStationList-listCircle'>
                <img src="/base/mainnavsubway.png" alt="지하철 아이콘" />
              </div>
              <p>{`${displayLine} ${name}`}</p>
            </div>
          );
        })}
      </div>

      {(!filtered || filtered.length === 0) && (
        <p className="SubwayStationList-empty">표시할 역이 없습니다.</p>
      )}
    </>
  );
}

export default SubwayStationList;