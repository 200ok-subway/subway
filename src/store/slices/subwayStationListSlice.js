import { createSlice } from "@reduxjs/toolkit";
import { subwayStationIndex } from "../thunks/subwayStationListThunk";

const subwayStationListSlice = createSlice({
  name: 'subwayStationListSlice',
  initialState: {
    subwayList: [],
  },
  reducers: {
    
  },
  extraReducers: builder => {
    builder
      .addCase(subwayStationIndex.fulfilled, (state, action) => {
        state.subwayList = action.payload;
      })
  }
});

export default subwayStationListSlice.reducer;