import fs from 'node:fs';
import crypto from 'node:crypto';
import YAML from 'yaml';
const file = new URL('../docs/technical/openapi-v1.yaml', import.meta.url);
const raw = fs.readFileSync(file, 'utf8');
const doc = YAML.parse(raw);
const expected = '6ea6cea01bb375d2e00fc236888a10d20983ea6be8c212463701f41e22f14242';
const actual = crypto.createHash('sha256').update(raw).digest('hex');
if (actual !== expected) throw new Error(`OpenAPI checksum drift: ${actual}`);
if (doc.info?.version !== '1.13.0-draft') throw new Error('Unexpected contract version');
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
