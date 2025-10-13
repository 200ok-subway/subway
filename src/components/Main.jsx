import { useNavigate } from 'react-router-dom';
import './Main.css'

function Main () {
    const navigate = useNavigate()
    return (
        <>
            <div className="main-logoImgBox">
                <img src="/base/subwaylogo.png" alt="로고이미지" />
            </div>
            <div className='main-buttonWrap'>
                <div className='main-button' onClick={()=>{navigate(`/stationlist`)}}>
                    <p>지하철역 검색</p>
                </div>
                <div className='main-button' onClick={()=>{navigate(`/line-diagrams`)}}>
                    <p>노선도 보기</p>
                </div>
            </div>
        </>
    )
}

export default Main;