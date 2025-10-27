// src/store/thunks/subwayStationDetailThunk.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const realtimeArrivalsIndex = createAsyncThunk(
  'subwayStationDetailSlice/realtimeArrivalsIndex',
  async (statnNm, thunkAPI) => {
    try {
      const url = `${import.meta.env.VITE_SWOPEN_API_BASE_URL}${import.meta.env.VITE_OPEN_API_KEY}/json/realtimeStationArrival/0/999/${statnNm}`;

      const { data } = await axios.get(url);
      return data.realtimeArrivalList;
    } catch(e) {
      thunkAPI.rejectWithValue(e);
    }
  }
);

const upFirstLastTimesIndex = createAsyncThunk(
  'subwayStationDetailSlice/upFirstLastTimesIndex',
  async ({lineNum, day, stationId}, thunkAPI) => {
    try {
      const url = `${import.meta.env.VITE_OPEN_API_BASE_URL}${import.meta.env.VITE_OPEN_API_KEY}/json/SearchFirstAndLastTrainbyLineServiceNew/1/1/${lineNum}/1/${day}/${stationId}`;
  
      const { data } = await axios.get(url);
        
      return data.SearchFirstAndLastTrainbyLineServiceNew.row;
    } catch(e) {
      thunkAPI.rejectWithValue(e);
    }
  }
);

const downFirstLastTimesIndex = createAsyncThunk(
  'subwayStationDetailSlice/downFirstLastTimesIndex',
  async ({lineNum, day, stationId}, thunkAPI) => {
    try {
      const url = `${import.meta.env.VITE_OPEN_API_BASE_URL}${import.meta.env.VITE_OPEN_API_KEY}/json/SearchFirstAndLastTrainbyLineServiceNew/1/1/${lineNum}/2/${day}/${stationId}`;

      const { data } = await axios.get(url);
        
      return data.SearchFirstAndLastTrainbyLineServiceNew.row;
    } catch(e) {
      throw thunkAPI.rejectWithValue(e);
    }
  }
);

export { realtimeArrivalsIndex, upFirstLastTimesIndex, downFirstLastTimesIndex }