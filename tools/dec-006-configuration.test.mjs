import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  compileConfigurationPack,
  configurationPackChecksum,
  validateConfigurationPack,
} from './dec-006-configuration.mjs';

const branchId = '10000000-0000-4000-8000-000000000001';
const classTypeId = '20000000-0000-4000-8000-000000000001';
const instructorId = '30000000-0000-4000-8000-000000000001';
const approval = {
  evidenceReference: 'DEC006-EVIDENCE-001',
  financeApproverId: '40000000-0000-4000-8000-000000000001',
  productOwnerApproverId: '50000000-0000-4000-8000-000000000001',
  approvedAt: '2026-08-09T01:00:00.000Z',
};

const catalog = {
  branches: [branchId],
  classTypes: [classTypeId],
  instructors: [instructorId],
  sourcePackages: ['10'],
  sourceLocations: ['20'],
  sourceClasses: ['30'],
  requiredHistoricalProjectionKeys: ['10:20'],
  requiredHistoricalInstructorKeys: [`30:branch:${branchId}`],
};

const pack = {
  schemaVersion: '1.0.0',
  decisionId: 'DEC-006',
  packId: 'DEC006-R1-001',
  mappingVersion: '2.0.0',
  operational: {
    projectionRates: [
      {
        configurationId: 'CFG-PROJ-001',
        branchId,
        classTypeId,
        rateRp: 100000,
        effectiveFrom: '2026-01-01',
        effectiveUntil: null,
        approval,
      },
    ],
    instructorFees: [
      {
        configurationId: 'CFG-FEE-001',
        branchId,
        classTypeId,
        instructorUserId: instructorId,
        feeRp: 200000,
        effectiveFrom: '2026-01-01',
        effectiveUntil: null,
        approval,
      },
    ],
  },
  historical: {
    projectionRates: [{ sourcePackageId: '10', sourceLocationId: '20', rateRp: 100000, approval }],
    instructorCompensations: [
      { sourceClassId: '30', targetBranchId: branchId, feeRp: 200000, approval },
    ],
  },
};

test('validates a signed DEC-006 pack and compiles migration facts', () => {
  const result = validateConfigurationPack(pack, catalog);
  assert.deepEqual(result.projectionMap, { '10:20': 100000 });
  assert.deepEqual(result.instructorResolutions[0]?.decision, {
    feeRp: 200000,
    approvedEvidence: 'DEC006-EVIDENCE-001',
  });
  assert.match(configurationPackChecksum(pack), /^[a-f0-9]{64}$/u);
  assert.doesNotThrow(() =>
    validateConfigurationPack(pack, { financeConfigurationCatalog: catalog }),
  );
});

test('rejects overlapping effective periods for the same business key', () => {
  const changed = structuredClone(pack);
  changed.operational.projectionRates[0].effectiveUntil = '2026-07-01';
  changed.operational.projectionRates.push({
    ...structuredClone(changed.operational.projectionRates[0]),
    configurationId: 'CFG-PROJ-002',
    effectiveFrom: '2026-06-01',
    effectiveUntil: null,
  });
  assert.throws(
    () => validateConfigurationPack(changed, catalog),
    /PROJECTION_RATE_EFFECTIVE_PERIOD_OVERLAP/u,
  );
});

test('rejects unknown references and incomplete historical coverage', () => {
  const unknown = structuredClone(pack);
  unknown.operational.instructorFees[0].instructorUserId = '30000000-0000-4000-8000-000000000099';
  assert.throws(
    () => validateConfigurationPack(unknown, catalog),
    /INSTRUCTOR_FEE_INSTRUCTOR_UNKNOWN/u,
  );

  const incomplete = structuredClone(pack);
  incomplete.historical.projectionRates = [];
  assert.throws(
    () => validateConfigurationPack(incomplete, catalog),
    /HISTORICAL_PROJECTION_COVERAGE_INCOMPLETE/u,
  );
});

test('rejects fields outside the signed schema', () => {
  const changed = structuredClone(pack);
  changed.operational.projectionRates[0].privatePath = '/tmp/evidence';
  assert.throws(
    () => validateConfigurationPack(changed, catalog),
    /PROJECTION_RATE_FIELDS_INVALID/u,
  );
});

test('requires an explicit fee or notApplicable historical decision', () => {
  const invalid = structuredClone(pack);
  delete invalid.historical.instructorCompensations[0].feeRp;
  assert.throws(
    () => validateConfigurationPack(invalid, catalog),
    /HISTORICAL_INSTRUCTOR_DECISION_INVALID/u,
  );

  invalid.historical.instructorCompensations[0].notApplicable = true;
  assert.doesNotThrow(() => validateConfigurationPack(invalid, catalog));
});

test('compiles a private deterministic rehearsal fragment and checksum manifest', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dd-dec006-'));
  const packPath = join(directory, 'pack.json');
  const catalogPath = join(directory, 'catalog.json');
  const output = join(directory, 'compiled');
  try {
    await Promise.all([
      writeFile(packPath, JSON.stringify(pack), { mode: 0o600 }),
      writeFile(catalogPath, JSON.stringify(catalog), { mode: 0o600 }),
    ]);
    const manifest = await compileConfigurationPack(packPath, catalogPath, output);
    assert.equal(manifest.configurationPackSha256, configurationPackChecksum(pack));
    assert.match(
      await readFile(join(output, 'rehearsal.env.fragment'), 'utf8'),
      /V1_PROJECTION_RATES='\{"10:20":100000\}'/u,
    );
    assert.equal(manifest.files.length, 3);
    const evidence = await Promise.all(
      ['manifest.json', ...manifest.files.map(({ name }) => name)].map((name) =>
        readFile(join(output, name), 'utf8'),
      ),
    );
    expectSafeEvidence(evidence.join('\n'));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

function expectSafeEvidence(value) {
  assert.doesNotMatch(value, /(?:mysql:\/\/|\/Users\/|password|token|privatePath)/iu);
}
