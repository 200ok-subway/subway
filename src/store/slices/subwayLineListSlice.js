import { createSlice } from "@reduxjs/toolkit";
import { listPresentAndNameListIndex } from "../thunks/subwayLineListThunk.js";
 
const initialState = {
  loading: false,
  error: null,
  listPresent: [],  // 원본 row
  nameList: [],     // {name, line}만
  query: "",        // 마지막 검색어(옵션)
};

const subwayLineListSlice = createSlice({
  name: "subwayLine",
  initialState,
  reducers: {
    setQuery(state, action) {
      state.query = action.payload ?? "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listPresentAndNameListIndex.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.query = action.meta?.arg ? String(action.meta.arg) : "";
      })
      .addCase(listPresentAndNameListIndex.fulfilled, (state, action) => {
        state.loading = false;
        state.listPresent = action.payload.listPresent;
        state.nameList = action.payload.nameList;
      })
      .addCase(listPresentAndNameListIndex.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message ?? "요청 실패";
      });
  },
});

export const { setQuery } = subwayLineListSlice.actions;
export default subwayLineListSlice.reducer;