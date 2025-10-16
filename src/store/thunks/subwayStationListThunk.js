import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/*
  stationIndex:
  - Redux Toolkit의 createAsyncThunk로 만든 비동기 액션 크리에이터
  - 파라미터로 검색어(s)를 받으며, 서울(open) API에서 지하철 역 데이터를 조회한 뒤
    간단한 정규화(호선 표기 등)와 검색 필터링을 적용해 결과를 반환한다.
*/
const stationIndex = createAsyncThunk(
  'stationSlice/stationIndex',
  // s: 검색어 (기본값은 빈 문자열)
  async (s = "") => {
    // --- 1) API 호출 URL 구성 ---
    // import.meta.env.* 는 Vite 환경변수에서 가져오는 값
    const url = `${import.meta.env.VITE_OPEN_API_BASE_URL}${import.meta.env.VITE_OPEN_API_KEY}${import.meta.env.VITE_OPEN_API_TYPE}${import.meta.env.VITE_OPEN_API_SERVICE_NAME}/1/799`;

    // 개발용 디버그 출력 — 실제 배포시에는 삭제해도 됨
    console.log(url);

    // axios로 GET 요청을 보냄 — 응답은 Promise로 받음
    const response = await axios.get(url);

    // --- 2) 원본 응답에서 실제 데이터 배열 추출 ---
    // API에 따라 경로가 다르므로 response.data.SearchInfoBySubwayNameService.row 으로 가져옴
    // (원본 데이터 구조가 다르면 여기를 변경해야 함)
    const listPresent = response.data.SearchInfoBySubwayNameService.row;

    // --- 3) 검색어 전처리 ---
    // 입력 s를 문자열로 바꾼 뒤 앞뒤 공백 제거, 모두 소문자로 변환
    // (검색을 대소문자 구분 없이 하려는 목적)
    const S = String(s).trim().toLowerCase();

    // --- 4) 토큰화 및 호선 표기 변형 확장 (유연한 검색 지원) ---
    // 예: 사용자가 "3 호" 또는 "3호선" 또는 "03" 처럼 입력해도 3호선으로 매칭되게 하기 위한 처리
    // tokens: 공백을 기준으로 분할한 검색어 조각 배열
    const tokens = S ? S.split(/\s+/).filter(Boolean) : [];

    // expandToken: 각 토큰을 확장하여 호선 관련 다양한 표기(예: "3", "03", "3호", "3호선", "3호선", "03호선")를 포함시킴
    const expandToken = (t) => {
    const x = String(t ?? "").toLowerCase().trim();
    
    // 정규식: ^0?([1-9])(?:호)?(?:선)?$ => 1~9 사이 숫자에 0이 붙어 있거나 "호", "선"이 붙은 경우를 잡음
    const m = x.match(/^0?([1-9])(?:호)?(?:선)?$/); // 매칭되면 그룹 1은 1~9 숫자
      if (m) {
        const d = m[1]; // 예: "3"
        // 반환값: 검색 시 포함하면 좋은 표기들
        return [`${d}호선`, `0${d}호선`, d, `0${d}`];
      }
      // 호선 관련이 아니면 소문자 정규화된 토큰 자체만 반환
      return [x];
    };

    // tokenBag: 모든 토큰을 확장하여 하나의 배열로 평탄화
    // 예: ["3", "혜"] -> ["3호선","03호선","3","03","혜"]
    const tokenBag = tokens.flatMap(expandToken); // 하나라도 포함되면 매칭(OR) 구조 준비

    // --- 5) 라인 표기 정규화 함수 ---
    // API에서 LINE_NUM 혹은 subwayNm 같은 필드가 "01호선"처럼 0이 붙어 오면 "1호선"으로 바꿔 일관성 유지
    const lineMinusZero = (zero) => {
      const noZero = String(zero ?? "").trim();
      const m = noZero.match(/^0?([1-9])호선$/); // "01호선" 또는 "1호선" 매칭
      return m ? `${m[1]}호선` : noZero; // 매칭되면 "1호선" 형태로 반환, 아니면 원본 반환
    };

    // --- 6) 원본 리스트를 순회하여 필요한 속성(역명, 호선)을 가진 배열로 변환하고 필터링 ---
    const nameList = listPresent
    .map(row => ({
      // row의 필드명들이 데이터 출처마다 다를 수 있기 때문에 안전하게 여러 필드를 체크
      // STATION_NM (대문자), stationNm (camelCase) 등 케이스가 다른 필드들 고려
      name: row.STATION_NM ?? row.stationNm ?? "",

      // LINE_NUM 또는 subwayNm 등에서 호선 정보를 가져와 정규화 함수 적용
      line: lineMinusZero(row.LINE_NUM ?? row.subwayNm ?? ""),
    }))
    // 1~9호선만 남김 — 정규식으로 "숫자 + 호선" 형태인지 보장
    .filter(station =>  /^[1-9]호선$/.test(station.line))
    // 검색어가 있을 경우 검색 로직 적용
    .filter(station => {
      // 검색어가 빈 문자열이면 모든 역 허용
      if (!S) return true;

      // hay: 검색 대상 문자열 — 역명 + 공백 + 호선(예: "서울대입구 2호선")
      // toLowerCase로 비교를 소문자 기준으로 통일
      const hay = `${station.name} ${station.line}`.toLowerCase();

      // tokenBag이 비어있지 않다면 (즉 토큰 기반 확장 로직이 동작 중이면)
      // 모든 토큰(tok)이 hay에 포함되어 있어야 한다 (AND 조건)
      // 이 부분은 tokens.flatMap(expandToken) 구조 때문에, 예를 들어 사용자가 "3 혜" 입력시
      // 확장된 토큰들 중 대응되는 것들이 hay에 포함되어야 함
      if (tokenBag.length) {
        // tokenBag.every: 모든 토큰이 hay에 포함될 때만 true
        // (여기선 토큰 확장 방식 때문에 보수적 매칭—모든 토큰 포함 필요)
        return tokenBag.every(tok => hay.includes(tok));
      }

      // tokenBag이 비어있다면 (검색어가 단순 문자열일 때) 역명 또는 호선에 검색어 포함 여부로 필터링
      return (
        station.name.toLowerCase().includes(S) || // 역 이름에 검색어 포함
        station.line.toLowerCase().includes(S)    // 또는 호선 문자열에 검색어 포함
      );
    });

    // --- 7) 최종 반환값 ---
    // 반환하는 객체에는 원본 리스트(listPresent)와 정규화/필터링된 nameList를 담아서 반환
    // thunk의 fulfilled 액션 페이로드로 이 값이 전달됩니다.
    return {
      listPresent, // 전체 원본 데이터 (원데이터가 필요할 때 참조용)
      nameList,    // 1~9호선으로 정규화하고 (검색어) 필터링 적용한 결과
    };
  }
);

export { stationIndex };



/**
 * 추가 설명 - 작동 순서 요약
 * 
 * Vite 환경변수로 API 호출 URL을 조합하고 axios.get으로 데이터를 가져온다.
 * 응답에서 실제 역 데이터 배열(row)을 꺼내 listPresent에 저장
 * 사용자가 입력한 검색어 s를 소문자·트림 처리한 뒤 공백으로 토큰화
 * 각 토큰을 호선 표기(예: "3", "03", "3호", "3호선")로 확장하여 tokenBag을 만든다.
 * 원본 배열을 map으로 간단한 { name, line } 형태로 변환하고, lineMinusZero로 호선을 "1호선" 형태로 정규화
 * 1~9호선 패턴만 남기고, 검색어가 존재하면 tokenBag 기반 비교(토큰 모두 포함) 또는 단일 문자열 포함 검사로 필터링
 * 원본(listPresent)과 가공된(nameList) 결과를 객체로 반환
 */