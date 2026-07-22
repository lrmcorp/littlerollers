import fs from 'node:fs';
import crypto from 'node:crypto';
import YAML from 'yaml';
const file = new URL('../docs/technical/openapi-v1.yaml', import.meta.url);
const raw = fs.readFileSync(file, 'utf8');
const doc = YAML.parse(raw);
const expected = '9967fa3dedb7d37611ea5939b7eba5dbbfda61ceb47a3ea16ebe8eab9794f41e';
const actual = crypto.createHash('sha256').update(raw).digest('hex');
if (actual !== expected) throw new Error(`OpenAPI checksum drift: ${actual}`);
if (doc.info?.version !== '1.3.0-draft') throw new Error('Unexpected contract version');
const ids = [];
for (const item of Object.values(doc.paths ?? {}))
  for (const method of ['get', 'post', 'put', 'patch', 'delete'])
    if (item[method]?.operationId) ids.push(item[method].operationId);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate operationId');
const refs = [...raw.matchAll(/\$ref:\s*['"]?#\/components\/([A-Za-z]+)\/([A-Za-z0-9_-]+)/g)];
for (const [, kind, name] of refs)
  if (!doc.components?.[kind]?.[name]) throw new Error(`Missing ref ${kind}/${name}`);
console.log(
  JSON.stringify({
    version: doc.info.version,
    checksum: actual,
    operations: ids.length,
    refs: refs.length,
  }),
);
