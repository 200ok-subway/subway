import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import { stationIndex } from "../thunks/subwayStationListThunk.js";

const initialState = {
  nameList: [],
  listPresent: [],
  searchStationNm: "",
  loading: false,
  error: null,
};

const subwayStationListSlice = createSlice({
  name: "subwayStationList",
  initialState,
  reducers: {
    setSearch( state, { payload }) {
      state.searchStationNm = payload ?? "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(stationIndex.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.listPresent = payload?.listPresent ?? [];
      state.nameList = payload?.nameList ?? [];
    });

    // pending + rejected 하나로 묶기
    builder.addMatcher(
      isAnyOf(stationIndex.pending, stationIndex.rejected),
      (state, action) => {
        if (stationIndex.pending.match(action)) {
          // pending (요청 시작)
          state.loading = true;
          state.error = null;
        } else {
          // rejected (요청 실패)
          state.loading = false;
          state.error = action.error?.message || "failed";
        }
      }
    );
  },
});

export const { setSearch } = subwayStationListSlice.actions;
export default subwayStationListSlice.reducer;
