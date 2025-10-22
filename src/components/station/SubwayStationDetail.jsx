import { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import "./SubwayStationDetail.css";

// thunks
import { stationIndex } from "../../store/thunks/subwayStationListThunk.js";
import { stationRealtimeIndex, firstLastByLine } from "../../store/thunks/subwayStationDetailThunk.js";

// 방면 데이터 
import stationNameDict from "../../data/stationNameDict.js";

/* ========== 유틸 ========== */



// **bj T 코드 리뷰 -> 참고하세요 디테일 수정하세요오오오옹
// useEffect(() => {
//   // 실시간 도착정보 조회
//   // 첫차 막차 정보 조회
//   // 파싱한 역정보
//   // 인터벌

//   return 인터벌삭제
// }, []);




/**
 * 호선명을 정규화합니다. 예) "01호선" → "1호선", "2호선" → "2호선", "경의선" → "경의선"
 * 
 * @param {string} v - 호선명
 * @returns {string} - 정규화된 호선명
 */
const normalizeLine = (v) => {
  const s = String(v ?? "").trim();
  const m = s.match(/^0?([1-9])호선$/);
  return m ? `${m[1]}호선` : s;
};
// "1호선" → "01호선"(API)
const toApiLine = (v) => {
  const m = String(v ?? "").match(/^([1-9])호선$/);
  return m ? `0${m[1]}호선` : String(v ?? "");
};
// "2호선" 등 라인 토큰 판별
const isLineToken = (t) => /^0?[1-9]호선$/.test(String(t ?? "").trim());

// 호선 → subwayId 매핑
const LINE_TO_ID = {
  "1호선":"1001","2호선":"1002","3호선":"1003","4호선":"1004",
  "5호선":"1005","6호선":"1006","7호선":"1007","8호선":"1008","9호선":"1009",
};

// "방면" 라벨 계산
function pickDirectionNames(dict, selectedLine, stationName, realtimeUp, realtimeDown){
  const sid  = LINE_TO_ID[selectedLine] || "";
  const list = dict.filter(d => d.subwayId === sid);
  const idx  = list.findIndex(d => d.statnNm === stationName);

  let upName   = idx > 0 ? list[idx-1]?.statnNm : list[0]?.statnNm;
  let downName = idx >= 0 && idx < list.length-1 ? list[idx+1]?.statnNm : list.at(-1)?.statnNm;

  const parseHead = (row) => {
    const s = String(row?.trainLineNm ?? "");
    const m = s.match(/(.+?)행/); // "구로행" → "구로"
    return m ? m[1] : "";
  };
  if (!upName   && realtimeUp[0])   upName   = parseHead(realtimeUp[0])   || upName;
  if (!downName && realtimeDown[0]) downName = parseHead(realtimeDown[0]) || downName;

  return {
    upLabel:   upName   ? `${upName} 방면`   : "상행",
    downLabel: downName ? `${downName} 방면` : "하행",
  };
}

/* ========== 컴포넌트 ========== */
function SubwayStationDetail() {
  const dispatch = useDispatch();

  // ✅ name/line(신형), stationId(호환) 모두 받기
  const { name, line, stationId } = useParams();

  // 파라미터 디코딩
  let stationName = name ? decodeURIComponent(name) : (stationId ? decodeURIComponent(stationId) : "");
  let initialLine = line ? normalizeLine(decodeURIComponent(line)) : "";

  // ✅ 구형 "/stationdetail/2호선 서울대입구" 처리를 위한 자동 분리
  if (!initialLine && stationName.includes(" ")) {
    const [t1, ...rest] = stationName.split(" ");
    if (isLineToken(t1)) {
      initialLine = normalizeLine(t1);
      stationName = rest.join(" ");
    }
  }

    // 전역 상태
  const nameList = useSelector((s) => s.station?.nameList ?? []);
  const realtimeList = useSelector((s) => s.subwayStationDetail?.realtime ?? []);
  const { firstUp = [], firstDown = [], dow = 1 } = useSelector((s) => s.subwayStationDetail ?? {});

  // 로컬 상태
  const [selectedLine, setSelectedLine] = useState("");
  const [refreshing, setRefreshing]     = useState(false);
  const [lastUpdated, setLastUpdated]   = useState(null);
  const intervalRef = useRef(null);

  // 리스트 없으면 한 번 로드(직진입 대비)
  useEffect(() => { if (!nameList.length) dispatch(stationIndex()); }, [dispatch, nameList.length]);

  // 현재 역의 호선 칩(중복 제거 + 숫자순)
  const lineOptions = useMemo(() => {
    return Array.from(
      new Set(
        (nameList || [])
          .filter((i) => String(i.name) === stationName)
          .map((i) => normalizeLine(i.line))
          .filter(Boolean)
      )
    ).sort((a, b) => parseInt(a) - parseInt(b));
  }, [nameList, stationName]);

  // 초기 라인 선택
  useEffect(() => {
    if (!selectedLine) {
      if (initialLine) setSelectedLine(initialLine);
      else if (lineOptions.length) setSelectedLine(lineOptions[0]);
    }
  }, [initialLine, lineOptions, selectedLine]);

  // 실시간 호출
  const fetchRealtime = async () => {
    if (!stationName) return;
    try {
      setRefreshing(true);
      await dispatch(stationRealtimeIndex(stationName));
      setLastUpdated(new Date());
    } finally {
      setRefreshing(false);
    }
  };
  useEffect(() => { fetchRealtime(); }, [stationName]);

  // 자동 갱신(20초)
  useEffect(() => {
    intervalRef.current = setInterval(fetchRealtime, 20000);
    return () => clearInterval(intervalRef.current);
  }, [stationName]);

  // 첫/막차: 선택 호선으로 (API는 "01호선")
  useEffect(() => {
    if (selectedLine) {
      dispatch(firstLastByLine({ line: toApiLine(selectedLine), dow }));
    }
  }, [dispatch, selectedLine, dow]);

  /* === 화면 가공 === */
  const realtime = Array.isArray(realtimeList) ? realtimeList : [];

  // 선택 호선 필터: subwayNm("01호선") 또는 subwayId(1001~1009) 둘 다 대응
  const filtered = realtime.filter((r) => {
    if (!selectedLine) return true;
    const lineNm = r?.subwayNm ? normalizeLine(r.subwayNm) : "";
    if (lineNm) return lineNm === selectedLine;
    const idMap = {1001:"1호선",1002:"2호선",1003:"3호선",1004:"4호선",1005:"5호선",1006:"6호선",1007:"7호선",1008:"8호선",1009:"9호선"};
    const fromId = idMap[Number(r?.subwayId)] || "";
    return fromId === selectedLine;
  });

  const realtimeUp   = filtered.filter(r => String(r?.updnLine||"").includes("상행") || String(r?.updnLine||"").includes("내선"));
  const realtimeDown = filtered.filter(r => String(r?.updnLine||"").includes("하행") || String(r?.updnLine||"").includes("외선"));

  const etaText = (row) => {
    const n = Number(row?.barvlDt);
    if (Number.isFinite(n)) {
      if (n <= 30) return "곧 도착";
      const m = Math.floor(n / 60);
      const s = n % 60;
      return `${m}분 ${s}초 후`;
    }
    return "-";
  };
  const fmtKTime = (hhmm) => (!hhmm || hhmm.length < 4) ? "-" : `${hhmm.slice(0,2)}시 ${hhmm.slice(2,4)}분`;

  const upRow   = Array.isArray(firstUp)   ? firstUp[0]   : null;
  const downRow = Array.isArray(firstDown) ? firstDown[0] : null;

  // 방면 라벨
  const { upLabel, downLabel } = useMemo(
    () => pickDirectionNames(stationNameDict, selectedLine, stationName, realtimeUp, realtimeDown),
    [selectedLine, stationName, realtimeUp, realtimeDown]
  );

  // 화면 텍스트
  const lastUpdatedText = lastUpdated ? `업데이트: ${lastUpdated.toLocaleTimeString()}` : "";
  const upEta     = realtimeUp[0]   ? etaText(realtimeUp[0])   : "-";
  const downEta   = realtimeDown[0] ? etaText(realtimeDown[0]) : "-";
  const upFirst   = upRow   ? fmtKTime(upRow.FSTT_HRM)  : "-";
  const upLast    = upRow   ? fmtKTime(upRow.LSTTM_HRM) : "-";
  const downFirst = downRow ? fmtKTime(downRow.FSTT_HRM)  : "-";
  const downLast  = downRow ? fmtKTime(downRow.LSTTM_HRM) : "-";

  return (
    <div className="detail-root" style={{ '--bottom-inset': '150px' }}>


      {/* 상단 타이틀 */}
      <div className="detail-titlebox">
        <div className="detail-colorbar" />
        <div className="detail-titlestack">
          <h1 className="detail-title-name">{stationName || "역 불러오는 중..."}</h1>
          {selectedLine && <div className="detail-linechip">{normalizeLine(selectedLine)}</div>}
        </div>
        <div className="detail-colorbar" />
      </div>

      {/* 상/하행 섹션 */}
      <div className="detail-sections">
        {/* 상행 */}
        <section className="detail-section">
          <div className="detail-divider">
            <span className="detail-line" />
            <div className="detail-direction-badge">{upLabel}</div>
            <span className="detail-line none" />
          </div>

          <div className="detail-card">
            <div className="detail-row">
              <h3>상행</h3>
              <p><span className="detail-eta">{upEta}</span> 도착</p>
            </div>
            <div className="detail-row"><h4>첫차</h4><p>{upFirst}</p></div>
            <div className="detail-row"><h4>막차</h4><p>{upLast}</p></div>
          </div>
        </section>

        {/* 하행 */}
        <section className="detail-section">
          <div className="detail-divider">
            <span className="detail-line none" />
            <div className="detail-direction-badge">{downLabel}</div>
            <span className="detail-line" />
          </div>

          <div className="detail-card">
            <div className="detail-row">
              <h3>하행</h3>
              <p><span className="detail-eta">{downEta}</span> 도착</p>
            </div>
            <div className="detail-row"><h4>첫차</h4><p>{downFirst}</p></div>
            <div className="detail-row"><h4>막차</h4><p>{downLast}</p></div>
          </div>
        </section>

    
      </div>

    </div>
  );
}

export default SubwayStationDetail;