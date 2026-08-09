import { readdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import YAML from 'yaml';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const requireFromApi = createRequire(path.join(root, 'apps/api/package.json'));
const ts = requireFromApi('typescript');
const controllerRoot = path.join(root, 'apps/api/src');
const contractPath = path.join(root, 'docs/technical/openapi-v1.yaml');
const httpDecorators = new Map([
  ['Get', 'get'],
  ['Post', 'post'],
  ['Put', 'put'],
  ['Patch', 'patch'],
  ['Delete', 'delete'],
]);

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? filesBelow(target) : [target];
    }),
  );
  return files.flat();
}

function decoratorCall(node, name) {
  const decorators = ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []) : [];
  for (const decorator of decorators) {
    if (!ts.isCallExpression(decorator.expression)) continue;
    if (!ts.isIdentifier(decorator.expression.expression)) continue;
    if (decorator.expression.expression.text === name) return decorator.expression;
  }
  return null;
}

function literalArgument(call) {
  const argument = call?.arguments[0];
  if (!argument) return '';
  if (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument))
    return argument.text;
  return null;
}

function normalizeRoute(...segments) {
  const joined = segments
    .filter(Boolean)
    .join('/')
    .replaceAll(/\/+/gu, '/')
    .replaceAll(/:([A-Za-z0-9_]+)/gu, '{$1}');
  return `/${joined.replace(/^\/+|\/+$/gu, '')}`;
}

function extractRoutes(file, sourceText) {
  const source = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true);
  const routes = [];
  source.forEachChild((node) => {
    if (!ts.isClassDeclaration(node)) return;
    const controller = decoratorCall(node, 'Controller');
    if (!controller) return;
    const prefix = literalArgument(controller);
    if (prefix === null) throw new Error(`Dynamic @Controller route is unsupported: ${file}`);
    for (const member of node.members) {
      for (const [decoratorName, method] of httpDecorators) {
        const routeDecorator = decoratorCall(member, decoratorName);
        if (!routeDecorator) continue;
        const suffix = literalArgument(routeDecorator);
        if (suffix === null)
          throw new Error(`Dynamic @${decoratorName} route is unsupported: ${file}`);
        routes.push({ method, path: normalizeRoute(prefix, suffix), file });
      }
    }
  });
  return routes;
}

const controllerFiles = (await filesBelow(controllerRoot)).filter((file) =>
  file.endsWith('.controller.ts'),
);
const runtimeRoutes = (
  await Promise.all(
    controllerFiles.map(async (file) => extractRoutes(file, await readFile(file, 'utf8'))),
  )
).flat();
const runtimeKeys = new Set(runtimeRoutes.map((route) => `${route.method} ${route.path}`));

const contract = YAML.parse(await readFile(contractPath, 'utf8'));
const contractOperations = [];
for (const [routePath, pathItem] of Object.entries(contract.paths ?? {})) {
  if (pathItem?.['x-runtime']) continue;
  for (const method of httpDecorators.values()) {
    const operation = pathItem?.[method];
    if (!operation || operation['x-runtime'] === 'operator-cli') continue;
    contractOperations.push({
      method,
      path: normalizeRoute(routePath),
      operationId: operation.operationId ?? '(missing operationId)',
    });
  }
}

const missing = contractOperations.filter(
  (operation) => !runtimeKeys.has(`${operation.method} ${operation.path}`),
);
if (missing.length > 0) {
  console.error('OpenAPI operations without a NestJS runtime route:');
  for (const item of missing)
    console.error(`- ${item.method.toUpperCase()} ${item.path} (${item.operationId})`);
  process.exitCode = 1;
} else {
  console.log(
    `OpenAPI/runtime parity passed: ${contractOperations.length} contract operations have runtime routes.`,
  );
}
