import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

  const getLineTimeTable = createAsyncThunk(
  "subwayLineTimeTable/getLineTimeTable",
  async (ars, thunkAPI) => {
    try {
      const url = `${import.meta.env.VITE_OPEN_API_BASE_URL}${import.meta.env.VITE_OPEN_API_KEY}${import.meta.env.VITE_OPEN_API_TYPE}${import.meta.env.VITE_OPEN_API_SERVICE_TIMETABLE}`;
      // const url=`http://openAPI.seoul.go.kr:8088/566b5141456d7975313875516b6752/json/getTrainSch`
      const {
        lineNm = "1호선",
        stnNm = "",                         // "역" 제거된 이름(예: "서울")
        upbdnbSe = "상행",                  // 상행/하행/내선/외선
        wkndSe = "평일",                    // 평일/주말만 사용
        start = 1,
        limit = 150,                        // end = start + limit - 1
        tmprTmtblYn = "N",
        select = "trainDptreTm,arvlStnNm", // 필요한 필드만
      } = ars || {};

      const end = start + Math.max(1, Number(limit)) - 1;
      const wk = wkndSe === "주말" ? "주말" : "평일"; // '상시' 제외 
      
      const seg = [
        start,          // START_INDEX (포함)
        end,            // END_INDEX   (포함)
        select,         // selectFields (응답 축소)
        tmprTmtblYn,    // 임시시간표 여부
        upbdnbSe,       // 상행/하행/내선/외선
        wk,             // 평일/주말
        lineNm,         // 호선명
        "",             // trainno (미사용 → 자리 유지)
        stnNm,          // 역명
        "", "",         // stnCd, brlnNm
        "", "",         // dptreStnNm, dptreStnCd
        "", "",         // arvlStnNm,  arvlStnCd
        "",             // searchDt
      ].map(v => String(v ?? "")).join("/");

      const timeurl = `${url}/${seg}`;
      const res = await axios.get(timeurl);
      console.log(res.data);
      return res?.data?.getTrainSch?.row ?? res?.data?.response?.body?.items?.item ?? [];
    } catch (e) {
      thunkAPI.rejectWithValue(e.message);   
      // return rejectWithValue(e?.message ?? "request failed");
    }
  }
);

export { getLineTimeTable };