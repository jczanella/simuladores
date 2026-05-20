const CACHE = 'simuladores-v1';

const ARQUIVOS = [
  '/simuladores/',
  '/simuladores/index.html',
  '/simuladores/CE_maisinovacao.html',
  '/simuladores/CE_pronampce.html',
  '/simuladores/CE_cdccampanha.html',
  '/simuladores/manifest.json',
  '/simuladores/icon-192.png',
  '/simuladores/icon-512.png',
];

// Instalação: pré-carrega arquivos locais no cache
self.addEventListener('install', event => {
  self.skipWaiting(); // ativa imediatamente, sem esperar fechar abas
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ARQUIVOS))
  );
});

// Ativação: remove caches antigos e assume controle de todas as abas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: Network First
// — Com internet: busca versão mais recente, atualiza cache, exibe conteúdo fresco
// — Sem internet: serve a última versão salva no cache
self.addEventListener('fetch', event => {
  // Ignorar requisições que não sejam GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Salva cópia fresca no cache apenas para URLs do próprio site
        if (response.ok && event.request.url.includes('jczanella.github.io')) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
