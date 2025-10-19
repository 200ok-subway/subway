import { createSlice } from "@reduxjs/toolkit";
import { getSubwayList } from "../thunks/subwayLineListThunk.js";
import { get1To9LineOnOrigin } from "../../utils/listSubwayGeom1to9Util.js";
 
const initialState = {
  loading: false,
  stationList: [], // 전체 역 리스트
};

const subwayLineListSlice = createSlice({
  name: "subwayLineList",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSubwayList.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getSubwayList.fulfilled, (state, action) => {
        state.loading = false;
        state.stationList = get1To9LineOnOrigin(action.payload);
      })
      .addCase(getSubwayList.rejected, (state, action) => {
        state.loading = false;
        console.error(action.error);
      });
  },
});

export default subwayLineListSlice.reducer;