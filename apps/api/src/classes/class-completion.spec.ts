import { classCompletionControlHash } from './slot-kelas.service';

const attended = {
  id: '00000000-0000-4000-8000-000000000001',
  status: 'ATTENDED',
  reservedQuantity: 1,
  reservation: { status: 'ACTIVE', quantity: 1 },
  attendance: { id: '00000000-0000-4000-8000-000000000101' },
};
const waiting = {
  id: '00000000-0000-4000-8000-000000000002',
  status: 'BOOKED',
  reservedQuantity: 1,
  reservation: { status: 'ACTIVE', quantity: 1 },
  attendance: null,
};

test('class completion control hash is stable regardless of query order', () => {
  expect(classCompletionControlHash([attended, waiting])).toBe(
    classCompletionControlHash([waiting, attended]),
  );
});

test('class completion control hash changes when attendance or reservation state changes', () => {
  const baseline = classCompletionControlHash([attended, waiting]);
  expect(
    classCompletionControlHash([
      attended,
      { ...waiting, attendance: { id: '00000000-0000-4000-8000-000000000102' } },
    ]),
  ).not.toBe(baseline);
  expect(
    classCompletionControlHash([
      attended,
      { ...waiting, status: 'CANCELLED' },
    ]),
  ).not.toBe(baseline);
});
