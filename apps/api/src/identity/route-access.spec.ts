/**
 * Jaring pengaman default-deny untuk otorisasi rute (statis, berbasis AST TypeScript).
 *
 * Runtime: AccessGuard (global) mewajibkan sesi untuk semua rute kecuali `@Public()`.
 * Tes ini: setiap handler controller harus punya bukti otorisasi yang terlihat di kode:
 *   1. `@Public()`, `@SelfService()` atau `@Roles(...)` pada handler/kelas, ATAU
 *   2. handler / service yang dipanggilnya (sampai 4 lompatan, termasuk helper privat dan
 *      service turunan) memanggil `policy.require*`/`hasCapability`/`capabilityBranchScope`.
 * Pemeriksaan langsung `principal.capabilities.includes(...)` juga diterima. `principal.userId` saja BUKAN bukti; rute yang hanya membatasi ke pemilik data harus
 * menyatakannya lewat `@SelfService()`.
 *
 * Batasan: ini pemeriksaan keberadaan, bukan bukti kebenaran semantik. Tinjauan manual
 * atas `@SelfService()` dan `@Public()` tetap diperlukan.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';

const SRC = path.resolve(__dirname, '..');
const HTTP_VERBS = new Set(['Get', 'Post', 'Put', 'Patch', 'Delete']);
const EVIDENCE =
  /\b(?:requireCapability|requireAnyCapability|requireGlobalCapability|requireCustomerSelf|requireBranchScope|hasCapability|capabilityBranchScope)\b|\bcapabilities\.(?:includes|some|every)\(/;

interface ClassInfo {
  name: string;
  file: string;
  members: Map<string, string>;
  deps: Map<string, string>;
}

function walk(dir: string, out: string[] = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) out.push(full);
  }
  return out;
}

const decoratorsOf = (node: ts.Node) =>
  (ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []) : []).map((decorator) => {
    const expression = decorator.expression;
    return ts.isCallExpression(expression)
      ? { name: expression.expression.getText(), args: expression.arguments.map((a) => a.getText()) }
      : { name: expression.getText(), args: [] as string[] };
  });

function parse(file: string) {
  return ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.ES2022, true);
}

function classInfo(node: ts.ClassDeclaration, file: string): ClassInfo {
  const members = new Map<string, string>();
  const deps = new Map<string, string>();
  for (const member of node.members) {
    if (ts.isConstructorDeclaration(member)) {
      for (const parameter of member.parameters) {
        if (ts.isIdentifier(parameter.name) && parameter.type)
          deps.set(parameter.name.text, parameter.type.getText());
      }
    } else if (
      (ts.isMethodDeclaration(member) || ts.isPropertyDeclaration(member)) &&
      ts.isIdentifier(member.name)
    ) {
      members.set(member.name.text, member.getText());
    }
  }
  return { name: node.name?.text ?? '', file, members, deps };
}

const classes = new Map<string, ClassInfo>();
const controllers: Array<{
  file: string;
  info: ClassInfo;
  node: ts.ClassDeclaration;
}> = [];

for (const file of walk(SRC)) {
  const source = parse(file);
  source.forEachChild((node) => {
    if (!ts.isClassDeclaration(node) || !node.name) return;
    const info = classInfo(node, path.relative(SRC, file));
    classes.set(info.name, info);
    if (decoratorsOf(node).some((d) => d.name === 'Controller'))
      controllers.push({ file: info.file, info, node });
  });
}

const selfCalls = (text: string) =>
  [...text.matchAll(/this\.(\w+)\(/g)].map((m) => m[1] as string);
const depCalls = (text: string) =>
  [...text.matchAll(/this\.(\w+)\.(\w+)\(/g)].map((m) => [m[1], m[2]] as [string, string]);
const depType = (info: ClassInfo, prop: string) => info.deps.get(prop)?.replace(/<.*$/, '');

function hasEvidence(
  className: string,
  method: string,
  depth = 4,
  seen = new Set<string>(),
): boolean {
  const key = `${className}.${method}`;
  const info = classes.get(className);
  const text = info?.members.get(method);
  if (!info || !text || depth < 0 || seen.has(key)) return false;
  seen.add(key);
  if (EVIDENCE.test(text)) return true;
  for (const next of selfCalls(text)) {
    if (hasEvidence(className, next, depth - 1, seen)) return true;
  }
  for (const [prop, next] of depCalls(text)) {
    const dep = depType(info, prop);
    if (dep && hasEvidence(dep, next, depth - 1, seen)) return true;
  }
  return false;
}

interface Handler {
  route: string;
  kind: 'public' | 'self-service' | 'roles' | 'capability' | 'none';
  authGuarded: boolean;
}

function handlers(): Handler[] {
  const result: Handler[] = [];
  for (const { file, info, node } of controllers) {
    const classDecorators = decoratorsOf(node);
    const classGuard = classDecorators.some(
      (d) => d.name === 'UseGuards' && d.args.some((a) => a.includes('AuthGuard')),
    );
    for (const member of node.members) {
      if (!ts.isMethodDeclaration(member) || !ts.isIdentifier(member.name)) continue;
      const own = decoratorsOf(member);
      const verb = own.find((d) => HTTP_VERBS.has(d.name));
      if (!verb) continue;
      const all = [...classDecorators, ...own];
      const names = new Set(all.map((d) => d.name));
      const body = member.getText();
      const authGuarded =
        classGuard ||
        own.some((d) => d.name === 'UseGuards' && d.args.some((a) => a.includes('AuthGuard')));

      let kind: Handler['kind'] = 'none';
      if (names.has('Public')) kind = 'public';
      else if (names.has('SelfService')) kind = 'self-service';
      else if (names.has('Roles')) kind = 'roles';
      else if (EVIDENCE.test(body)) kind = 'capability';
      else {
        if (
          depCalls(body).some(([prop, method]) => {
            const dep = depType(info, prop);
            return dep ? hasEvidence(dep, method) : false;
          })
        )
          kind = 'capability';
      }
      result.push({
        route: `${file} ${info.name}.${member.name.text} [${verb.name} ${verb.args[0] ?? ''}]`,
        kind,
        authGuarded,
      });
    }
  }
  return result;
}

describe('route access declarations (default-deny)', () => {
  const all = handlers();

  it('discovers the controllers and handlers it is supposed to guard', () => {
    expect(controllers.length).toBeGreaterThanOrEqual(25);
    expect(all.length).toBeGreaterThanOrEqual(200);
  });

  it('every handler declares its access or authorizes through the policy service', () => {
    const missing = all.filter((h) => h.kind === 'none').map((h) => h.route);
    expect(missing).toEqual([]);
  });

  it('a route without @UseGuards(AuthGuard) must be an explicit @Public() route', () => {
    const anonymousByOmission = all
      .filter((h) => !h.authGuarded && h.kind !== 'public')
      .map((h) => h.route);
    expect(anonymousByOmission).toEqual([]);
  });

  it('a @Public() route never also claims capability or self-service access', () => {
    const contradictory = all
      .filter((h) => h.kind === 'public' && h.authGuarded)
      .map((h) => h.route);
    expect(contradictory).toEqual([]);
  });
});
