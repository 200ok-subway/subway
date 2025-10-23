import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { getLineTimeTable } from "../../store/thunks/subwayLineTimeTableThunk.js";
import SubwayLineList from "./SubwayLineList.jsx"; // 왼쪽 리스트 그대로 재사용
import "./SubwayLineListTimeTable.css";

export default function SubwayLineListTime() {
  const dispatch = useDispatch();
  const [params] = useSearchParams();

  const qLine = params.get("line") || "1호선";
  const qDir  = params.get("dir")  || "상행";
  const qDay  = params.get("day")  || "평일";
  const qStn  = params.get("stn")  || "";

  const { rows, loading, error } = useSelector(s => s.subwayLineTimeTable);

  useEffect(() => {
    dispatch(getLineTimeTable({
      lineNm: qLine,
      upbdnbSe: qDir,
      wkndSe: qDay,
      tmprTmtblYn: "N",
      start: 1,
      end: 200,
      stnNm: qStn,
    }));
  }, [dispatch, qLine, qDir, qDay, qStn]);

  const list = useMemo(() => {
    return rows.map((r, i) => ({
      key: `${r?.trainno ?? i}-${r?.stnCd ?? i}`,
      stnNm: r?.stnNm ?? "",
      trainno: r?.trainno ?? "",
      dpt: r?.trainDptreTm ?? "",
      arv: r?.trainArvlTm ?? "",
      dest: r?.arvlStnNm ?? "",
    }));
  }, [rows]);

  return (
    <div className="time-layout">
      {/* Left: Search + List */}
      <div className="time-left">
        <SubwayLineList />
      </div>

      {/* Right: TimeTable */}
      <section className="time-right">
        <header className="time-header">
          <h1 className="time-title">{qLine} · {qDir} · {qDay}</h1>
          {qStn ? <p className="time-sub">역: {qStn}</p> : null}
        </header>

        {loading && <div className="time-empty">불러오는 중…</div>}
        {error && !loading && <div className="time-empty">에러: {String(error)}</div>}

        {!loading && !error && (
          <ul className="time-list">
            {list.map((it) => (
              <li className="time-row" key={it.key}>
                <div className="time-cell time-station">{it.stnNm}</div>
                <div className="time-cell time-trainno">{it.trainno}</div>
                <div className="time-cell time-dpt">{it.dpt}</div>
                <div className="time-cell time-arr">{it.arv}</div>
                <div className="time-cell time-dest">{it.dest}</div>
              </li>
            ))}
            {list.length === 0 && <div className="time-empty">데이터 없음</div>}
          </ul>
        )}
      </section>
    </div>
  );
}
