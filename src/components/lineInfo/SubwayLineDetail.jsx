import { useEffect } from "react";
import "./subwayLineDetail.css";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";    
import { getSubwayDetail } from "../../store/thunks/subwayLineDetailThunk.js";
import { getSubwayTelAndAddr } from "../../store/thunks/subwayLineDetailTelAndAddrThunk.js";
import { removeParenAndRemoveYeok, removeParenAndMinusZero } from "../../utils/subwaySearchUtil.js";

// YN: 값을 받아서 Y인지 검사한 뒤 결과로 Y 또는 N을 반환
// - v ?? "": v가 null 또는 undefined이면 빈 문자열을 사용
// - String(...).trim().toUpperCase(): 공백 제거 후 대문자로 변환
// - 삼항 연산자 ? : 를 통해 'Y'면 'Y'를, 아니면 'N'을 반환
const YN = (v) => (String(v ?? "").trim().toUpperCase() === "Y" ? "Y" : "N");

/* 상태 클래스(on/off/unk), ok/no */
// isY: 값이 'Y'인지 불리언으로 반환합니다.
const isY = (v) => String(v ?? "").trim().toUpperCase() === "Y";

// facCls: 시설 상태에 따라 CSS 클래스 문자열을 반환
// - 값이 null 또는 빈 문자열이면 'off'
// - 값이 'Y'이면 'on'
// - 그 외의 경우 'off' (원래는 'unk' 같은 값을 넣을 수 있으나 현재 구현은 on/off만 사용)
const facCls = (v) => (v == null || String(v).trim() === "" ? "off" : isY(v) ? "on" : "off");

// a11yCls: 접근성(교통약자) 관련 항목에 대해 'ok' 또는 'no' 클래스 반환.
const a11yCls = (v) => (isY(v) ? "ok" : "no");

