// src/components/StationSearchbar.jsx
import { useDispatch, useSelector } from "react-redux";
import { setSearch } from "../../store/slices/subwayStationListSlice.js";
import "./StationSearchbar.css";
import { useEffect, useRef, useState } from "react"; 

function StationSearchbar({ onDraftChange }) { // (이전 답변에서 추가한 prop 유지)
  const dispatch = useDispatch();
  const storeValue = useSelector((state) => state.subwayStation.searchStationNm || "");

  // 인풋은 로컬로 제어
  const [value, setValue] = useState(storeValue);
  useEffect(() => {
    setValue(storeValue);
  }, [storeValue]);

  // IME(한글 조합) 플래그 + 디바운스 타이머
  const [ime, setIme] = useState(false);
  const timerRef = useRef(null);

  const flush = (val) => dispatch(setSearch(val)); // 확정 검색어만 Redux로 반영

  const handleChange = (e) => {                
    const v = e.target.value;
    setValue(v);
    onDraftChange?.(v); // draft를 부모로 전달해서 화면 필터 즉시 반영

    // [추가] 모두 삭제했을 때는 즉시 Redux도 비워 전체 리스트 보이게
    if (v.trim() === "") {
      setIme(false);               // [추가] 조합 상태도 강제로 종료
      clearTimeout(timerRef.current);
      flush("");                   // [추가] 확정 검색어를 빈 값으로 초기화
      return;                      // [추가] 더 이상 진행하지 않음
    }

    if (ime) return;  // 조합 중이면 Redux 반영 금지(화면은 draft로만 필터)
    // (선택) 조합이 아닐 때의 디바운스는 필요 없으면 주석 유지
    // clearTimeout(timerRef.current);
    // timerRef.current = setTimeout(() => flush(v), 120);
  };

  const onCompStart = () => setIme(true);

  const onCompEnd = () => {
    setIme(false);
    clearTimeout(timerRef.current);
    flush(value);            // 조합 종료 시 최종값을 확정 검색어로 저장
    onDraftChange?.(value);  // draft 최신화
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <input
      className="subway-searchbar_input"
      type="text"
      placeholder="역명으로 검색 (1~9호선)"
      value={value}
      onChange={handleChange}  
      onCompositionStart={onCompStart}
      onCompositionEnd={onCompEnd}
    />
  );
}

export default StationSearchbar;
