import { createSlice } from "@reduxjs/toolkit";
import { getSubwayDetail } from "../thunks/subwayLineDetailThunk.js";
import { getSubwayTelAndAddr } from "../thunks/subwayLineDetailTelAndAddrThunk.js";

const initialState = {
  loading: false,
  error: null,
  stationDetail: [],  // 시설 API row 배열 (기존)
  stationAddrTel: [],  // 주소/전화 API row 배열 (신규)
};

const subwayLineDetailSlice = createSlice({
  name: "subwayLineDetail",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 시설 (기존)
      .addCase(getSubwayDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubwayDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.stationDetail =  (action.payload);
      })
      .addCase(getSubwayDetail.rejected, (state) => {
        state.loading = false;
      })

      // 주소/전화 (신규)
      .addCase(getSubwayTelAndAddr.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubwayTelAndAddr.fulfilled, (state, action) => {
        state.loading = false;
        state.stationAddrTel = (action.payload);
      })
      .addCase(getSubwayTelAndAddr.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default subwayLineDetailSlice.reducer;