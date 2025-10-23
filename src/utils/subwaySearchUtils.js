/* =========시간 보정/정렬 유틸===========
/** 
 * "24:05:00" 처럼 운영일 표기(24시)를 사람이 읽기 쉽게 보정.
 * - sec  : 정렬용 초값 (24시는 24*3600으로 계산 → 23시 뒤에 옴)
 * - label: 화면 표시용 "HH:MM" (24시는 "00:MM"으로 표기)
 * - next : 24시 여부(다음날 도착/출발) → 배지(+1) 등에 활용 가능
 */
export function normalizeTime(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const toSec = (t) => {
    const [h = "0", m = "0", s = "0"] = String(t ?? "").split(":");
    return (+h) * 3600 + (+m) * 60 + (+s);
  };
  return list
    .map((r) => {
      const t = String(r?.trainDptreTm ?? "").trim();
      const label = t ? t.slice(0, 5) : "";
      return { ...r, tt: { raw: t, label, sec: toSec(t) } };
    })
    .sort((a, b) => (a.tt?.sec ?? 0) - (b.tt?.sec ?? 0));
}

/**
 * 같은 시각 + 같은 방면 중복 제거(선택)
 * - API가 일부 노선에서 동일 분 단위로 중복이 반환될 수 있어 가볍게 정리
 */
export function dedupRows(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const seen = new Set();
  return list.filter((r) => {
    const k = `${String(r?.trainDptreTm ?? "")}|${String(r?.arvlStnNm ?? "")}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}




/* ============================================
 * 역/노선 문자열 정규화 유틸
 * ============================================
 */
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



