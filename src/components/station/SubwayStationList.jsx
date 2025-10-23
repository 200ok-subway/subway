import { useDispatch, useSelector } from 'react-redux';
import './SubwayStationList.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subwayStationIndex } from '../../store/thunks/subwayStationListThunk';
function SubwayStationList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const onChange = (e) => {
    setSearch(e.target.value)
  }
  const subwayList = useSelector(state => state.subwayStation.subwayList);
  useEffect(() => {
    dispatch(subwayStationIndex());
  }, []);
let filteredList = [];
  if(Array.isArray(subwayList)){
    filteredList = subwayList.filter((item)=>{
      const stationName = item.STATION_NM.toLocaleLowerCase();
      const lineNum = item.LINE_NUM.replace(/^0+/,'');
      const searchText = search.toLocaleLowerCase();
      return (stationName.includes(searchText)||lineNum.includes(searchText))
    })
  }
  return (
    <>
      <div className="subway-station-list__title">
        <h1>지하철역 리스트</h1>
      </div>
      <div className="subway-station-list__searchbar">
        <input type='text' value={search} onChange={onChange} placeholder="지하철역을 검색해주세요."/>
      </div>
      <div className="subway-station-list">
        {
          filteredList.map((item) => {
            return(
              <div className="subway-station-list__item" key={item.STATION_CD} onClick={() => { navigate(`/stations/${item.STATION_CD}/${item.LINE_NUM}/${item.STATION_NM}`) }}>
                <div className="subway-station-list__icon">
                  <img src="/base/mainnavsubway.png" alt="지하철 사진" />
                </div>
                <p>{`${item.LINE_NUM.replace(/^0+/,'')} ${item.STATION_NM}`}</p>
              </div>
            );
          })
        }
      </div>
    </>
  )
}
export default SubwayStationList;