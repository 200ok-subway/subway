import { configureStore } from "@reduxjs/toolkit";

import subwayStationReducer from "./slices/subwayStationListSlice.js";
import subwayStationDetailReducer from "./slices/subwayStationDetailSlice.js";
import subwayLineListReducer from "./slices/subwayLineListSlice.js";
import subwayLineDetailReducer from "./slices/subwayLineDetailSlice.js";
import subwayLineTimeTableReducer from "./slices/subwayLineTimeTableSlice.js"; // ★ 따옴표!

export default configureStore({
  reducer: {
    subwayStation:        subwayStationReducer,
    subwayStationDetail:  subwayStationDetailReducer,
    subwayLineList:       subwayLineListReducer,
    subwayLineDetail:     subwayLineDetailReducer,
    subwayLineTimeTable:  subwayLineTimeTableReducer, // ★ 추가
  },
});
