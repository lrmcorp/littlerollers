import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, isAbsolute, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/u;
const SAFE_EVIDENCE = /^[A-Za-z0-9][A-Za-z0-9_.:/-]{2,239}$/u;
const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/u;

function fail(code, detail) {
  const error = new Error(code);
  error.code = code;
  error.detail = detail;
  throw error;
}

function object(value, code) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(code);
  return value;
}

function onlyKeys(value, allowed, code) {
  const extras = Object.keys(value).filter((key) => !allowed.includes(key));
  if (extras.length) fail(code, extras.join(','));
}

function array(value, code) {
  if (!Array.isArray(value)) fail(code);
  return value;
}

function string(value, code, pattern = SAFE_ID) {
  if (typeof value !== 'string' || !pattern.test(value)) fail(code);
  return value;
}

function integerRp(value, code) {
  if (!Number.isSafeInteger(value) || value < 0) fail(code);
  return value;
}

function isoDate(value, code) {
  string(value, code, ISO_DATE);
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) fail(code);
  return value;
}

function approval(value, prefix) {
  const item = object(value, `${prefix}_APPROVAL_REQUIRED`);
  onlyKeys(
    item,
    ['evidenceReference', 'financeApproverId', 'productOwnerApproverId', 'approvedAt'],
    `${prefix}_APPROVAL_FIELDS_INVALID`,
  );
  string(item.evidenceReference, `${prefix}_EVIDENCE_REFERENCE_INVALID`, SAFE_EVIDENCE);
  if (/^[A-Za-z]:[\\/]/u.test(item.evidenceReference) || item.evidenceReference.includes('://'))
    fail(`${prefix}_EVIDENCE_REFERENCE_INVALID`);
  string(item.financeApproverId, `${prefix}_FINANCE_APPROVER_INVALID`, UUID);
  string(item.productOwnerApproverId, `${prefix}_PRODUCT_OWNER_APPROVER_INVALID`, UUID);
  if (
    typeof item.approvedAt !== 'string' ||
    Number.isNaN(new Date(item.approvedAt).getTime()) ||
    !item.approvedAt.endsWith('Z')
  )
    fail(`${prefix}_APPROVED_AT_INVALID`);
  return item;
}

function effective(row, prefix) {
  string(row.configurationId, `${prefix}_CONFIGURATION_ID_INVALID`, /^CFG-[A-Z0-9_.-]{3,60}$/u);
  string(row.branchId, `${prefix}_BRANCH_ID_INVALID`, UUID);
  string(row.classTypeId, `${prefix}_CLASS_TYPE_ID_INVALID`, UUID);
  isoDate(row.effectiveFrom, `${prefix}_EFFECTIVE_FROM_INVALID`);
  if (row.effectiveUntil !== undefined && row.effectiveUntil !== null) {
    isoDate(row.effectiveUntil, `${prefix}_EFFECTIVE_UNTIL_INVALID`);
    if (row.effectiveUntil <= row.effectiveFrom) fail(`${prefix}_EFFECTIVE_PERIOD_INVALID`);
  }
  approval(row.approval, prefix);
}

function setOf(catalog, key) {
  return new Set(array(catalog[key], `CATALOG_${key.toUpperCase()}_REQUIRED`).map(String));
}

function requireReference(set, value, code) {
  if (!set.has(value)) fail(code, value);
}

function assertNoOverlap(rows, keyOf, prefix) {
  const grouped = new Map();
  for (const row of rows) {
    const key = keyOf(row);
    const current = grouped.get(key) ?? [];
    current.push(row);
    grouped.set(key, current);
  }
  for (const [key, items] of grouped) {
    items.sort((left, right) => left.effectiveFrom.localeCompare(right.effectiveFrom));
    for (let index = 1; index < items.length; index += 1) {
      const previous = items[index - 1];
      if (previous.effectiveUntil === null || previous.effectiveUntil === undefined)
        fail(`${prefix}_EFFECTIVE_PERIOD_OVERLAP`, key);
      if (previous.effectiveUntil > items[index].effectiveFrom)
        fail(`${prefix}_EFFECTIVE_PERIOD_OVERLAP`, key);
    }
  }
}

