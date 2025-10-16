import './SubwayLineList.css'
import { Map, MapMarker } from "react-kakao-maps-sdk";

function SubwayLinePath() {
  return (
    <>
      <div className='subway-line-path__wrap'>
        <div className='subway-line-path__search-section'>
          <div>

          </div>
        </div>
        <div className='subway-line-path__map-section'>
          <Map
            center={{ lat: 33.450701, lng: 126.570667 }}
            style={{ width: '100%', height: '100%' }}
            level={3}
          >
            <MapMarker // 마커를 생성합니다
              position={{
                // 마커가 표시될 위치입니다
                lat: 33.450701,
                lng: 126.570667,
              }}>
              <div style={{ padding: "5px", color: "#000",width:"150px",height:"50px",display:"flex",justifyContent:"center",alignItems:"center"}}>
                서울역
              </div>
            </MapMarker>

          </Map>
        </div>
      </div>
    </>
  )
}

export default SubwayLinePath;