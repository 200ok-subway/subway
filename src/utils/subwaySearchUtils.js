/* ===== 검색/정규화 유틸 ===== */

/** "01호선", "3호", "03", "3" → "3호선" (호선 표기 정규화) */
export const lineMinusZero = (v) => {
  const x = String(v ?? "").trim();
  const m = x.match(/^0?([1-9])(?:\s*호)?(?:\s*선)?$/);
  return m ? `${m[1]}호선` : x;
};

/** 토큰 확장: "3","03","3호","3호선" → ["3호선","03호선","3","03"] */
export const expandToken = (t) => {
  const x = String(t ?? "").toLowerCase().trim();
  const m = x.match(/^0?([1-9])(?:호)?(?:선)?$/);
  if (m) {
    const d = m[1];
    return [`${d}호선`, `0${d}호선`, d, `0${d}`];
  }
  return [x];
};

/**
 * 원본 rows + 검색어 s(옵션) ▶︎ { listPresent, nameList }
 *  - 데이터 소스가 무엇이든(서울열린데이터/로컬 listGeom) 필드 자동 매핑
 *  - 1~9호선 및 "9호선(연장)"만 노출
 */
export function listPresentAndNameList(listAll = [], s = "") {
  const S = String(s ?? "").trim().toLowerCase();
  const tokens = S ? S.split(/\s+/).filter(Boolean) : [];
  const tokenBag = tokens.flatMap(expandToken); // OR 매칭

  const normalized = (listAll ?? [])
    .map((row) => {
      // 다양한 스키마를 한 번에 수용
      const name =
        row.STATION_NM ?? row.stationNm ?? row.stnKrNm ?? row.name ?? "";
      const lineRaw =
        row.LINE_NUM ?? row.subwayNm ?? row.lineNm ?? row.line ?? "";
      const line = lineMinusZero(lineRaw);

      const hay = `${name} ${line}`.toLowerCase();
      return { raw: row, name, line, hay };
    })
    // 1~9호선만 (9호선(연장) 포함)
    .filter((st) => /^[1-9]호선(?:\(연장\))?$/.test(st.line));

  const passed = !S
    ? normalized
    : normalized.filter((st) =>
        tokenBag.length ? tokenBag.some((tok) => st.hay.includes(tok))
                         : st.hay.includes(S)
      );

  return {
    listPresent: passed.map((x) => x.raw),                // 원본 row
    nameList:    passed.map(({ name, line }) => ({ name, line })), // {name,line}
  };
}