// React 함수형 컴포넌트의 시작점. 이 컴포넌트는 역의 상세(시설, 주소, 연락처 등)를 렌더
export default function SubwayLineDetail() {
  // dispatch를 받아 store에 액션을 보낼 준비
  const dispatch = useDispatch();

  // URL 파라미터에서 stnKrNm(역명, 한국어)과 lineNm(호선명)을 디스트럭처링으로 꺼낸다.
  // 예: 라우트가 '/station/:stnKrNm/:lineNm' 형태라면 해당 값이 들어온다.
  const { stnKrNm, lineNm } = useParams();

    // 스토어에서 로딩 상태를 읽어옵니다. 값이 없으면(false) 기본값 false를 사용.
   const loading = useSelector((s) => s.subwayLineDetail?.loading ?? false);
    // 스토어에서 에러 메시지를 읽어옵니다. 없으면 null.
   const error   = useSelector((s) => s.subwayLineDetail?.error ?? null);

  // 시설 API rows
  // 스토어의 subwayLineDetail 안에 있는 stationDetail(시설 배열)을 가져온다.
  const rows = useSelector(s => s.subwayLineDetail.stationDetail);

  // 주소/전화 API rows
  // 주소/전화 정보를 담은 배열을 가져온다.
  const addrRows = useSelector(s => s.subwayLineDetail.stationAddrTel);

  useEffect(() => {
    // 컴포넌트가 마운트되었을 때(또는 deps가 바뀔 때) 실행
    // rows 배열이 비어있다면(getSubwayDetail이 아직 호출되지 않았거나 데이터가 없다면
    // getSubwayDetail 액션을 디스패치해서 API 호출을 시작
    if (!rows.length) dispatch(getSubwayDetail());

    // 마찬가지로 주소/전화 정보가 비어있으면 해당 액션을 디스패치
    if (!addrRows.length) dispatch(getSubwayTelAndAddr());

    // 의존성 배열: dispatch(함수 참조 안정성), rows.length, addrRows.length
    // rows.length와 addrRows.length만 의존성으로 넣은 이유는 배열 참조 자체가 바뀔 때마다(참조 변경)
    // useEffect가 불필요하게 여러번 돌지 않도록 길이만 검사하려는 의도
  }, [dispatch, rows.length, addrRows.length]);

  // 정규화된 역명/호선명
  // URL에서 받아온 stnKrNm을 유틸로 정규화합니다. 예: '서울(중앙)' -> '서울', '서울역' -> '서울'
  const detailName = removeParenAndRemoveYeok(stnKrNm);
  // URL에서 받아온 lineNm을 정규화합니다. 예: '1호선(급행)' 혹은 '01호선' -> '1호선'
  const detailLine = removeParenAndMinusZero(lineNm);


  // 편의시설 부분 포함 매칭
  // rows 배열에서 현재 detailName과 detailLine에 일치하는 시설 정보를 찾는다.
  // - r?.STATION_NAME: 옵셔널 체이닝으로 r이 null/undefined일 때 에러를 방지
  // - 찾지 못하면 undefined이므로 '?? null'로 null을 기본값으로 설정
  const facility = rows.find((r) =>
    removeParenAndRemoveYeok(r?.STATION_NAME ?? "") === detailName &&
    removeParenAndMinusZero(r?.LINE ?? "") === detailLine
  ) ?? null;

  // 주소/전화 쪽에서도 동일 방식으로 매칭
  // 주소/전화 배열에서 같은 방식으로 역을 찾아 telAddr에 저장
  const telAddr = addrRows.find((r) =>
    removeParenAndRemoveYeok(r?.SBWY_STNS_NM ?? "") === detailName &&
    removeParenAndMinusZero(r?.SBWY_ROUT_LN ?? "") === detailLine
  ) ?? null;

  // 화면 표기용 값
  // 편의시설이 있으면 그 객체를 c에, 없으면 빈 객체를 할당, 이렇게 하면 이후 접근 시 안전하다.
  const c = facility ?? {};

  // 화면에 표시할 역명 결정 우선순위:
  // 1. URL에서 정규화한 detailName
  // 2. 시설 API의 STATION_NAME
  // 3. 주소/전화 API의 SBWY_STNS_NM
  // 4. 모두 없으면 "역명 미상"으로 표시
  const stationName = detailName || c.STATION_NAME || telAddr?.SBWY_STNS_NM || "역명 미상";
  
  // 표시할 호선명. detailLine이 없으면 '-'로 표기
  const line = detailLine || "-"; // 이미 정규화된 "N호선"

  // 역 정보 3칸: 지번/도로명/연락처 <- 원래는 (역명/호선/역코드)
  // 주소/전화 API에서 지번 주소(OLD_ADDR)를 가져오고 없으면 '-'
  const oldAddr  = telAddr?.OLD_ADDR     || "-";
  // 주소/전화 API에서 도로명 주소(ROAD_NM_ADDR)를 가져오고 없으면 '-'
  const roadAddr = telAddr?.ROAD_NM_ADDR || "-";
  // 주소/전화 API에서 전화번호(TELNO)를 가져오고 없으면 '-'
  const telno    = telAddr?.TELNO        || "-";
  
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
          {/* <p className="line-detail-hint">상태 값은 Y/N 기준이며, 빈 값은 N으로 표기합니다.</p> */}
        </div>

        {/* 교통약자 요약 */}
        <div className="line-detail-card">
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
          {/* <p className="line-detail-muted">상세 위치/동선은 추후 제가 추가할 시 표기됩니다.</p> */}
        </div>

        {/* 매칭 실패 안내 */}
        {!loading && !error && !facility && (
          <div className="line-detail-card">
            <div className="line-detail-card-hd">알림</div>
            <div className="line-detail-empty">해당 역 데이터를 찾지 못했습니다.</div>
          </div>
        )}
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
          {/* - facCls(c.PARKING): 해당 값에 따라 'on' 또는 'off' 클래스가 붙는다.
              - aria-hidden은 보조 기술(스크린리더)에게 아이콘이 의미 없는 장식임을 알려줌.
              - YN(c.PARKING): 값이 'Y'면 'Y', 아니면 'N'을 표시해 사용자가 상태를 즉시 알 수 있게 한다.
          */}
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
      </div>

      {/* 교통약자 요약 */}
      <div className="line-detail-card">
        <div className="line-detail-card-hd">교통약자 정보</div>
        <div className="line-detail-a11y-grid">
          {/* a11yCls(c.EL): 'ok' 또는 'no' 클래스를 반환.
              isY(c.EL) ? "있음" : "없음" 으로 텍스트 표현.
          */}
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
      </div>

      {/* 매칭 실패 안내 */}
      {/* facility가 falsy(없음)이고 loading, error가 둘 다 false인 경우에만 표시 */}
      {!loading && !error && !facility && (
        <div className="line-detail-card">
          <div className="line-detail-card-hd">알림</div>
          <div className="line-detail-empty">해당 역 데이터를 찾지 못했습니다.</div>
        </div>
      )}
    </div>
  </>
  );
}