export function validateConfigurationPack(packInput, catalogInput) {
  const pack = object(packInput, 'CONFIGURATION_PACK_INVALID');
  const catalogDocument = object(catalogInput, 'CONFIGURATION_CATALOG_INVALID');
  const catalog = object(
    catalogDocument.financeConfigurationCatalog ?? catalogDocument,
    'CONFIGURATION_CATALOG_INVALID',
  );
  if (pack.schemaVersion !== '1.0.0') fail('CONFIGURATION_PACK_SCHEMA_VERSION_INVALID');
  onlyKeys(
    pack,
    ['schemaVersion', 'decisionId', 'packId', 'mappingVersion', 'operational', 'historical'],
    'CONFIGURATION_PACK_FIELDS_INVALID',
  );
  if (pack.decisionId !== 'DEC-006') fail('CONFIGURATION_PACK_DECISION_INVALID');
  string(pack.packId, 'CONFIGURATION_PACK_ID_INVALID');
  if (pack.mappingVersion !== '2.0.0') fail('CONFIGURATION_PACK_MAPPING_VERSION_INVALID');

  const branches = setOf(catalog, 'branches');
  const classTypes = setOf(catalog, 'classTypes');
  const instructors = setOf(catalog, 'instructors');
  const sourcePackages = setOf(catalog, 'sourcePackages');
  const sourceLocations = setOf(catalog, 'sourceLocations');
  const sourceClasses = setOf(catalog, 'sourceClasses');
  const requiredProjectionKeys = setOf(catalog, 'requiredHistoricalProjectionKeys');
  const requiredInstructorKeys = setOf(catalog, 'requiredHistoricalInstructorKeys');

  const operational = object(pack.operational, 'CONFIGURATION_PACK_OPERATIONAL_REQUIRED');
  onlyKeys(
    operational,
    ['projectionRates', 'instructorFees'],
    'CONFIGURATION_PACK_OPERATIONAL_FIELDS_INVALID',
  );
  const projections = array(
    operational.projectionRates,
    'CONFIGURATION_PACK_PROJECTION_RATES_REQUIRED',
  );
  const instructorFees = array(
    operational.instructorFees,
    'CONFIGURATION_PACK_INSTRUCTOR_FEES_REQUIRED',
  );
  const historical = object(pack.historical, 'CONFIGURATION_PACK_HISTORICAL_REQUIRED');
  onlyKeys(
    historical,
    ['projectionRates', 'instructorCompensations'],
    'CONFIGURATION_PACK_HISTORICAL_FIELDS_INVALID',
  );
  const historicalProjections = array(
    historical.projectionRates,
    'CONFIGURATION_PACK_HISTORICAL_PROJECTIONS_REQUIRED',
  );
  const historicalInstructors = array(
    historical.instructorCompensations,
    'CONFIGURATION_PACK_HISTORICAL_INSTRUCTORS_REQUIRED',
  );

  const configurationIds = new Set();
  for (const row of projections) {
    onlyKeys(
      row,
      [
        'configurationId',
        'branchId',
        'classTypeId',
        'rateRp',
        'effectiveFrom',
        'effectiveUntil',
        'approval',
      ],
      'PROJECTION_RATE_FIELDS_INVALID',
    );
    effective(row, 'PROJECTION_RATE');
    integerRp(row.rateRp, 'PROJECTION_RATE_RUPIAH_INVALID');
    requireReference(branches, row.branchId, 'PROJECTION_RATE_BRANCH_UNKNOWN');
    requireReference(classTypes, row.classTypeId, 'PROJECTION_RATE_CLASS_TYPE_UNKNOWN');
    if (configurationIds.has(row.configurationId)) fail('CONFIGURATION_ID_DUPLICATE');
    configurationIds.add(row.configurationId);
  }
  for (const row of instructorFees) {
    onlyKeys(
      row,
      [
        'configurationId',
        'branchId',
        'classTypeId',
        'instructorUserId',
        'feeRp',
        'effectiveFrom',
        'effectiveUntil',
        'approval',
      ],
      'INSTRUCTOR_FEE_FIELDS_INVALID',
    );
    effective(row, 'INSTRUCTOR_FEE');
    string(row.instructorUserId, 'INSTRUCTOR_FEE_USER_ID_INVALID', UUID);
    integerRp(row.feeRp, 'INSTRUCTOR_FEE_RUPIAH_INVALID');
    requireReference(branches, row.branchId, 'INSTRUCTOR_FEE_BRANCH_UNKNOWN');
    requireReference(classTypes, row.classTypeId, 'INSTRUCTOR_FEE_CLASS_TYPE_UNKNOWN');
    requireReference(instructors, row.instructorUserId, 'INSTRUCTOR_FEE_INSTRUCTOR_UNKNOWN');
    if (configurationIds.has(row.configurationId)) fail('CONFIGURATION_ID_DUPLICATE');
    configurationIds.add(row.configurationId);
  }
  assertNoOverlap(projections, (row) => `${row.branchId}:${row.classTypeId}`, 'PROJECTION_RATE');
  assertNoOverlap(
    instructorFees,
    (row) => `${row.branchId}:${row.classTypeId}:${row.instructorUserId}`,
    'INSTRUCTOR_FEE',
  );

  const projectionMap = {};
  for (const row of historicalProjections) {
    onlyKeys(
      row,
      ['sourcePackageId', 'sourceLocationId', 'rateRp', 'approval'],
      'HISTORICAL_PROJECTION_FIELDS_INVALID',
    );
    string(String(row.sourcePackageId), 'HISTORICAL_PROJECTION_PACKAGE_ID_INVALID');
    string(String(row.sourceLocationId), 'HISTORICAL_PROJECTION_LOCATION_ID_INVALID');
    integerRp(row.rateRp, 'HISTORICAL_PROJECTION_RUPIAH_INVALID');
    approval(row.approval, 'HISTORICAL_PROJECTION');
    requireReference(sourcePackages, String(row.sourcePackageId), 'HISTORICAL_PACKAGE_UNKNOWN');
    requireReference(sourceLocations, String(row.sourceLocationId), 'HISTORICAL_LOCATION_UNKNOWN');
    const key = `${row.sourcePackageId}:${row.sourceLocationId}`;
    if (Object.hasOwn(projectionMap, key)) fail('HISTORICAL_PROJECTION_DUPLICATE', key);
    projectionMap[key] = row.rateRp;
  }

  const instructorResolutions = [];
  const instructorKeys = new Set();
  for (const row of historicalInstructors) {
    onlyKeys(
      row,
      ['sourceClassId', 'targetBranchId', 'feeRp', 'notApplicable', 'approval'],
      'HISTORICAL_INSTRUCTOR_FIELDS_INVALID',
    );
    string(String(row.sourceClassId), 'HISTORICAL_INSTRUCTOR_CLASS_ID_INVALID');
    string(row.targetBranchId, 'HISTORICAL_INSTRUCTOR_BRANCH_ID_INVALID', UUID);
    approval(row.approval, 'HISTORICAL_INSTRUCTOR');
    requireReference(sourceClasses, String(row.sourceClassId), 'HISTORICAL_CLASS_UNKNOWN');
    requireReference(branches, row.targetBranchId, 'HISTORICAL_INSTRUCTOR_BRANCH_UNKNOWN');
    const hasFee = row.feeRp !== undefined;
    if (hasFee === (row.notApplicable === true)) fail('HISTORICAL_INSTRUCTOR_DECISION_INVALID');
    if (hasFee) integerRp(row.feeRp, 'HISTORICAL_INSTRUCTOR_RUPIAH_INVALID');
    const key = `${row.sourceClassId}:branch:${row.targetBranchId}`;
    if (instructorKeys.has(key)) fail('HISTORICAL_INSTRUCTOR_DUPLICATE', key);
    instructorKeys.add(key);
    instructorResolutions.push({
      sourceTable: 'kelas',
      sourceId: key,
      reasonCode: 'INSTRUCTOR_COMPENSATION_MAPPING_REQUIRED',
      decision: hasFee
        ? { feeRp: row.feeRp, approvedEvidence: row.approval.evidenceReference }
        : { notApplicable: true, approvedEvidence: row.approval.evidenceReference },
    });
  }

  const missingProjectionKeys = [...requiredProjectionKeys].filter(
    (key) => !Object.hasOwn(projectionMap, key),
  );
  const missingInstructorKeys = [...requiredInstructorKeys].filter(
    (key) => !instructorKeys.has(key),
  );
  if (missingProjectionKeys.length) fail('HISTORICAL_PROJECTION_COVERAGE_INCOMPLETE');
  if (missingInstructorKeys.length) fail('HISTORICAL_INSTRUCTOR_COVERAGE_INCOMPLETE');

  return {
    pack,
    projectionMap,
    instructorResolutions,
    coverage: {
      operationalProjectionRates: projections.length,
      operationalInstructorFees: instructorFees.length,
      historicalProjectionRates: historicalProjections.length,
      historicalInstructorCompensations: historicalInstructors.length,
      missingProjectionKeys: [],
      missingInstructorKeys: [],
    },
  };
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object')
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`)
      .join(',')}}`;
  return JSON.stringify(value);
}

