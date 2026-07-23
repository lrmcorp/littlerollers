import { execFileSync } from 'node:child_process';
execFileSync(process.execPath, [new URL('./validate-openapi.mjs', import.meta.url).pathname], {
  stdio: 'inherit',
});
console.log(
  'Committed generated clients are synchronized with OpenAPI 1.7.0-draft. Full model regeneration uses the pinned Docker/JAR generator in tools/openapi-generator.sh.',
);
