// src/store/slices/subwayStationDetailSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { realtimeArrivalsIndex, upFirstLastTimesIndex, downFirstLastTimesIndex } from "../thunks/subwayStationDetailThunk";

const subwayStationDetailSlice = createSlice({
  name: 'subwayStationDetailSlice',
  initialState: {
    realtimeArrivalList: [],
    upFirstLastTimesList: [],
    downFirstLastTimesList: [],
  },
  reducers: {
    setRealtimeArrivalList(state, action) {
      state.realtimeArrivalList = action.payload;
    },
    clearState(state) {
      state.realtimeArrivalList = [];
      state.upFirstLastTimesList = [];
      state.downFirstLastTimesList = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(realtimeArrivalsIndex.fulfilled, (state, action) => {
        state.realtimeArrivalList = action.payload || [];
      })
      .addCase(upFirstLastTimesIndex.fulfilled, (state, action) => {
        state.upFirstLastTimesList = action.payload || [];
      })
      .addCase(downFirstLastTimesIndex.fulfilled, (state, action) => {
        state.downFirstLastTimesList = action.payload || [];
      })
      .addMatcher(
        action => action.type.startsWith('subwayStationDetailSlice') && action.type.endsWith('/rejected'),
        (state) => {
          state.realtimeArrivalList = [];
          state.upFirstLastTimesList = [];
          state.downFirstLastTimesList = [];
          alert('현재 서울교통공사에서 정보를 받아올 수 없습니다.');
        }
      );
  }
});

export const { clearState } = subwayStationDetailSlice.actions;
export default subwayStationDetailSlice.reducer;
