/**
 * Kontrak web ↔ API (statis). Menangkap kelas bug "tombol memanggil endpoint yang tidak ada":
 *
 *  1. Setiap operasi generated client (`packages/api-client-ts/generated/apis`) yang DIPAKAI web
 *     harus cocok dengan rute controller (metode + path).
 *  2. Setiap path literal yang dipanggil klien web tulisan tangan (`apiFetch('/x')`,
 *     `request('/x')`, `fetch('/api/v1/x')`, …) harus cocok dengan salah satu rute controller.
 *
 * Pencocokan per segmen: `:param`, `{param}` dan `${…}` cocok dengan segmen apa pun.
 * Yang sengaja belum ada dicatat di KNOWN_MISSING lengkap dengan alasannya.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';

const API_SRC = path.resolve(__dirname, '..');
const WEB_APP = path.resolve(__dirname, '../../../web/app');
const GENERATED = path.resolve(__dirname, '../../../../packages/api-client-ts/generated/apis');
const HTTP_VERBS = ['Get', 'Post', 'Put', 'Patch', 'Delete'] as const;

/** Path (awalan) yang sengaja belum punya rute API. Tiap entri wajib beralasan. */
const KNOWN_MISSING: Array<{ prefix: string; method?: string; reason: string }> = [
  {
    prefix: '/support-cases/',
    method: 'PATCH',
    reason: 'Kasus bantuan masih pratinjau (memori API): ubah status/prioritas belum ada di API; formnya dinonaktifkan.',
  },
  {
    prefix: '/support-cases/',
    method: 'POST',
    reason: 'Kasus bantuan masih pratinjau (memori API): catatan internal belum ada di API; formnya dinonaktifkan.',
  },
  {
    prefix: '/data-import',
    reason: 'Halaman Import Data dormant (tidak ada di navigasi) dan API impornya belum dibuat.',
  },
  {
    prefix: '/audit-exports',
    reason: 'Ekspor audit dimatikan di halaman (exportEnabled=false) sampai audit disimpan permanen.',
  },
];

/** Klien yang membungkus `fetch` dengan awalan tetap; path literal di berkasnya relatif ke awalan ini. */
const FILE_BASE: Record<string, string> = {
  'api-clients/data-import-client.ts': '/data-import',
  'migrations/migration-client.ts': '/internal/migrations',
};

interface Route {
  method: string;
  segments: string[];
  label: string;
}

const segmentsOf = (raw: string) =>
  raw
    .split('?')[0]!
    .split('/')
    .filter(Boolean)
    .map((segment) =>
      /^:|^\{.*\}$|\$\{/.test(segment) || segment.includes('${') ? '*' : segment,
    );

/**
 * `strict` (operasi generated client): segmen parameter di klien (`{decision}`) harus dipenuhi
 * segmen parameter di rute; rute berpath literal (`…/decide`) TIDAK memenuhi `{decision}` karena
 * klien akan mengirim nilai lain (`approve`). Mode longgar dipakai untuk path tulisan tangan.
 */
function segmentsMatch(client: string[], route: string[], strict = false) {
  return (
    client.length === route.length &&
    client.every((segment, index) => {
      const other = route[index]!;
      if (segment === '*') return strict ? other === '*' : true;
      return other === '*' || segment === other;
    })
  );
}

function walk(dir: string, accept: (file: string) => boolean, out: string[] = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, accept, out);
    else if (accept(full)) out.push(full);
  }
  return out;
}

const literalValues = (node: ts.Expression | undefined): string[] => {
  if (!node) return [''];
  if (ts.isStringLiteralLike(node)) return [node.text];
  if (ts.isArrayLiteralExpression(node))
    return node.elements.flatMap((element) => literalValues(element as ts.Expression));
  return [];
};

function controllerRoutes(): Route[] {
  const routes: Route[] = [];
  const files = walk(API_SRC, (f) => f.endsWith('.controller.ts'));
  for (const file of files) {
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.ES2022, true);
    source.forEachChild((node) => {
      if (!ts.isClassDeclaration(node)) return;
      const decorators = ts.getDecorators(node) ?? [];
      const controller = decorators.find(
        (d) => ts.isCallExpression(d.expression) && d.expression.expression.getText() === 'Controller',
      );
      if (!controller || !ts.isCallExpression(controller.expression)) return;
      const bases = literalValues(controller.expression.arguments[0]);
      for (const member of node.members) {
        if (!ts.isMethodDeclaration(member)) continue;
        for (const decorator of ts.getDecorators(member) ?? []) {
          if (!ts.isCallExpression(decorator.expression)) continue;
          const name = decorator.expression.expression.getText();
          if (!(HTTP_VERBS as readonly string[]).includes(name)) continue;
          for (const base of bases)
            for (const sub of literalValues(decorator.expression.arguments[0]))
              routes.push({
                method: name.toUpperCase(),
                segments: segmentsOf(`${base}/${sub}`),
                label: `${name.toUpperCase()} /${segmentsOf(`${base}/${sub}`).join('/')} (${path.basename(file)})`,
              });
        }
      }
    });
  }
  return routes;
}

interface GeneratedOperation {
  api: string;
  name: string;
  method: string;
  url: string;
}

