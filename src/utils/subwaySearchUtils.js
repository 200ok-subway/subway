
/** name용: 문자열 끝의 괄호 덩어리, '역' 제거
 *  예) "미아(서울사이버대학)" -> "미아"
 *  SubwayLineList,Detail 등에서 역이름 정규화용
 */
export const removeParenAndRemoveYeok = (v) =>
  String(v ?? "").replace(/\s*(\([^)]*\)\s*)+$/, "").replace(/역$/, "").trim();

/** line용: 끝 괄호 제거 + "0N호선" -> "N호선" 정규화
 *  예) "09호선(연장)" -> "9호선", "01호선" -> "1호선"
 */
export const removeParenAndMinusZero = (v) => {
  const noTrailParen = String(v ?? "").replace(/\s*(\([^)]*\)\s*)+$/, "").trim(); //noTrailParen: “뒤꼬리 괄호 제거된 라인 문자열”
  const m = noTrailParen.match(/^0?([1-9])\s*호\s*선$/);
  return m ? `${m[1]}호선` : noTrailParen; //m: 그 라인이 “(선택적 0) + 1~9 + 호선” 패턴에 맞는지 검사한 결과(맞으면 캡처값으로 N호선 반환, 아니면 원본 유지)
};



/** 토큰 확장: "3","03","3호","3호선" → ["3호선","03호선","3","03"] */ 
// subwayStationListThunk.js 에서 사용하는 함수
export const expandToken = (t) => {
  const x = String(t ?? "").toLowerCase().trim();
  const m = x.match(/^0?([1-9])(?:호)?(?:선)?$/);
  if (m) {
    const d = m[1];
    return [`${d}호선`, `0${d}호선`, d, `0${d}`];
  }
  return [x];
};