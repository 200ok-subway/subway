// src/store/thunks/subwayStationDetailThunk.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const realtimeArrivalsIndex = createAsyncThunk(
  'subwayStationDetailSlice/realtimeArrivalsIndex',
  async (statnNm, thunkAPI) => {
    try {
      const url = `http://swopenapi.seoul.go.kr/api/subway${import.meta.env.VITE_OPEN_API_KEY}/json/realtimeStationArrival/0/999/${statnNm}`;

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
      const url = `http://openapi.seoul.go.kr:8088${import.meta.env.VITE_OPEN_API_KEY}/json/SearchFirstAndLastTrainbyLineServiceNew/1/1/${lineNum}/1/${day}/${stationId}`;
  
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
      const url = `http://openapi.seoul.go.kr:8088${import.meta.env.VITE_OPEN_API_KEY}/json/SearchFirstAndLastTrainbyLineServiceNew/1/1/${lineNum}/2/${day}/${stationId}`;

      const { data } = await axios.get(url);
      console.log(data);
        
      return data.SearchFirstAndLastTrainbyLineServiceNew.row;
    } catch(e) {
      console.error(e.message);
      throw thunkAPI.rejectWithValue(e);
    }
  }
);

export { realtimeArrivalsIndex, upFirstLastTimesIndex, downFirstLastTimesIndex }