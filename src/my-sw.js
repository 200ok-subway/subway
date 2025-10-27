// 서비스 워커 (Service Worker) 파일
import { precacheAndRoute } from "workbox-precaching";

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API는 SW가 손대지 않음(프록시 정상 동작 위해)
  if (url.pathname.startsWith('/bigdata') || url.pathname.startsWith('/opendata')) {
    return; // 네트워크로 그대로 보내기
  }
})  

// Vite가 빌드 시, 여기에 정적 파일 경로를 삽입하는 처리 
precacheAndRoute(self.__WB_MANIFEST);

// 이하 이벤트 처리
self.addEventListener('install', (e) => {
    console.log(`[서비스 워커] 설치 완료`, e);
});

// 활성화 이벤트
self.addEventListener('activate', (e) => {
    console.log(`[서비스 워커] 활성화 중`, e);
});

// 설치/활성화 로그 정도만 남기고, fetch 이중 등록은 제거


// self.addEventListener('fetch', (e) => {
//     console.log(`[서비스 워커] 리소스 패치`, e);
// });
//----------------------------------------------

// 수정? 
//기존 파일엔 fetch 리스너가 2개라 모든 요청이 로그에 찍혔어요. 하나로 합치고, 
// /bigdata & /opendata는 무시해서 프록시로 바로 가도록 조정