// import { createServer } from 'node:http';
// import { parse } from 'node:url';
// import { Readable } from 'node:stream';
// import next from 'next';

// const port = parseInt(process.env.PORT || '3000', 10);
// const dev = process.env.NODE_ENV !== 'production';
// const app = next({ dev });
// const handle = app.getRequestHandler();

// const BACKEND_BASE = process.env.BACKEND_BASE || 'https://hisoblyback.uz:9090';

// function getTokenFromCookie(cookieHeader = '') {
//   const m = cookieHeader.match(/(?:^|; )token=([^;]+)/);
//   return m ? decodeURIComponent(m[1]) : null;
// }

// function normalizeHeaders(reqHeaders, token) {
//   const headers = new Headers();
//   for (const [key, value] of Object.entries(reqHeaders)) {
//     if (!value) continue;
//     if ([
//       'host',
//       'connection',
//       'content-length',
//       'accept-encoding',
//       'x-forwarded-proto',
//       'x-forwarded-host',
//     ].includes(key.toLowerCase()))
//       continue;

//     if (Array.isArray(value)) {
//       for (const v of value) headers.append(key, String(v));
//     } else {
//       headers.set(key, String(value));
//     }
//   }
//   if (!headers.get('authorization') && token) {
//     headers.set('authorization', `Bearer ${token}`);
//   }
//   return headers;
// }

// function collectBody(req) {
//   return new Promise((resolve, reject) => {
//     const chunks = [];
//     req.on('data', (c) => chunks.push(c));
//     req.on('end', () => resolve(Buffer.concat(chunks)));
//     req.on('error', reject);
//   });
// }

// app.prepare().then(() => {
//   createServer(async (req, res) => {
//     try {
//       const parsedUrl = parse(req.url, true);

//       if (req.url.startsWith('/api/')) {
//         const targetUrl = BACKEND_BASE + req.url.replace(/^\/api\/?/, '/');

//         const token = getTokenFromCookie(req.headers.cookie || '');
//         const headers = normalizeHeaders(req.headers, token);

//         const init = { method: req.method, headers, redirect: 'manual' };
//         if (!['GET', 'HEAD'].includes(req.method)) {
//           init.body = await collectBody(req);
//         }

//         const upstream = await fetch(targetUrl, init);

//         // Status
//         res.statusCode = upstream.status;

//         // Headers
//         upstream.headers.forEach((value, key) => {
//           if ([
//             'content-encoding',
//             'transfer-encoding',
//             'connection',
//           ].includes(key.toLowerCase()))
//             return;
//           res.setHeader(key, value);
//         });

//         // Body
//         if (upstream.body) {
//           // upstream.body is a Web ReadableStream
//           const nodeStream = Readable.fromWeb(upstream.body);
//           nodeStream.on('error', () => {
//             try { res.end(); } catch {}
//           });
//           nodeStream.pipe(res);
//         } else {
//           res.end();
//         }
//         return;
//       }

//       // Let Next.js handle everything else
//       handle(req, res, parsedUrl);
//     } catch (err) {
//       console.error(err);
//       if (!res.headersSent) res.statusCode = 500;
//       res.end('Internal Server Error');
//     }
//   }).listen(port);

//   console.log(
//     `> Server listening at http://localhost:${port} as ${dev ? 'development' : process.env.NODE_ENV}`
//   );
// });

