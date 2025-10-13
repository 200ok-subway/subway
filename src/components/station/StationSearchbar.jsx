import { useDispatch, useSelector } from "react-redux";
import { setSearch } from "../../store/slices/subwayStationListSlice.js";
import "./StationSearchbar.css";
import { useEffect, useRef, useState } from "react"; 

function StationSearchbar() {
  
  const dispatch = useDispatch();
  const storeValue = useSelector((state) => state.subwayStation.searchStationNm || "");

  // 인풋은 로컬로 제어
  const [value, setValue] = useState(storeValue);
  useEffect(() => {
    setValue(storeValue); }, [storeValue]);

  // IME(한글 조합) 플래그 + 디바운스 타이머
  const [ime, setIme] = useState(false);
  const timerRef = useRef(null);

  const flush = (val) => dispatch(setSearch(val));

  const handleChange = (e) => {                
    const v = e.target.value;
    setValue(v);                  // 입력은 로컬에만
    if (ime) return;              // 조합 중이면 스토어 갱신 금지
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => flush(v), 120);
  };

  const onCompStart = () => setIme(true);
    const onCompEnd = () => {
    setIme(false);
    clearTimeout(timerRef.current);
    flush(value);                 // 조합 종료 시 최종값 반영
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
