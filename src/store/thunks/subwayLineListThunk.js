import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

  const getSubwayList = createAsyncThunk(
  'subwayLineListSlice/getSubwayList',
  async (ars, thunkAPI) => {
    try {
      const url = `${import.meta.env.VITE_BIG_DATA_API_BASE_URL}${import.meta.env.VITE_BIG_DATA_API_SERVICE_XY}`;
      const params = {
        apikey: import.meta.env.VITE_BIG_DATA_OPEN_API_KEY,
      }
      
      const res = await axios.get(url, {params});
      console.log(res.data);
      return res.data.SearchInfoBySubwayNameService.row;
    } catch(e) {
      thunkAPI.rejectWithValue(e.message);
    }
  }
);

export { getSubwayList };