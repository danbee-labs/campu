// 1. 공백은 싹 없애
// 2. 대문자 소문자 없애

export function normalizeString(str) {
    return str.replace(/\s+/g, '').toLowerCase();
}

function bmhContains(text, pattern) {
  if (!pattern) return true;
  // 유니코드 정규화(한글 초성/중성 분해 문제 방지)
  text = normalizeString(text.normalize('NFC'));
  pattern = normalizeString(pattern.normalize('NFC'));

  const n = text.length, m = pattern.length;
  if (m > n) return false;

  // 1) skip 테이블(점프 길이): 기본 m, 일치 문자에 대해 m-1-i
  const skip = Object.create(null);
  const last = m - 1;
  for (let i = 0; i < last; i++) skip[pattern[i]] = last - i;
  const defaultSkip = m; // 테이블에 없는 문자는 통째로 점프

  // 2) 검색
  let i = last; // 텍스트 인덱스는 패턴의 끝과 맞춰 시작
  while (i < n) {
    let k = 0;
    // 뒤에서 앞으로 비교
    while (k < m && pattern[last - k] === text[i - k]) k++;
    if (k === m) return true; // 모두 일치
    // 불일치면 점프
    const ch = text[i];
    i += skip[ch] ?? defaultSkip;
  }
  return false;
}


// --- 검색 함수 ---
export function optimalSearch(info, key, input) {
  if (!input) return [];
  const normalizedInput = normalizeString(input);
  const out = [];


  for (let i = 0; i < info.length; i++) {
    const normalizeText = normalizeString(info[i][key]);
    if (bmhContains(normalizeText, normalizedInput)) out.push(info[i]);
  }

  return out;
}

export function basicSearch(info, key, input) { 
    const set = new Set();
    for (let i = 0; i < info.length; i++) {
        const originText = info[i][key];
        const splitOriginText = originText.split(' '); // 서울시 동구 노량진
        const splitInputText = input.split(' '); // 서울시 노량진
        let flag = true;
        for (const splitInput of splitInputText) {
            let tempFlag = false;
            for (const splitOrigin of splitOriginText) {
                if (splitOrigin.includes(splitInput)) {
                    tempFlag = true;
                    break;
                }
            }
            if (!tempFlag) {
                flag = false;
                break;
            }
        }
        if (flag) set.add(info[i]);
    }
    return [...set];
}

export function timer(fn){
    const now = performance.now();
    fn();
    return performance.now() - now;
}