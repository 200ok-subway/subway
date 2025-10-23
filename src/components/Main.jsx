import './Main.css';
import { useNavigate } from "react-router-dom";


function Main() {
  const navigate = useNavigate();

  return (
    <>
      <div className="main-logo-box">
        <img src="/base/subwaylogo.png" alt="로고 이미지" />
      </div>
      <div className="main-button-wrap">
        <div className="main-button" onClick={() => {navigate(`/stations`)}}>
          <p>지하철역 검색</p>
        </div>
        <div className="main-button" onClick={()=>{navigate(`/line-diagrams`)}}>
          <p>노선도 보기</p>
        </div>
      </div>
    </>
  )
}

export default Main;