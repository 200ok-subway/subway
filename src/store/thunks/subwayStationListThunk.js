import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const subwayStationIndex = createAsyncThunk(
  "subwayStationListSlice/subwayStationIndex",
  async () => {
    const base = `http://openapi.seoul.go.kr:8088/${import.meta.env.VITE_SEOUL_OPEN_API_KEY}/json/SearchSTNBySubwayLineInfo`;
    const tasks = [];
    for (let i = 1; i <= 9; i++) {
      const line = `${String(i).padStart(2, "0")}호선`; // ✅ "02호선" 형식 맞추기
      const url = `${base}/1/999/%20/%20/${line}`; // ✅ %20/%20 유지
      tasks.push(axios.get(url));
    }
    const results = await Promise.all(tasks);
    const merged = [];
    for (const r of results) {
      const rows = r?.data?.SearchSTNBySubwayLineInfo?.row || [];
      merged.push(...rows);
    }
    return merged;
  }
);