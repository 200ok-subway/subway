const swRegister = () => {
  // 서비스 워커 지원 여부 확인 
 if('serviceWorker' in navigator) {
   navigator.serviceWorker
    .register(
        '/sw.js',  // ← 반드시 루트 경로. public/sw.js 를 가리킴
        {
          scope: '/',  
        }
    )
    .then(registration => {
        console.log('서비스 워커 등록 성공', registration);
    })
    .catch(err => {
         console.log('서비스 워커 등록 실패', err);
    });
   } 
}

export default swRegister;