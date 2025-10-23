import { createSlice } from "@reduxjs/toolkit";
import { getLineTimeTable } from "../thunks/subwayLineTimeTableThunk.js";

const initialState = {
  loading: false,
  error: null,
  rows: [], // 타임 테이블 구성 요소들 
};

const subwayLineTimeTableSlice = createSlice({
  name: "subwayLineTimeTable",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getLineTimeTable.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLineTimeTable.fulfilled, (state, action) => {
        state.loading = false;
        state.rows = action.payload;
      })
      .addCase(getLineTimeTable.rejected, (state, action) => {
        state.loading = false;
        console.error(action.error);
      });
  },
});

export default subwayLineTimeTableSlice.reducer;
