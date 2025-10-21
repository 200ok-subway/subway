import { configureStore } from "@reduxjs/toolkit";
import subwayStationReducer from './slices/subwayStationListSlice.js';
import subwayStationDetailReducer from './slices/subwayStationDetailSlice.js';
import subwayLineListReducer from './slices/subwayLineListSlice.js';
import subwayLineDetailReducer from './slices/subwayLineDetailSlice.js';

export default configureStore({
  reducer: {
    subwayStation: subwayStationReducer,
    subwayStationDetail: subwayStationDetailReducer,
    subwayLineList: subwayLineListReducer,
    subwayLineDetail: subwayLineDetailReducer,
  },
});