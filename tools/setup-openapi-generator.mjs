import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const version = '7.15.0';
const expectedSha256 = '4da1a7cdb78c3a43b1eab0648891135e8c3547d2eedba0dd69daf377f865f366';
const root = path.resolve(new URL('..', import.meta.url).pathname);
const directory = path.join(root, '.cache', 'openapi-generator');
const destination = path.join(directory, `openapi-generator-cli-${version}.jar`);
const source = `https://repo1.maven.org/maven2/org/openapitools/openapi-generator-cli/${version}/openapi-generator-cli-${version}.jar`;

const checksum = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');

fs.mkdirSync(directory, { recursive: true });
if (!fs.existsSync(destination) || checksum(destination) !== expectedSha256) {
  fs.rmSync(destination, { force: true });
  console.log(`Mengunduh OpenAPI Generator CLI ${version} ke cache lokal…`);
  execFileSync('curl', ['-fL', '--retry', '3', '-o', destination, source], {
    stdio: 'inherit',
  });
}

const actual = checksum(destination);
if (actual !== expectedSha256) {
  fs.rmSync(destination, { force: true });
  throw new Error(`Checksum OpenAPI Generator tidak cocok: ${actual}`);
}

console.log(`OpenAPI Generator CLI ${version} siap (${actual.slice(0, 12)}…).`);
