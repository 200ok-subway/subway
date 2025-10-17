// "9호선(연장)" -> "9호선"
export const normalizeLine = (line) => {
  const t = String(line ?? "");
  const m = t.match(/([1-9])\s*호선/);
  return m ? `${m[1]}호선` : "";
};

// "청량리(서울시립대입구)" -> "청량리" (매칭 용)
export const stripParen = (name) => String(name ?? "").replace(/\(.*?\)/g, "").trim();

// JSON 배열 -> [{id,name,line,lat,lng,address?}]
export function normalizeBigdataToStations(rows) {
  const allowed = new Set(["1호선","2호선","3호선","4호선","5호선","6호선","7호선","8호선","9호선"]);
  return (rows ?? [])
    .map((r) => ({
      id: String(r.outStnNum ?? ""),
      name: String(r.stnKrNm ?? "").trim(),
      line: normalizeLine(r.lineNm),
      lat: Number(r.convY),
      lng: Number(r.convX),
      address: "", // 필요시 다른 필드 매핑
      _nameKey: stripParen(r.stnKrNm),
    }))
    .filter(
      (s) =>
        s.name && s.line && allowed.has(s.line) &&
        Number.isFinite(s.lat) && Number.isFinite(s.lng)
    );
}

// 안전한 역 검색: 인자 방어 + 필드 방어
export function findStationByName(stations = [], keyword = "") {
  const list = Array.isArray(stations) ? stations : [];
  const q = String(keyword ?? "").trim().toLowerCase();
  if (!q || list.length === 0) return null;

  for (const s of list) {
    const name = String(
      s?.name ?? s?.stnKrNm ?? s?.STN_KR_NM ?? ""
    ).toLowerCase();
    if (name && name.includes(q)) return s;
  }
  return null;
}

export function findFirstList(obj) {
  if (Array.isArray(obj)) return obj;
  if (obj && typeof obj === "object") {
    for (const v of Object.values(obj)) {
      const found = findFirstList(v);
      if (Array.isArray(found) && found.length) {
        if (found[0] && (("stnKrNm" in found[0]) || ("STN_KR_NM" in found[0]))) return found;
      }
    }
  }
  return [];
}

export function normalizeGeom(x) {
  const outStnNum = x.outStnNum ?? x.OUT_STN_NUM ?? x.outstnnum;
  const stnKrNm   = x.stnKrNm   ?? x.STN_KR_NM   ?? x.stnkrnm;
  const lineNm    = x.lineNm    ?? x.LINE_NM     ?? x.linenm;
  const convX     = Number(x.convX ?? x.CONV_X ?? x.x ?? x.X); // lng
  const convY     = Number(x.convY ?? x.CONV_Y ?? x.y ?? x.Y); // lat
  return {
    outStnNum: String(outStnNum ?? "").trim(),
    stnKrNm: String(stnKrNm ?? "").trim(),
    lineNm: String(lineNm ?? "").trim(),
    convX,
    convY,
  };
}