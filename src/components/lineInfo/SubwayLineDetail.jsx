import { useEffect } from "react";
import "./subwayLineDetail.css";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";    
import { getSubwayDetail } from "../../store/thunks/subwayLineDetailThunk.js";
import { getSubwayTelAndAddr } from "../../store/thunks/subwayLineDetailTelAndAddrThunk.js";
import { removeParenAndremoveYeok, removeParenAndMinusZero } from "../../utils/subwaySearchUtils.js";

/* 'Y'면 'Y', 그 외/빈값은 'N' */
const YN = (v) => (String(v ?? "").trim().toUpperCase() === "Y" ? "Y" : "N");

/* 상태 클래스(on/off/unk), ok/no */
const isY = (v) => String(v ?? "").trim().toUpperCase() === "Y";
const facCls = (v) => (v == null || String(v).trim() === "" ? "off" : isY(v) ? "on" : "off");
const a11yCls = (v) => (isY(v) ? "ok" : "no");

export default function SubwayLineDetail() {
  const dispatch = useDispatch();

  const { stnKrNm, lineNm } = useParams();
   const loading = useSelector((s) => s.subwayLineDetail?.loading ?? false);
   const error   = useSelector((s) => s.subwayLineDetail?.error ?? null);

  // 시설 API rows  
  const rows = useSelector(s => s.subwayLineDetail.stationDetail);
  // 주소/전화 API rows
  const addrRows = useSelector(s => s.subwayLineDetail.stationAddrTel);

  useEffect(() => {
    if (!rows.length) dispatch(getSubwayDetail());
    if (!addrRows.length) dispatch(getSubwayTelAndAddr());
  }, [dispatch, rows.length, addrRows.length]);

  // 정규화된 역명/호선명
  const detailName = removeParenAndremoveYeok(stnKrNm);
  const detailLine = removeParenAndMinusZero(lineNm);

  // 편의시설 부분 포함 매칭
  const facility = rows.find((r) =>
    removeParenAndremoveYeok(r?.STATION_NAME ?? "") === detailName &&
    removeParenAndMinusZero(r?.LINE ?? "") === detailLine
  ) ?? null;
  // 주소/전화 쪽에서도 동일 방식으로 매칭
  const telAddr = addrRows.find((r) =>
    removeParenAndremoveYeok(r?.SBWY_STNS_NM ?? "") === detailName &&
    removeParenAndMinusZero(r?.SBWY_ROUT_LN ?? "") === detailLine
  ) ?? null;

  // 화면 표기용 값
  const c = facility ?? {};
  const stationName = detailName || c.STATION_NAME || telAddr?.SBWY_STNS_NM || "역명 미상";
  const line = detailLine || "-"; // 이미 정규화된 "N호선"

  // 역 정보 3칸: 지번/도로명/연락처 <- 원래는 (역명/호선/역코드)
  const oldAddr  = telAddr?.OLD_ADDR     || "-";
  const roadAddr = telAddr?.ROAD_NM_ADDR || "-";
  const telno    = telAddr?.TELNO        || "-";
  
    return (
    <div className="line-detail">
      {/* 타이틀 */}
      <div className="line-detail-title">
        <div className="line-detail-title-text">
          <h1 className="line-detail-title-name">{stationName}</h1>
          <span className="line-detail-title-pill">{line}</span>
        </div>
      </div>

      {/* 로딩/에러 */}
      {loading && (
        <section className="line-detail-card">
          <div className="line-detail-card-hd">로딩</div>
          불러오는 중…
        </section>
      )}
      {error && (
        <section className="line-detail-card">
          <div className="line-detail-card-hd">에러</div>
          <div className="line-detail-empty">{String(error)}</div>
        </section>
      )}

      {/* 역 정보 */}
      <section className="line-detail-card">
        <div className="line-detail-card-hd">역 정보</div>
        <div className="line-detail-station-grid">
          <div className="line-detail-kv">
            <span className="line-detail-kv-k">지번 주소</span>
            <span className="line-detail-kv-v">{oldAddr}</span>
          </div>
          <div className="line-detail-kv">
            <span className="line-detail-kv-k">도로명 주소</span>
            <span className="line-detail-kv-v">{roadAddr}</span>
          </div>
          <div className="line-detail-kv">
            <span className="line-detail-kv-k">연락처</span>
            <span className="line-detail-kv-v">{telno}</span>
          </div>
        </div>
      </section>

      {/* 시설 정보 (기존 그대로) */}
      <section className="line-detail-card">
        <div className="line-detail-card-hd">시설 정보</div>
        <div className="line-detail-fac-grid">
          <div className={`line-detail-fac ${facCls(c.PARKING)}`}>
            <div className="line-detail-fac-ico" aria-hidden>•</div>
            <div className="line-detail-fac-label">환승주차장</div>
            <div className="line-detail-fac-status">{YN(c.PARKING)}</div>
          </div>
          <div className={`line-detail-fac ${facCls(c.BICYCLE)}`}>
            <div className="line-detail-fac-ico" aria-hidden>•</div>
            <div className="line-detail-fac-label">자전거보관소</div>
            <div className="line-detail-fac-status">{YN(c.BICYCLE)}</div>
          </div>
          <div className={`line-detail-fac ${facCls(c.CIM)}`}>
            <div className="line-detail-fac-ico" aria-hidden>•</div>
            <div className="line-detail-fac-label">무인민원발급기</div>
            <div className="line-detail-fac-status">{YN(c.CIM)}</div>
          </div>
          <div className={`line-detail-fac ${facCls(c.EXCHANGE)}`}>
            <div className="line-detail-fac-ico" aria-hidden>•</div>
            <div className="line-detail-fac-label">환전키오스크</div>
            <div className="line-detail-fac-status">{YN(c.EXCHANGE)}</div>
          </div>
          <div className={`line-detail-fac ${facCls(c.TRAIN)}`}>
            <div className="line-detail-fac-ico" aria-hidden>•</div>
            <div className="line-detail-fac-label">기차예매</div>
            <div className="line-detail-fac-status">{YN(c.TRAIN)}</div>
          </div>
          <div className={`line-detail-fac ${facCls(c.CULTURE)}`}>
            <div className="line-detail-fac-ico" aria-hidden>•</div>
            <div className="line-detail-fac-label">문화공간</div>
            <div className="line-detail-fac-status">{YN(c.CULTURE)}</div>
          </div>
          <div className={`line-detail-fac ${facCls(c.PLACE)}`}>
            <div className="line-detail-fac-ico" aria-hidden>•</div>
            <div className="line-detail-fac-label">만남의장소</div>
            <div className="line-detail-fac-status">{YN(c.PLACE)}</div>
          </div>
        </div>
        <p className="line-detail-hint">상태 값은 Y/N 기준이며, 빈 값은 N으로 표기합니다.</p>
      </section>

      {/* 교통약자 요약 */}
      <section className="line-detail-card">
        <div className="line-detail-card-hd">교통약자 정보</div>
        <div className="line-detail-a11y-grid">
          <div className={`line-detail-a11y-item ${a11yCls(c.EL)}`}>
            <div className="line-detail-a11y-k">엘리베이터</div>
            <div className="line-detail-a11y-v">{isY(c.EL) ? "있음" : "없음"}</div>
          </div>
          <div className={`line-detail-a11y-item ${a11yCls(c.WL)}`}>
            <div className="line-detail-a11y-k">휠체어 리프트</div>
            <div className="line-detail-a11y-v">{isY(c.WL) ? "있음" : "없음"}</div>
          </div>
          <div className={`line-detail-a11y-item ${a11yCls(c.FDROOM)}`}>
            <div className="line-detail-a11y-k">유아수유실</div>
            <div className="line-detail-a11y-v">{isY(c.FDROOM) ? "있음" : "없음"}</div>
          </div>
        </div>
        <p className="line-detail-muted">상세 위치/동선은 추후 제가 추가할 시 표기됩니다.</p>
      </section>

      {/* 출구/지도 프리뷰 다 작업 끝난 후 시간 되면 살펴보기*/}
      {/* <section className="line-detail-card">
        <div className="line-detail-card-hd">출구 정보</div>
        <div className="line-detail-empty">출구 데이터 연동 전입니다.</div>
      </section>

      <section className="line-detail-card line-detail-mapph">
        <div className="line-detail-card-hd">주변 정보</div>
        <div className="line-detail-mapph-map">Map Placeholder</div>
      </section> */}

      {/* 매칭 실패 안내 */}
      {!loading && !error && !facility && (
        <section className="line-detail-card">
          <div className="line-detail-card-hd">알림</div>
          <div className="line-detail-empty">해당 역 데이터를 찾지 못했습니다.</div>
        </section>
      )}
    </div>
  );
}