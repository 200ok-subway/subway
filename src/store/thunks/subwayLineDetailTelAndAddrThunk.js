import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getSubwayTelAndAddr = createAsyncThunk(
  "subwayLineDetailSlice/getSubwayTelAndAddr",
  async (ars, thunkAPI) => {
    try {
      const url = `${import.meta.env.VITE_OPEN_API_BASE_URL}${import.meta.env.VITE_OPEN_API_KEY}${import.meta.env.VITE_OPEN_API_TYPE}${import.meta.env.VITE_OPEN_API_SERVICE_ADDRESS_AND_TEL}/1/289`;
      // const url = `http://openAPI.seoul.go.kr:8088/424a49475a6d696a363461576f5178/json/StationAdresTelno/1/289`;

      const res = await axios.get(url);
      console.log(res.data);
      return res?.data?.StationAdresTelno?.row ?? [];
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

export { getSubwayTelAndAddr };
