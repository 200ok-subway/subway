import { createSlice } from "@reduxjs/toolkit";
import { getSubwayDetail } from "../thunks/subwayLineDetailThunk";
import { getSubwayTelAndAddr } from "../thunks/subwayLineDetailTelAndAddrThunk";

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
      .addCase(getSubwayDetail.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.stationDetail = payload ?? [];
      })
      .addCase(getSubwayDetail.rejected, (state, action) => {
        state.loading = false;
        console.error(action.error);
        state.error = action.payload ?? action.error?.message ?? null;
      })

      // 주소/전화 (신규)
      .addCase(getSubwayTelAndAddr.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubwayTelAndAddr.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.stationAddrTel = payload ?? [];
      })
      .addCase(getSubwayTelAndAddr.rejected, (state, action) => {
        state.loading = false;
        console.error(action.error);
        state.error = action.payload ?? action.error?.message ?? null;
      });
  },
});

export default subwayLineDetailSlice.reducer;