export function configurationPackChecksum(pack) {
  return createHash('sha256').update(canonicalJson(pack)).digest('hex');
}

async function sha256File(path) {
  const hash = createHash('sha256');
  await new Promise((resolveHash, rejectHash) => {
    const stream = createReadStream(path);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', rejectHash);
    stream.on('end', resolveHash);
  });
  return hash.digest('hex');
}

function parseArguments(argv) {
  const result = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) result._.push(token);
    else {
      const next = argv[index + 1];
      if (!next || next.startsWith('--')) result[token.slice(2)] = true;
      else {
        result[token.slice(2)] = next;
        index += 1;
      }
    }
  }
  return result;
}

async function loadAbsoluteJson(path, code) {
  if (typeof path !== 'string' || !isAbsolute(path)) fail(code);
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writePrivate(path, value) {
  await writeFile(path, typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`, {
    mode: 0o600,
    flag: 'wx',
  });
  await chmod(path, 0o600);
}

async function loadCompiledConfiguration(directory) {
  if (typeof directory !== 'string' || !isAbsolute(directory)) fail('COMPILED_CONFIG_REQUIRED');
  const manifest = JSON.parse(await readFile(join(directory, 'manifest.json'), 'utf8'));
  if (manifest.decisionId !== 'DEC-006' || manifest.mappingVersion !== '2.0.0')
    fail('COMPILED_CONFIG_MANIFEST_INVALID');
  for (const file of manifest.files ?? []) {
    if (!/^[A-Za-z0-9_.-]{1,100}$/u.test(file.name)) fail('COMPILED_CONFIG_MANIFEST_INVALID');
    if ((await sha256File(join(directory, file.name))) !== file.sha256)
      fail('COMPILED_CONFIG_CHECKSUM_MISMATCH');
  }
  const commands = JSON.parse(
    await readFile(join(directory, 'operational-api-commands.json'), 'utf8'),
  );
  return { manifest, commands: array(commands, 'COMPILED_CONFIG_COMMANDS_INVALID') };
}

async function applyCompiledConfiguration(directory, apiBase) {
  const token = process.env.DD_DEC006_API_TOKEN?.trim();
  if (!token) fail('DD_DEC006_API_TOKEN_REQUIRED');
  let base;
  try {
    base = new URL(apiBase);
  } catch {
    fail('DEC006_API_BASE_INVALID');
  }
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search)
    fail('DEC006_API_BASE_INVALID');
  const { manifest, commands } = await loadCompiledConfiguration(directory);
  const results = [];
  for (const [index, command] of commands.entries()) {
    if (
      !['/api/v1/projection-rates', '/api/v1/instructor-fees'].includes(command.endpoint) ||
      typeof command.idempotencyKey !== 'string'
    )
      fail('COMPILED_CONFIG_COMMAND_INVALID');
    const response = await fetch(new URL(command.endpoint, base), {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        'idempotency-key': command.idempotencyKey,
        'x-correlation-id': `dec006-${manifest.packId}-${String(index + 1).padStart(4, '0')}`,
      },
      body: JSON.stringify(command.body),
    });
    if (!response.ok) fail('DEC006_API_APPLY_FAILED', `${command.endpoint}:${response.status}`);
    results.push({ endpoint: command.endpoint, status: response.status });
  }
  return { packId: manifest.packId, checksum: manifest.configurationPackSha256, results };
}

export async function compileConfigurationPack(packPath, catalogPath, output) {
  if (
    ![packPath, catalogPath, output].every((item) => typeof item === 'string' && isAbsolute(item))
  )
    fail('ABSOLUTE_PATH_REQUIRED');
  const pack = await loadAbsoluteJson(packPath, 'CONFIGURATION_PACK_PATH_REQUIRED');
  const catalog = await loadAbsoluteJson(catalogPath, 'CONFIGURATION_CATALOG_PATH_REQUIRED');
  const validated = validateConfigurationPack(pack, catalog);
  const checksum = configurationPackChecksum(pack);
  await mkdir(output, { recursive: false, mode: 0o700 });
  const operational = [
    ...pack.operational.projectionRates.map((row) => ({
      endpoint: '/api/v1/projection-rates',
      idempotencyKey: `${pack.packId}:${row.configurationId}`,
      body: {
        kind: 'PROJECTION_RATE',
        branchId: row.branchId,
        classTypeId: row.classTypeId,
        rateRp: row.rateRp,
        effectiveFrom: row.effectiveFrom,
        effectiveUntil: row.effectiveUntil ?? null,
        reason: `DEC-006 ${row.configurationId}`,
        approvedEvidence: row.approval.evidenceReference,
        approval: row.approval,
        configurationPackChecksum: checksum,
      },
    })),
    ...pack.operational.instructorFees.map((row) => ({
      endpoint: '/api/v1/instructor-fees',
      idempotencyKey: `${pack.packId}:${row.configurationId}`,
      body: {
        kind: 'INSTRUCTOR_FEE',
        branchId: row.branchId,
        classTypeId: row.classTypeId,
        instructorUserId: row.instructorUserId,
        feeRp: row.feeRp,
        effectiveFrom: row.effectiveFrom,
        effectiveUntil: row.effectiveUntil ?? null,
        reason: `DEC-006 ${row.configurationId}`,
        approvedEvidence: row.approval.evidenceReference,
        approval: row.approval,
        configurationPackChecksum: checksum,
      },
    })),
  ];
  const evidenceReference = `DEC-006:${pack.packId}:${checksum}`;
  const fragment = [
    `V1_DEC006_CONFIGURATION_PACK_SHA256=${checksum}`,
    `V1_PROJECTION_RATES='${JSON.stringify(validated.projectionMap)}'`,
    `V1_PROJECTION_RATE_EVIDENCE=${evidenceReference}`,
    '',
  ].join('\n');
  await writePrivate(join(output, 'operational-api-commands.json'), operational);
  await writePrivate(
    join(output, 'historical-instructor-resolutions.json'),
    validated.instructorResolutions,
  );
  await writePrivate(join(output, 'rehearsal.env.fragment'), fragment);
  const files = await Promise.all(
    [
      'operational-api-commands.json',
      'historical-instructor-resolutions.json',
      'rehearsal.env.fragment',
    ].map(async (name) => ({ name, sha256: await sha256File(join(output, name)) })),
  );
  const manifest = {
    schemaVersion: 1,
    decisionId: 'DEC-006',
    packId: pack.packId,
    mappingVersion: pack.mappingVersion,
    sourcePackName: basename(packPath),
    configurationPackSha256: checksum,
    coverage: validated.coverage,
    files,
  };
  await writePrivate(join(output, 'manifest.json'), manifest);
  return manifest;
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  const command = args._[0];
  if (!['validate', 'compile', 'apply'].includes(command)) fail('UNKNOWN_DEC006_COMMAND');
  if (command === 'apply') {
    const applied = await applyCompiledConfiguration(args.compiled, args['api-base']);
    console.log(
      JSON.stringify({
        applied: true,
        packId: applied.packId,
        checksum: applied.checksum,
        commands: applied.results.length,
      }),
    );
    return;
  }
  const pack = await loadAbsoluteJson(args.pack, 'CONFIGURATION_PACK_PATH_REQUIRED');
  const catalog = await loadAbsoluteJson(args.catalog, 'CONFIGURATION_CATALOG_PATH_REQUIRED');
  const validated = validateConfigurationPack(pack, catalog);
  if (command === 'validate') {
    console.log(
      JSON.stringify({
        valid: true,
        packId: pack.packId,
        checksum: configurationPackChecksum(pack),
        coverage: validated.coverage,
      }),
    );
    return;
  }
  const manifest = await compileConfigurationPack(args.pack, args.catalog, args.output);
  console.log(JSON.stringify({ valid: true, ...manifest }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
  main().catch((error) => {
    console.error(JSON.stringify({ valid: false, code: error.code ?? error.message }));
    process.exitCode = 1;
  });
