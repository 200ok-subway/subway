// src/store/thunks/subwayStationDetailThunk.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* ---------- 실시간 도착 ---------- */
const joinUrl = (...parts) =>
  parts.map((p) => String(p ?? "").trim().replace(/^\/+|\/+$/g, "")) // 앞뒤 슬래시 정리
       .filter(Boolean).join("/") + "/";

const extractRows = (data) => {
  if (!data) return [];
  if (Array.isArray(data.realtimeArrivalList)) return data.realtimeArrivalList;
  const svcKey = Object.keys(data).find((k) =>
    k.toLowerCase().includes("realtimestationarrival")
  );
  return svcKey && Array.isArray(data[svcKey]?.row) ? data[svcKey].row : [];
};

const LINE_ID_MAP = {1001:1,1002:2,1003:3,1004:4,1005:5,1006:6,1007:7,1008:8,1009:9};
const isCoreLineId = (id) => Object.prototype.hasOwnProperty.call(LINE_ID_MAP, Number(id));

const pickRealtime = (r = {}) => ({
  barvlDt: r.barvlDt ?? "",
  arvlMsg2: r.arvlMsg2 ?? "",
  updnLine: r.updnLine ?? "",
  trainLineNm: r.trainLineNm ?? "",
  subwayId: Number(r.subwayId ?? r.subwayid ?? r.subway_id ?? NaN),
  subwayNm: r.subwayNm ?? "",
});

export const stationRealtimeIndex = createAsyncThunk(
  "subwayStationDetail/stationRealtimeIndex",
  async (stationName = "", { rejectWithValue }) => {
    try {
      const base = import.meta.env.VITE_SWOPEN_API_BASE_URL;          // https://openapi.seoul.go.kr/api
      const key  = import.meta.env.VITE_OPEN_API_KEY;
      const type = import.meta.env.VITE_OPEN_API_TYPE;                // json
      const svc  = import.meta.env.VITE_SWOPEN_API_SERVICE_REALTIME;  // realtimeStationArrival
      const url  = `${joinUrl(base, key, type, svc)}1/50/${encodeURIComponent(stationName)}`;

      const { data } = await axios.get(url);
      let rows = extractRows(data).map(pickRealtime);

      // 1~9호선만 유지(아이디 없으면 일단 통과)
      rows = rows.filter((r) =>
        Number.isFinite(r.subwayId) ? isCoreLineId(r.subwayId) : true
      );

      return rows;
    } catch (e) {
      return rejectWithValue(e?.message || "realtime request failed");
    }
  }
);

/* ---------- 첫차/막차 ---------- */
export const firstLastByLine = createAsyncThunk(
  "subwayStationDetail/firstLastByLine",
  async ({ line, dow = 1, start = 1, end = 50 }) => {
    const base = import.meta.env.VITE_OPEN_API_BASE_URL;
    const key  = import.meta.env.VITE_OPEN_API_KEY;
    const type = import.meta.env.VITE_OPEN_API_TYPE;
    const svc  = import.meta.env.VITE_OPEN_API_SERVICE_FIRST_AND_LAST;
    const ln   = encodeURIComponent(line);

    const makeUrl = (updown) =>
      `${base}${key}${type}${svc}/${start}/${end}/${ln}/${updown}/${dow}/`;

    const [up, down] = await Promise.all([
      axios.get(makeUrl(1)).then(r =>
        r?.data?.SearchFirstAndLastTrainbyLineServiceNew?.row ?? []
      ).catch(() => []),
      axios.get(makeUrl(2)).then(r =>
        r?.data?.SearchFirstAndLastTrainbyLineServiceNew?.row ?? []
      ).catch(() => []),
    ]);

    return { line, dow, up, down };
  }
);