function generatedOperations(): GeneratedOperation[] {
  const operations: GeneratedOperation[] = [];
  for (const file of walk(GENERATED, (f) => f.endsWith('Api.ts'))) {
    const text = fs.readFileSync(file, 'utf8');
    const api = /export class (\w+)/.exec(text)?.[1];
    if (!api) continue;
    for (const match of text.matchAll(/async (\w+)Raw\([\s\S]*?\n {4}\}\n/g)) {
      const body = match[0];
      const url = /let urlPath = `([^`]+)`/.exec(body)?.[1];
      const method = /method: '(\w+)'/.exec(body)?.[1];
      if (url && method) operations.push({ api, name: match[1]!, method, url });
    }
  }
  return operations;
}

/** Teks argumen sebuah pemanggilan, dari `(` pembuka sampai `)` penutup yang seimbang. */
function callArguments(text: string, open: number): string {
  let depth = 0;
  let quote = '';
  for (let index = open; index < text.length && index < open + 2000; index += 1) {
    const char = text[index]!;
    if (quote) {
      if (char === '\\') index += 1;
      else if (char === quote) quote = '';
    } else if (char === '"' || char === "'" || char === '`') quote = char;
    else if (char === '(') depth += 1;
    else if (char === ')' && --depth === 0) return text.slice(open, index + 1);
  }
  return text.slice(open, open + 300);
}

const webFiles = () =>
  walk(WEB_APP, (f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f) && !f.includes('/e2e/'));

const enabled = fs.existsSync(WEB_APP) && fs.existsSync(GENERATED);
const suite = enabled ? describe : describe.skip;

suite('web ↔ API contract', () => {
  const routes = controllerRoutes();
  const sources = webFiles().map((file) => ({
    file: path.relative(WEB_APP, file),
    text: fs.readFileSync(file, 'utf8'),
  }));

  it('discovers the API routes and web sources it compares', () => {
    expect(routes.length).toBeGreaterThan(200);
    expect(sources.length).toBeGreaterThan(100);
  });

  it('every generated-client operation the web calls has a matching API route', () => {
    const operations = generatedOperations();
    expect(operations.length).toBeGreaterThan(100);
    const missing: string[] = [];
    for (const { file, text } of sources) {
      const apis = new Set([...text.matchAll(/new (\w+Api)\(/g)].map((m) => m[1]));
      if (apis.size === 0) continue;
      for (const operation of operations) {
        if (!apis.has(operation.api)) continue;
        if (!new RegExp(`\\.${operation.name}\\(`).test(text)) continue;
        const wanted = segmentsOf(operation.url);
        const ok = routes.some(
          (route) =>
            route.method === operation.method && segmentsMatch(wanted, route.segments, true),
        );
        if (!ok) missing.push(`${operation.method} ${operation.url}  ← ${operation.api}.${operation.name} (${file})`);
      }
    }
    expect([...new Set(missing)]).toEqual([]);
  });

  it('every hand-written web call points at a path the API serves', () => {
    const helper =
      /\b(?:apiFetch|request|mutation|foregroundFetch|fetch)\b[^`'"\n]{0,200}?\(\s*([`'"])(\/[^`'"]*)\1/g;
    const missing: string[] = [];
    for (const { file, text } of sources) {
      for (const match of text.matchAll(helper)) {
        let raw = match[2]!;
        // Pembungkus generik (`/api/v1${path}`) hanya berisi awalan; path sebenarnya diperiksa di pemanggilnya.
        if (raw.startsWith('/api/v1${') || raw.startsWith('/api/v1?')) continue;
        raw = raw.startsWith('/api/v1/') ? raw.slice('/api/v1'.length) : raw;
        const base = FILE_BASE[file];
        if (base && !raw.startsWith(base)) raw = `${base}${raw}`;
        if (!/^\/[a-z]/i.test(raw)) continue;
        // Awalan pembungkus (`/x${path}`) bukan path lengkap.
        if (/[A-Za-z]\$\{/.test(raw)) continue;
        const wanted = segmentsOf(raw);
        // Metode diambil dari opsi `method: 'X'` pada panggilan yang sama (bawaan GET).
        const quoteAt = match.index + match[0].length - match[2]!.length - 2;
        const call = callArguments(text, text.lastIndexOf('(', quoteAt));
        const method =
          (
            /method:\s*['"](\w+)['"]/.exec(call)?.[1] ??
            /,\s*['"](GET|POST|PUT|PATCH|DELETE)['"]/.exec(call)?.[1]
          )?.toUpperCase() ?? 'GET';
        if (
          KNOWN_MISSING.some(
            (entry) => raw.startsWith(entry.prefix) && (!entry.method || entry.method === method),
          )
        )
          continue;
        if (!routes.some((route) => route.method === method && segmentsMatch(wanted, route.segments)))
          missing.push(`${method} ${raw}  ← ${file}`);
      }
    }
    expect([...new Set(missing)]).toEqual([]);
  });

  it('documents every known-missing path with a reason', () => {
    for (const entry of KNOWN_MISSING) {
      expect(entry.prefix.startsWith('/')).toBe(true);
      expect(entry.reason.length).toBeGreaterThan(20);
    }
  });
});
