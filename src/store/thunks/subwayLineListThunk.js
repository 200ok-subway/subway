import { createAsyncThunk } from "@reduxjs/toolkit";
import listGeom from "../../data/listGeom.js";
import { listPresentAndNameList } from "../../utils/subwaySearchUtils.js";
import { normalizeGeom, normalizeLine } from "../../utils/listSubwayGeom1to9Util.js";

// listGeom -> 역명 검색용 rows로 변환
const geomToStationRows = (arr = []) =>
  (arr ?? [])
    .map((g) => ({
      STATION_NM: String(g.stnKrNm ?? g.STN_KR_NM ?? "").trim(),
      LINE_NUM: normalizeLine(g.lineNm ?? g.LINE_NM ?? ""),
    }))
    .filter((r) => r.STATION_NM && r.LINE_NUM);

// 역명/호선 리스트(왼쪽 리스트) — 로컬만 사용
export const listPresentAndNameListIndex = createAsyncThunk(
  "listPresentAndNameList/listPresentAndNameListIndex",
  async (s = "") => {
    const merged = geomToStationRows(listGeom);
    return listPresentAndNameList(merged, String(s ?? "").trim());
  }
);

// 1~9호선 좌표 목록 — 로컬만 사용
export const listSubwayGeom1to9Index = createAsyncThunk(
  "listSubwayGeom1to9/listSubwayGeom1to9Index",
  async () => {
    const allowed = new Set(["1호선","2호선","3호선","4호선","5호선","6호선","7호선","8호선","9호선"]);

    return (listGeom ?? [])
      .map(normalizeGeom)
      .map((x) => ({ ...x, lineNm: normalizeLine(x.lineNm) })) // "9호선(연장)" → "9호선"
      .filter((r) => r.outStnNum && r.stnKrNm && r.lineNm)
      .filter((r) => allowed.has(r.lineNm));
  }
);
