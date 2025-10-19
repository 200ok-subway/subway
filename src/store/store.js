import { configureStore } from "@reduxjs/toolkit";

import subwayStationReducer from './slices/subwayStationListSlice.js';
import subwayStationDetailReducer from './slices/subwayStationDetailSlice.js';
import subwayLineListSliceReducer from './slices/subwayLineListSlice.js';
import subwayLineDetailSliceReducer from './slices/subwayLineDetailSlice.js';

export default configureStore({
  reducer: {
    subwayStation: subwayStationReducer,
    subwayStationDetail: subwayStationDetailReducer,
    subwayLineList: subwayLineListSliceReducer,
    subwayLineDetail: subwayLineDetailSliceReducer,
  },
});