import { useEffect, useState } from "react"; // 리액트 훅 임포트.
import "./InstallPrompt.css";

function InstallPrompt() {

  // 설치 이벤트 객체를 보관할 상태, 나중에 prompt()를 호출해서 설치 창을 띄울 수 있음
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dialFlg, setDiaFlg] = useState(true);


  useEffect(() => {
    // 크롬/엣지 계열에서 PWA 설치 가능 시(마운트 시 이벤트 리스너 등록) 발생
    const onInstallPrompt = (e) => {  // 설치 가능 시 발생하는 이벤트 핸들러 정의
      e.preventDefault();          // 브라우저 기본 설치 팝업 막기
      setDeferredPrompt(e); // 이벤트 객체를 상태에 저장. 나중에 버튼 클릭 시 호출해야하니 일단 미뤄서(deferred) 보관
    };

    // 설치가 성공적으로 완료되었을 때(appinstalled) 실행할 핸들러
    const onInstalled = () => {
      setDeferredPrompt(null); // 저장한 이벤트를 비우기
    };

    window.addEventListener("beforeinstallprompt", onInstallPrompt); // 등록
    window.addEventListener("appinstalled", onInstalled); // 설치완료도 등록

    return () => { // 언마운트 시 시작: 클린 업
      window.removeEventListener("beforeinstallprompt", onInstallPrompt); // 리스너 등록 해제
      window.removeEventListener("appinstalled", onInstalled); // 리스너 등록 해제
    };
  }, []); // 의존성 배열이 빈 배열 → 마운트/언마운트에 한 번만 실행돼요.

	 // 설치 버튼 클릭 핸들러 : 설치 프롬프트 띄우는 유일한 타이밍=버튼 클릭 뿐이기에
  const handleInstall = async() => {  // 버튼 클릭 시 실행
    if (!deferredPrompt) return;
    deferredPrompt.prompt(); 
    
    const result = await deferredPrompt.userChoice;
    if(result.outcome === 'dismissed'){
      setDiaFlg(false);
    }
    // 이벤트가 없으면 아무것도 안함 // 보관해 둔 이벤트의 prompt()를 호출
    setDeferredPrompt(null);               // 이벤트는 1회용이라 바로 비워 재사용 방지
  };

  if (!deferredPrompt) return null;              // 설치 가능할 때만 버튼/베너 노출

  return (
    <>
     {
       // 설치 가능한 상태일 때만 버튼 출력  
       (deferredPrompt && dialFlg) && 
       (
        <div className="prompt-container">
            <p className="prompt-info">SEOULWAY</p>
            <button className="prompt-btn" onClick={handleInstall} type="button"> DownLoad </button>
        </div>
       )
     }
    </>
  );
}

export default InstallPrompt;


