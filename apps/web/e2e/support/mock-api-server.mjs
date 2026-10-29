import { createServer } from 'node:http';
import {
  classDetail,
  fixtureIds,
  packageDetail,
  schedule,
  siteConfig,
  studioDetail,
} from './mock-api-fixtures.mjs';

const json = (status, body) => ({ status, body });

function routeTable() {
  return new Map([
    ['GET /api/v1/public/site-config', json(200, siteConfig)],
    ['GET /api/v1/me', json(401, { code: 'UNAUTHENTICATED' })],
    ['POST /api/v1/auth/refresh', json(401, { code: 'UNAUTHENTICATED' })],
    ['GET /api/v1/me/notifications', json(200, { items: [], page: { hasMore: false } })],
    ['GET /api/v1/me/notifications/unread-count', json(200, { count: 0 })],
    ['GET /api/v1/dashboard/overview', json(200, { branches: [], totals: {} })],
    [
      'GET /api/v1/bookings',
      json(200, {
        items: [],
        summary: {
          total: 0,
          booked: 0,
          reschedulePending: 0,
          attended: 0,
          cancelled: 0,
        },
        page: { hasMore: false, nextCursor: null },
      }),
    ],
    [
      'GET /api/v1/finance/reconciliation/legacy-cashflow',
      json(200, { items: [], total: 0, summary: {}, page: { hasMore: false, nextCursor: null } }),
    ],
    [
      'GET /api/v1/branches',
      json(200, {
        items: [
          {
            id: 'branch-1',
            code: 'JKT',
            name: 'Jakarta',
            timezone: 'Asia/Jakarta',
            active: true,
            version: 0,
          },
        ],
        summary: { total: 1, active: 1, inactive: 0 },
        page: { hasMore: false, nextCursor: null },
      }),
    ],
    [`GET /api/v1/public/package-catalog/${fixtureIds.package}`, json(200, packageDetail)],
    ['GET /api/v1/public/class-types/movers', json(200, classDetail)],
    ['GET /api/v1/public/studios/jakarta', json(200, studioDetail)],
    [`GET /api/v1/public/class-catalog/${fixtureIds.schedule}`, json(200, schedule)],
  ]);
}

export function createMockApiRouter() {
  const routes = routeTable();
  const knownPaths = new Set([...routes.keys()].map((key) => key.slice(key.indexOf(' ') + 1)));
  return {
    resolve(method, pathname) {
      if (method === 'GET' && /^\/api\/v1\/branches\/[^/]+\/studios$/.test(pathname)) {
        const branchId = pathname.split('/')[4];
        return {
          status: 200,
          body: {
            items: [
              {
                id: `studio-${branchId}`,
                branchId,
                code: 'MAIN',
                name: 'Area Studio Utama',
                active: true,
                equipmentText: 'Reformer',
                contactPhoneE164: null,
                version: 0,
                rooms: [],
              },
            ],
          },
          handled: true,
        };
      }
      if (method === 'GET' && pathname === '/api/v1/checkout/options') {
        return { status: 404, body: { code: 'NOT_FOUND' }, handled: true };
      }
      if (method === 'GET' && /^\/api\/v1\/class-slots\/[^/]+\/bookings$/.test(pathname)) {
        return {
          status: 200,
          body: {
            items: [],
            summary: { total: 0, booked: 0, attended: 0, cancelled: 0 },
            page: { hasMore: false, nextCursor: null },
          },
          handled: true,
        };
      }
      const result = routes.get(`${method} ${pathname}`);
      if (result) return { ...result, handled: true };
      if (knownPaths.has(pathname)) {
        return {
          status: 405,
          body: { code: 'MOCK_METHOD_NOT_ALLOWED', method, pathname },
          handled: true,
        };
      }
      return {
        status: 501,
        body: { code: 'MOCK_ROUTE_UNHANDLED', method, pathname },
        handled: false,
      };
    },
  };
}

function writeJson(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(body));
}

export async function startMockApiServer({ host = '127.0.0.1', port = 0, runId = 'test' } = {}) {
  const router = createMockApiRouter();
  const requests = [];
  const unhandled = [];

  const server = createServer((request, response) => {
    const method = request.method ?? 'GET';
    const pathname = new URL(request.url ?? '/', `http://${host}`).pathname;

    if (pathname === '/__health') {
      return writeJson(response, 200, { status: 'ok', runId });
    }

    requests.push({ method, pathname });
    const result = router.resolve(method, pathname);
    if (!result.handled) unhandled.push({ method, pathname });
    return writeJson(response, result.status, result.body);
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Mock API did not bind to TCP.');

  return {
    url: `http://${host}:${address.port}`,
    requests,
    unhandled,
    async close() {
      await new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    },
  };
}
