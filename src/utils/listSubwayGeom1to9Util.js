// 1~9호선만 가져오는 처리
export function get1To9LineOnOrigin(origin) {
  const allowedLine = ['1호선','2호선','3호선','4호선','5호선','6호선','7호선','8호선','9호선'];
  return origin.filter(item => allowedLine.some(line => item.lineNm.indexOf(line) === 0 ));
}