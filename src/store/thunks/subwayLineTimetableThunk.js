import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/**
 * ✅ 역 시간표 데이터 호출 Thunk
 * @param {string} stationName - 역 이름
 */
export const getStationTimetable = createAsyncThunk(
  "stationTimetable/getStationTimetable",
  async (stationName, { rejectWithValue }) => {
    try {
      // 🔹 실제 사용할 서울시 열린데이터 API 예시
      const url = `${import.meta.env.VITE_OPEN_API_BASE_URL}${import.meta.env.VITE_OPEN_API_KEY}${import.meta.env.VITE_OPEN_API_TYPE}${import.meta.env.VITE_OPEN_API_SERVICE_SEARCH_STATION_TIME}N//1/30`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "시간표 데이터를 불러오지 못했습니다."
      );
    }
  }
);
