/* 거래 복기 차트 - 서비스 워커 (빌드마다 BUILD 값이 바뀌어 새 버전으로 인식됨) */
const BUILD = '20261024-073831-44562797-dummy2';
const CACHE = 'trade-replay-' + BUILD;
const ASSETS = ['index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-512-maskable.png'];

self.addEventListener('install', (e) => {
  // HTTP 캐시를 건너뛰고 서버에서 새로 받아 저장
  e.waitUntil(caches.open(CACHE).then((c) =>
    c.addAll(ASSETS.map((u) => new Request(u, {cache: 'reload'})))));
  // 바로 교체하지 않음: 화면의 '새 버전' 버튼을 누르거나 다음 실행 때 적용
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((k) => k.startsWith('trade-replay-') && k !== CACHE).map((k) => caches.delete(k))
  )).then(() => self.clients.claim()));
});

self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // imgur 등 외부는 그대로 네트워크
  if (url.pathname.endsWith('/sw.js') || url.pathname.endsWith('/version.json')) return;
  if (req.mode === 'navigate') {
    e.respondWith(caches.open(CACHE).then((c) => c.match('index.html'))
      .then((r) => r || fetch(req)));
    return;
  }
  e.respondWith(caches.open(CACHE).then((c) => c.match(req, {ignoreSearch: true}))
    .then((r) => r || fetch(req)));
});
