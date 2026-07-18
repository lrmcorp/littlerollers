import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const temporaryRoot = path.join(root, '.generated');
fs.rmSync(temporaryRoot, { recursive: true, force: true });
execFileSync('sh', ['tools/openapi-generator.sh', 'temp'], { cwd: root, stdio: 'inherit' });

const sha = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const list = (directory, extension, ignored = () => false) => {
  const result = new Map();
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.name.endsWith(extension) && !ignored(entry.name))
        result.set(path.relative(directory, absolute), sha(absolute));
    }
  };
  visit(directory);
  return result;
};

const compare = (label, committed, regenerated) => {
  const names = new Set([...committed.keys(), ...regenerated.keys()]);
  const drift = [...names].filter((name) => committed.get(name) !== regenerated.get(name));
  if (drift.length) throw new Error(`${label} generated drift:\n${drift.sort().join('\n')}`);
  console.log(`${label}: ${names.size} generated files match byte-for-byte`);
};

compare(
  'TypeScript',
  list(path.join(root, 'packages/api-client-ts/generated'), '.ts', (name) =>
    name.endsWith('.d.ts'),
  ),
  list(path.join(temporaryRoot, 'typescript'), '.ts', (name) => name.endsWith('.d.ts')),
);
compare(
  'Dart',
  list(path.join(root, 'packages/api-client-dart/lib/generated/client/lib'), '.dart', (name) =>
    name.endsWith('.g.dart'),
  ),
  list(path.join(temporaryRoot, 'dart/lib'), '.dart'),
);
