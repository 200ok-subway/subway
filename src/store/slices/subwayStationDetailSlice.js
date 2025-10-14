// src/store/slices/subwayStationDetailSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { stationRealtimeIndex, firstLastByLine } from "../thunks/subwayStationDetailThunk.js";

const initialState = {
  // 실시간
  realtime: [],
  loadingRealtime: false,
  errorRealtime: null,

  // 첫/막차
  firstUp: [],
  firstDown: [],
  dow: 1, // 1: 평일, 2: 주말, 3: 공휴일 // 기본값은 평일 
  line: "",
  loadingFirstLast: false,
  errorFirstLast: null, // 평일, 주말, 공휴일
};

const subwayStationDetailSlice = createSlice({
  name: "subwayStationDetail",
  initialState,
  reducers: {
    setDow(state, { payload }) {
      state.dow = Number(payload) || 1;
    },
  },
  extraReducers: (builder) => {
    // 실시간
    builder
      .addCase(stationRealtimeIndex.pending, (s) => {
        s.loadingRealtime = true;
        s.errorRealtime = null;
      })
      .addCase(stationRealtimeIndex.fulfilled, (s, { payload }) => {
        s.loadingRealtime = false;
        s.realtime = Array.isArray(payload) ? payload : [];
      })
      .addCase(stationRealtimeIndex.rejected, (s, { payload }) => {
        s.loadingRealtime = false;
        s.errorRealtime = payload || "realtime failed";
      });

    // 첫/막차
    builder
      .addCase(firstLastByLine.pending, (s) => {
        s.loadingFirstLast = true;
        s.errorFirstLast = null;
      })
      .addCase(firstLastByLine.fulfilled, (s, { payload }) => {
        s.loadingFirstLast = false;
        s.firstUp = payload.up || [];
        s.firstDown = payload.down || [];
        s.line = payload.line || "";
        s.dow = payload.dow ?? s.dow;
      })
      .addCase(firstLastByLine.rejected, (s, { payload }) => {
        s.loadingFirstLast = false;
        s.errorFirstLast = payload || "first/last failed";
      });
  },
});

export const { setDow } = subwayStationDetailSlice.actions;
export default subwayStationDetailSlice.reducer;
