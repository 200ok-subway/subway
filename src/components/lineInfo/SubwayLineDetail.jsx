import { useEffect } from "react";
import "./subwayLineDetail.css";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";    
import { getSubwayDetail } from "../../store/thunks/subwayLineDetailThunk.js";
import { getSubwayTelAndAddr } from "../../store/thunks/subwayLineDetailTelAndAddrThunk.js";
import { removeParenAndRemoveYeok, removeParenAndMinusZero } from "../../utils/subwaySearchUtil.js";


const YN = (v) => (String(v ?? "").trim().toUpperCase() === "Y" ? "Y" : "N");
const isY = (v) => String(v ?? "").trim().toUpperCase() === "Y";
const facCls = (v) => (v == null || String(v).trim() === "" ? "off" : isY(v) ? "on" : "off");
const a11yCls = (v) => (isY(v) ? "ok" : "no");

export default function SubwayLineDetail() {
  const dispatch = useDispatch();
  const { stnKrNm, lineNm } = useParams();
  const loading = useSelector((s) => s.subwayLineDetail?.loading ?? false);
  const error   = useSelector((s) => s.subwayLineDetail?.error ?? null);
  const rows = useSelector(s => s.subwayLineDetail.stationDetail);
  const addrRows = useSelector(s => s.subwayLineDetail.stationAddrTel);

  useEffect(() => {
    if (!rows.length) dispatch(getSubwayDetail());
    if (!addrRows.length) dispatch(getSubwayTelAndAddr());
  }, [dispatch, rows.length, addrRows.length]);

  const detailName = removeParenAndRemoveYeok(stnKrNm);
  const detailLine = removeParenAndMinusZero(lineNm);

  const facility = rows.find((r) =>
    removeParenAndRemoveYeok(r?.STATION_NAME ?? "") === detailName &&
    removeParenAndMinusZero(r?.LINE ?? "") === detailLine
  ) ?? null;

  const telAddr = addrRows.find((r) =>
    removeParenAndRemoveYeok(r?.SBWY_STNS_NM ?? "") === detailName &&
    removeParenAndMinusZero(r?.SBWY_ROUT_LN ?? "") === detailLine
  ) ?? null;

  const c = facility ?? {};
  const stationName = detailName || c.STATION_NAME || telAddr?.SBWY_STNS_NM || "역명 미상";
  const line = detailLine || "-"; // 이미 정규화된 "N호선"
  const oldAddr  = telAddr?.OLD_ADDR     || "-"; // 주소/전화 API에서 지번 주소(OLD_ADDR)를 가져오고 없으면 '-'
  const roadAddr = telAddr?.ROAD_NM_ADDR || "-"; // 주소/전화 API에서 도로명 주소(ROAD_NM_ADDR)를 가져오고 없으면 '-'
  const telno    = telAddr?.TELNO        || "-"; // 주소/전화 API에서 전화번호(TELNO)를 가져오고 없으면 '-'
  
    return (
    <>
    <div className="line-detail-main-title"><h1>지하철역 편의시설 정보</h1></div>

    <div className="line-detail">
      {/* 타이틀 */}
      <div className="line-detail-sub-title">
        <div className="line-detail-title-text">
          <h1 className="line-detail-title-name">{stationName}</h1>
          <span className="line-detail-title-pill">{line}</span>
        </div>

        {/* 로딩/에러 */}
        {loading && (
          <div className="line-detail-card">
            <div className="line-detail-card-hd">로딩</div>
            불러오는 중…
          </div>
        )}
        {error && (
          <div className="line-detail-card">
            <div className="line-detail-card-hd">에러</div>
            <div className="line-detail-empty">{String(error)}</div>
          </div>
        )}

        {/* 역 정보 */}
        <div className="line-detail-card">
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
        </div>

      {/* 시설 정보 (기존 그대로) */}
      <div className="line-detail-card">
        <div className="line-detail-card-hd">시설 정보</div>
        <div className="line-detail-fac-grid">
          <div className={`line-detail-fac ${facCls(c.PARKING)}`}>
            <div className="line-detail-fac-ico" aria-hidden>
              <img className="line-detail-img" src="/subwaylinedetailbase/transfer-parking-lot.png" alt="환승주차장 아이콘" />
            </div>
            <div className="line-detail-fac-label">환승주차장</div>
            <div className="line-detail-fac-status">{YN(c.PARKING)}</div>
          </div>
          <div className={`line-detail-fac ${facCls(c.BICYCLE)}`}>
            <div className="line-detail-fac-ico" aria-hidden>
              <img className="line-detail-img" src="/subwaylinedetailbase/bicycle-storage.png" alt="자전거보관소 아이콘" />
            </div>
            <div className="line-detail-fac-label">자전거보관소</div>
            <div className="line-detail-fac-status">{YN(c.BICYCLE)}</div>
          </div>
          <div className={`line-detail-fac ${facCls(c.CIM)}`}>
            <div className="line-detail-fac-ico" aria-hidden>
              <img className="line-detail-img" src="/subwaylinedetailbase/unmanned-civil-service-issuance-machine.png" alt="무인민원발급기 아이콘" />
            </div>
            <div className="line-detail-fac-label">무인민원발급기</div>
            <div className="line-detail-fac-status">{YN(c.CIM)}</div>
          </div>
          <div className={`line-detail-fac ${facCls(c.EXCHANGE)}`}>
            <div className="line-detail-fac-ico" aria-hidden>
              <img className="line-detail-img" src="/subwaylinedetailbase/currency-exchange-kiosk.png" alt="환전키오스크 아이콘" />
            </div>
            <div className="line-detail-fac-label">환전키오스크</div>
            <div className="line-detail-fac-status">{YN(c.EXCHANGE)}</div>
          </div>
          <div className={`line-detail-fac ${facCls(c.TRAIN)}`}>
            <div className="line-detail-fac-ico" aria-hidden>
              <img className="line-detail-img" src="/subwaylinedetailbase/train-reservation.png" alt="기차예매 아이콘" />
            </div>
            <div className="line-detail-fac-label">기차예매</div>
            <div className="line-detail-fac-status">{YN(c.TRAIN)}</div>
          </div>
          <div className={`line-detail-fac ${facCls(c.CULTURE)}`}>
            <div className="line-detail-fac-ico" aria-hidden>
              <img className="line-detail-img" src="/subwaylinedetailbase/cultural-space.png" alt="문화공간 아이콘" />
            </div>
            <div className="line-detail-fac-label">문화공간</div>
            <div className="line-detail-fac-status">{YN(c.CULTURE)}</div>
          </div>
          <div className={`line-detail-fac ${facCls(c.PLACE)}`}>
            <div className="line-detail-fac-ico" aria-hidden>
              <img className="line-detail-img" src="/subwaylinedetailbase/meeting-place.png" alt="만남의장소 아이콘" />
            </div>
            <div className="line-detail-fac-label">만남의장소</div>
            <div className="line-detail-fac-status">{YN(c.PLACE)}</div>
          </div>
        </div>
      </div>

        {/* 교통약자 요약 */}
        <div className="line-detail-card">
          <div className="line-detail-card-hd">교통약자 정보</div>
          <div className="line-detail-a11y-grid">
            <div className={`line-detail-a11y-item ${a11yCls(c.EL)}`}>
            <div className="line-detail-ally-img">
              <img className="line-detail-img" src="/subwaylinedetailbase/elevator.png" alt="엘리베이터 아이콘" />
            </div>
              <div className="line-detail-a11y-k">엘리베이터</div>
              <div className="line-detail-a11y-v">{isY(c.EL) ? "있음" : "없음"}</div>
            </div>
            <div className={`line-detail-a11y-item ${a11yCls(c.WL)}`}>
            <div className="line-detail-ally-img">
              <img className="line-detail-img" src="/subwaylinedetailbase/wheelchair lift.png" alt="휠체어리프트 아이콘" />
            </div>
              <div className="line-detail-a11y-k">휠체어 리프트</div>
              <div className="line-detail-a11y-v">{isY(c.WL) ? "있음" : "없음"}</div>
            </div>
            <div className={`line-detail-a11y-item ${a11yCls(c.FDROOM)}`}>
            <div className="line-detail-ally-img">
              <img className="line-detail-img" src="/subwaylinedetailbase/Infant feeding room.png" alt="유아수유실 아이콘" />
            </div>
              <div className="line-detail-a11y-k">유아수유실</div>
              <div className="line-detail-a11y-v">{isY(c.FDROOM) ? "있음" : "없음"}</div>
            </div>
          </div>
        </div>

        {/* 매칭 실패 안내 */}
        {!loading && !error && !facility && (
          <div className="line-detail-card">
            <div className="line-detail-card-hd">알림</div>
            <div className="line-detail-empty">해당 역 데이터를 찾지 못했습니다.</div>
          </div>
        )}
      </div>
    </div>
  </>
  );
}