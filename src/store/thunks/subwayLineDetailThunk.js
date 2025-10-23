import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

  const getSubwayDetail = createAsyncThunk(
  'subwayLineDetailSlice/getSubwayDetail',
  async (ars, thunkAPI) => {
    try {
      const url = `${import.meta.env.VITE_OPEN_API_BASE_URL}${import.meta.env.VITE_OPEN_API_KEY}${import.meta.env.VITE_OPEN_API_TYPE}${import.meta.env.VITE_OPEN_API_SERVICE_FACILITY}/1/290`;
      // const url=`http://openAPI.seoul.go.kr:8088/424a49475a6d696a363461576f5178/json/TbSeoulmetroStConve/1/290`
    
      const res = await axios.get(url);
      console.log(res.data);
      return res.data.TbSeoulmetroStConve.row;
    } catch(e) {
      thunkAPI.rejectWithValue(e.message);   
      // return rejectWithValue(e?.message ?? "request failed");
    }
  }
);

export { getSubwayDetail };
