import { useParams } from 'react-router-dom';
import './SubwayStationDetail.css';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { realtimeArrivalsIndex, upFirstLastTimesIndex, downFirstLastTimesIndex } from '../../store/thunks/subwayStationDetailThunk.js';
import { clearState } from '../../store/slices/subwayStationDetailSlice.js';

// 평일:1, 토요일:2, 휴일/일요일:3 로 바꾸기
function dayCode() {
  const d = new Date().getDay(); // 0=일, 6=토
  if (d === 0) return 3;  // 휴일/일요일
  if (d === 6) return 2;  // 토요일
  return 1;               // 평일
}

/* ====================== 컴포넌트 ====================== */
function SubwayStationDetail() {
  const { stationId, stationLine, stationNm } = useParams();
  const dispatch = useDispatch();

  // params
  const lineNum =stationLine.replace(/^0+/,''); // "01호선" -> "1호선"
  const day = dayCode();                          // 평일=1, 토=2, 휴일/일=3
  const stationName = stationNm.endsWith("역") ? stationNm.slice(0, -1) : stationNm;

  const realtimeArrivalList = useSelector(state => state.subwayStationDetail.realtimeArrivalList);
  const upFirstLastTimesList = useSelector(state => state.subwayStationDetail.upFirstLastTimesList);
  const downFirstLastTimesList = useSelector(state => state.subwayStationDetail.downFirstLastTimesList);

  // ------- Unmount 처리 -------
  useEffect(() => {
    // 도착 정보 획득 할때 현재 호선을 아규먼트로 전달
    dispatch(realtimeArrivalsIndex(stationName));

    // 첫차,막차 정보 획득
    dispatch(upFirstLastTimesIndex({lineNum, day, stationId}));
    dispatch(downFirstLastTimesIndex({lineNum, day, stationId}));

    return () => {
      dispatch(clearState());
    }
  }, []);

  // ------- 도착 정보 처리 -------
  const [upTrainLineName, setUpTrainLineName] = useState('');
  const [downTrainLineName, setDownTrainLineName] = useState('');
  const [upArrivalInfo, setUpArrivalInfo] = useState([]);
  const [downArrivalInfo, setDownArrivalInfo] = useState([]);

  useEffect(() => {
    let tmpUpTrainLineName = '';
    let tmpDownTrainLineName = '';
    const tmpUpArrivalInfo = [];
    const tmpDownArrivalInfo = [];
    const line = `100${lineNum.replace('호선', '')}`;

    let upCount = 0;
    let downCount = 0;

    for (const item of realtimeArrivalList) {
      if(line !== item.subwayId) {
        continue;
      }

      // 상행/내선: 최대 2개만
      if(item.updnLine === '상행' || item.updnLine === '내선') {
        if (upCount < 2) {
          tmpUpArrivalInfo.push(item);
          upCount++;
          if(!tmpUpTrainLineName) {
            tmpUpTrainLineName = formatTrainLineNm(item.trainLineNm, 1);
          }
        }
      } 
      // 하행/외선: 최대 2개만
      else {
        if (downCount < 2) {
          tmpDownArrivalInfo.push(item);
          downCount++;
          if (!tmpDownTrainLineName) {
            tmpDownTrainLineName = formatTrainLineNm(item.trainLineNm, 1);
          }
        }
      }

      // 두 방향 모두 2개씩 모이면 종료
      if (upCount >= 2 && downCount >= 2) break;
    }

    setUpTrainLineName(tmpUpTrainLineName);
    setDownTrainLineName(tmpDownTrainLineName);
    setUpArrivalInfo(tmpUpArrivalInfo);
    setDownArrivalInfo(tmpDownArrivalInfo);
  }, [realtimeArrivalList]);

  useEffect(() => {
    const upIntervalId = setInterval(() => {
      setUpArrivalInfo(formatObjectIntervalArrivalTime(upArrivalInfo));
    }, 1000);
    const downIntervalId = setInterval(() => {
      setDownArrivalInfo(formatObjectIntervalArrivalTime(downArrivalInfo));
    }, 1000);

    return () => {
      clearInterval(upIntervalId);
      clearInterval(downIntervalId);
    }
  }, [upArrivalInfo, downArrivalInfo]);

  function formatObjectIntervalArrivalTime(arrivalInfo) {
    if (arrivalInfo.length > 0) {
      const copyArrivalInfo = JSON.parse(JSON.stringify(arrivalInfo));
      for (const item of copyArrivalInfo) {
        const tmpParse = parseInt(item.barvlDt);
        if(!tmpParse || tmpParse === 0) {
          item.barvlDt = '0';
          continue;
        }
  
        const parsebarvlDt = parseInt(item.barvlDt) - 1;
        item.barvlDt = parsebarvlDt.toString();
      }

      return copyArrivalInfo;
    }

    return arrivalInfo;
  }

  function formatTrainLineNm(trainLineNm, idx) {
    const str = (trainLineNm.split('-')[idx]).trim();
    let endStr = '';

    if(idx === 0) {
      endStr = '행';
    } else {
      endStr = '방면';
    }

    return str.endsWith(endStr) ? str : `${str}${endStr}`;
  }

  function formatArrivalString(barvlDt) {
    let formatStr = '-';
    
    if(!barvlDt) {
      return formatStr;
    }

    const parseBarvlDt = parseInt(barvlDt);

    if(parseBarvlDt > 0) {
      const minute = Math.floor(parseBarvlDt / 60).toString();
      const second = (parseBarvlDt % 60).toString();
      formatStr = `${minute.padStart(2, '0')}:${second.padStart(2, '0')} 후 도착`;
    } else {
      formatStr = '도착';
    }

    return formatStr;
  }
  
  function formatHHmmsstoHHss(time) {
    return time ? `${time.substring(0, 2)}:${time.substring(2, 4)}` : '-';
  }

  return (
    <div className="subway-station-detail-scope"> 
      <div className="subway-station-detail__title">
  <div className="detail-switch-center">
        {lineNum && (
          <span className="detail-switch-linebadge">
            {lineNum}
          </span>
        )}
        <span className="detail-switch-current">
          { stationNm || '역 이름 불러오는 중…' }
        </span>
      </div>
    </div>

    <div className="detail-stage">
      <div className="detail-root">
        <div className="detail-two-col">
          <section className="detail-section">
            {/* 방면표시 */}
            <div className='direction-label'>{upTrainLineName}</div>
            <div className="detail-card">
              {upArrivalInfo.length > 0 && upArrivalInfo.map(item => (
                <div key={item.ordkey}>
                  <div>
                    {`${formatTrainLineNm(item.trainLineNm, 0)}`}
                    <span className='detail-updn'>{`(${item.updnLine})`}</span>
                    {` ${formatArrivalString(item.barvlDt)}`}
                  </div>
                </div>
              ))}
              <div className="detail-row"><h4>첫차</h4><p>{formatHHmmsstoHHss(upFirstLastTimesList[0]?.FSTT_HRM)}</p></div>
              <div className="detail-row"><h4>막차</h4><p>{formatHHmmsstoHHss(upFirstLastTimesList[0]?.LSTTM_HRM)}</p></div>
            </div>
          </section>

          <section className="detail-section">
            {/* 방면표시 */}
            <div className='direction-label'>{downTrainLineName}</div>
            <div className="detail-card">
              {downArrivalInfo.length > 0 && downArrivalInfo.map(item => (
                <div key={item.ordkey}>
                  <div>
                    {`${formatTrainLineNm(item.trainLineNm, 0)}`}
                    <span className='detail-updn'>{`(${item.updnLine})`}</span>
                    {` ${formatArrivalString(item.barvlDt)}`}
                  </div>
                </div>
              ))}
              <div className="detail-row"><h4>첫차</h4><p>{formatHHmmsstoHHss(downFirstLastTimesList[0]?.FSTT_HRM)}</p></div>
              <div className="detail-row"><h4>막차</h4><p>{formatHHmmsstoHHss(downFirstLastTimesList[0]?.LSTTM_HRM)}</p></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
);
}

export default SubwayStationDetail;
