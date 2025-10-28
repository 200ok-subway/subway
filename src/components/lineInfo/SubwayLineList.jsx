import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from "react-kakao-maps-sdk";
import "./SubwayLineList.css";
import listGeom from "../../data/listGeom.js";
import { get1To9LineOnOrigin } from "../../utils/listSubwayGeom1to9Util.js";
import {
  removeParenAndRemoveYeok,
  removeParenAndMinusZero,
  normalizeTime,
  dedupRows,
} from "../../utils/subwaySearchUtils.js";
import { useDispatch, useSelector } from "react-redux";
import { getLineTimeTable } from "../../store/thunks/subwayLineTimetableThunk.js";

export default function SubwayLineList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const appkey = import.meta.env.VITE_KAKAO_APP_KEY;
  useKakaoLoader({ appkey, libraries: ["services", "clusterer"] });

  const [activeTab, setActiveTab] = useState("search");

  const stationList = get1To9LineOnOrigin(listGeom);
  const [searchList, setSearchList] = useState([]);

  function searchStationList(e) {
    if (e && e.target && typeof e.target.value === "string") {
      const query = e.target.value.trim();
      const filtered = query ? stationList.filter((item) => item.stnKrNm.includes(query)) : [];
      setSearchList(filtered);
      return;
    }
    if (typeof e === "string") {
      const day = e;
      setDayTab(day);
      if (timeMeta.stnNm && timeMeta.lineNm) {
        loadTimetable(timeMeta.lineNm, timeMeta.stnNm, day);
      }
    }
  }

  const [coordinate, setCoordinate] = useState({ lat: 37.554648, lng: 126.970607 });
  const [markerItem, setMarkerItem] = useState(null);
  const MAP_LEVEL = 5;

  function selectStation(item) {
    setMarkerItem(item);
    setCoordinate({ lat: Number(item.convY), lng: Number(item.convX) });
  }

  const [dayTab, setDayTab] = useState("평일");
  const [timeMeta, setTimeMeta] = useState({ lineNm: "", stnNm: "" });
  const [cols, setCols] = useState({
    A: { dir: "상행", title: "", rows: [] },
    B: { dir: "하행", title: "", rows: [] },
  });
  const [timeLoading, setTimeLoading] = useState(false);
  const [timeError, setTimeError] = useState("");

  useSelector((s) => s.subwayLineTimeTable);

  function getNeighborTitles(lineNmClean, stnNmClean) {
    const normalizeName = (s) => removeParenAndRemoveYeok(String(s));
    const stationNumber = (it) => {
      const v = it.outStnNum || it.stnNo || it.stnCd || it.stnId || "";
      const n = parseInt(String(v).replace(/\D+/g, ""), 10);
      return Number.isFinite(n) ? n : 9_999_999;
    };

    const sameLineSorted = stationList
      .filter((it) => removeParenAndMinusZero(it.lineNm) === lineNmClean)
      .sort((a, b) => stationNumber(a) - stationNumber(b));

    const idx = sameLineSorted.findIndex((it) => normalizeName(it.stnKrNm) === stnNmClean);
    const left = idx > 0 ? normalizeName(sameLineSorted[idx - 1].stnKrNm) : "";
    const right = idx >= 0 && idx < sameLineSorted.length - 1 ? normalizeName(sameLineSorted[idx + 1].stnKrNm) : "";

    return {
      ATitle: left ? left + " 방향" : "",
      BTitle: right ? right + " 방향" : "",
    };
  }

  function loadTimetable(lineNmClean, stnNmClean, wkndSe) {
    setTimeLoading(true);
    setTimeError("");

    const pair = lineNmClean.includes("2호선") ? ["내선", "외선"] : ["상행", "하행"];

    const baseParams = {
      lineNm: lineNmClean,
      wkndSe,
      stnNm: stnNmClean,
      tmprTmtblYn: "N",
      start: 1,
      limit: 200,
      select: "trainDptreTm,arvlStnNm,upbdnbSe,wkndSe,lineNm,stnNm",
    };

    const fetchByDirection = (dir) =>
      dispatch(getLineTimeTable({ ...baseParams, upbdnbSe: dir })).then((action) =>
        Array.isArray(action && action.payload) ? action.payload : []
      );

    Promise.all([fetchByDirection(pair[0]), fetchByDirection(pair[1])])
      .then(([rawA, rawB]) => {
        const rowsA = dedupRows(normalizeTime(Array.isArray(rawA) ? rawA : []));
        const rowsB = dedupRows(normalizeTime(Array.isArray(rawB) ? rawB : []));

        const { ATitle, BTitle } = getNeighborTitles(lineNmClean, stnNmClean);

        setCols({
          A: { dir: pair[0], title: ATitle || pair[0] + " 방향", rows: rowsA },
          B: { dir: pair[1], title: BTitle || pair[1] + " 방향", rows: rowsB },
        });
        setTimeMeta({ lineNm: lineNmClean, stnNm: stnNmClean });
      })
      .catch((e) => setTimeError(String((e && e.message) || e || "시간표 조회 실패")))
      .finally(() => setTimeLoading(false));
  }

  const onPickStation = (item) => {
    const stnNmClean = removeParenAndRemoveYeok(item.stnKrNm);
    const lineNmClean = removeParenAndMinusZero(item.lineNm);
    if (activeTab === "search") {
      selectStation(item);
    } else {
      loadTimetable(lineNmClean, stnNmClean, dayTab);
    }
  };

  const gotoDetailFromMarker = () => {
    if (!markerItem) return;
    const stnNmClean = removeParenAndRemoveYeok(markerItem.stnKrNm);
    const lineNmClean = removeParenAndMinusZero(markerItem.lineNm);
    navigate(`/line-diagrams/${stnNmClean}/${lineNmClean}`);
  };

  const timeLabelOf = (row) =>
    (row && row.tt && row.tt.label) || String((row && row.trainDptreTm) || "").slice(0, 5);

  return (
    <>
      <div className="subway-line-list-title">
        <h1>역 위치 및 시간표</h1>
      </div>

      <div className="subway-line-list-container">
        {/* Left */}
        <div className="subway-line-list-left">
          <div className="subway-line-list-tabs">
            <button
              className={`subway-line-list-tab ${activeTab === "search" ? "active" : ""}`}
              onClick={() => setActiveTab("search")}
            > 
              지하철역 검색
            </button>
            <button
              className={`subway-line-list-tab ${activeTab === "time" ? "active" : ""}`}
              onClick={() => setActiveTab("time")}
            >
              역 시간표 보기
            </button>
          </div>

          <div className="subway-line-list-search">
            <input placeholder="역명을 입력해주세요" onChange={searchStationList} />
          </div>

          <div
            className={`subway-line-list-results ${
              searchList.length === 0 ? "subway-line-list-results-items-center" : ""
            }`}
          >
            {searchList.length === 0 && (
              <div className="subway-line-list-empty">예) "서울" → 서울역, 서울대입구</div>
            )}
            {searchList.length > 0 &&
              searchList.map((item, idx) => (
                <div
                  key={`${item.outStnNum || item.stnKrNm}-${idx}`}
                  className="subway-line-list-item"
                  onClick={() => onPickStation(item)}
                >
                  <div className="subway-line-list-item-name">{item.stnKrNm}</div>
                  <div className="subway-line-list-item-line">{item.lineNm}</div>
                </div>
              ))}
          </div>
        </div>

        {/* Right */}
        <div className="subway-line-list-map">
          {activeTab === "search" && (
            <Map
              id="map"
              center={coordinate}
              className="subway-line-list-map-inner"
              level={MAP_LEVEL}
            >
              {markerItem && (
                <>
                  <MapMarker position={coordinate} onClick={gotoDetailFromMarker} />
                  <CustomOverlayMap position={coordinate}>
                    <div
                      className="subway-line-list-overlay subway-line-list-clickable"
                      onClick={gotoDetailFromMarker}
                    >
                      <div className="subway-line-list-ov-title">
                        {markerItem.stnKrNm} {markerItem.lineNm}
                      </div>
                    </div>
                  </CustomOverlayMap>
                </>
              )}
            </Map>
          )}

          {activeTab === "time" && (
            <div className="subway-line-list-time-box">
              <div className="subway-line-list-time-header-grid">
                <strong className="subway-line-list-time-header-title">
                  {timeMeta.stnNm && timeMeta.lineNm
                    ? `${timeMeta.stnNm} ${timeMeta.lineNm}`
                    : "역을 선택하면 시간표가 표시됩니다."}
                </strong>

                <div className="subway-line-list-time-day-toggle">
                  {["평일", "주말"].map((day) => (
                    <button
                      key={day}
                      onClick={() => searchStationList(day)}
                      className={`subway-line-list-tab subway-line-list-time-day-btn ${
                        dayTab === day ? "active" : ""
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {timeLoading && <div className="subway-line-list-time-empty">불러오는 중…</div>}
              {timeError && !timeLoading && (
                <div className="subway-line-list-time-empty">에러: {timeError}</div>
              )}

              {!timeLoading && !timeError && timeMeta.stnNm && (
                <div className="subway-line-list-time-two-col">
                  {/* 왼쪽 */}
                  <div className="subway-line-list-time-col">
                    <div className="subway-line-list-time-col-title">
                      {cols.A.title || cols.A.dir + " 방향"}
                    </div>
                    <ul className="subway-line-list-time-list">
                      {cols.A.rows.length === 0 && (
                        <div className="subway-line-list-time-empty">데이터 없음</div>
                      )}
                      {cols.A.rows.map((row, i) => (
                        <li className="subway-line-list-time-row-compact" key={`A-${i}`}>
                          <div className="subway-line-list-time-cell subway-line-list-time-cell-strong">
                            {timeLabelOf(row)}
                          </div>
                            <div className="subway-line-list-time-cell">
                              <span className="time-dest">{row.arvlStnNm || ""}</span>
                              {row.arvlStnNm && <span className="time-dir-tag">방면</span>}
                            </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 오른쪽 */}
                  <div className="subway-line-list-time-col">
                    <div className="subway-line-list-time-col-title">
                      {cols.B.title || cols.B.dir + " 방향"}
                    </div>
                    <ul className="subway-line-list-time-list">
                      {cols.B.rows.length === 0 && (
                        <div className="subway-line-list-time-empty">데이터 없음</div>
                      )}
                      {cols.B.rows.map((row, i) => (
                        <li className="subway-line-list-time-row-compact" key={`B-${i}`}>
                          <div className="subway-line-list-time-cell subway-line-list-time-cell-strong">
                            {timeLabelOf(row)}
                          </div>
                            <div className="subway-line-list-time-cell">
                              <span className="time-dest">{row.arvlStnNm || ""}</span>
                              {row.arvlStnNm && <span className="time-dir-tag">방면</span>}
                            </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
