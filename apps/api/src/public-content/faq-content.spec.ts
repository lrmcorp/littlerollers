import { PolicyService } from '../identity/policy.service';
import { validateFaq } from './faq.validation';
import { PublicContentManagementService } from './public-content-management.service';

const item = (overrides: Record<string, unknown> = {}) => ({
  question: 'Apakah kelas ini cocok untuk pemula?',
  answer: 'Ya, instruktur akan memberi modifikasi gerakan.',
  ...overrides,
});
const owner = {
  sessionId: 's',
  userId: '00000000-0000-4000-8000-000000000100',
  roles: [] as never,
  capabilities: ['public-content:read', 'public-content:manage', 'branch:all'],
  branchIds: [] as string[],
};

describe('validateFaq', () => {
  it('trims and numbers the items in order, generating ids when none is sent', () => {
    const result = validateFaq({
      items: [item({ question: '  Apa itu Reformer?  ', id: 'reformer' }), item({ answer: 'Jawaban singkat.' })],
    });
    expect(result.items.map((entry) => [entry.id, entry.question, entry.order])).toEqual([
      ['reformer', 'Apa itu Reformer?', 1],
      ['faq-2', 'Apakah kelas ini cocok untuk pemula?', 2],
    ]);
  });

  it('keeps line breaks in answers, since the site renders them as plain text', () => {
    const [entry] = validateFaq({ items: [item({ answer: 'Baris satu.\nBaris dua.' })] }).items;
    expect(entry!.answer).toBe('Baris satu.\nBaris dua.');
  });

  it('rejects empty, oversized, too short or malformed content', () => {
    const bad = [
      null,
      [],
      { items: [] },
      { items: 'bukan-array' },
      { items: Array.from({ length: 51 }, () => item()) },
      { items: [null] },
      { items: [item({ question: '' })] },
      { items: [item({ answer: '   ' })] },
      { items: [item({ question: 'Apa?' })] },
      { items: [item({ answer: 'Ya.' })] },
      { items: [item({ question: 'x'.repeat(201) })] },
      { items: [item({ answer: 'x'.repeat(1501) })] },
      { items: [item({ question: 42 })] },
    ];
    for (const payload of bad)
      expect(() => validateFaq(payload)).toThrow(expect.objectContaining({ code: 'VALIDATION_ERROR' }));
    expect(() => validateFaq({ items: Array.from({ length: 50 }, () => item()) })).not.toThrow();
  });
});

describe('PublicContentManagementService with FAQ content', () => {
  const setup = () => {
    const db = {
      publicContent: {
        findFirst: jest.fn().mockResolvedValue(null),
        aggregate: jest.fn().mockResolvedValue({ _max: { version: null } }),
        create: jest.fn().mockImplementation(async ({ data }) => ({
          id: '00000000-0000-4000-8000-000000000011',
          branchId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          publishedAt: null,
          archivedAt: null,
          ...data,
        })),
      },
    };
    return { db, service: new PublicContentManagementService(db as never, new PolicyService()) };
  };

  it('stores a normalized FAQ under the class-detail FAQ key and publishes it', async () => {
    const { service, db } = setup();
    const saved = await service.save(
      owner,
      'faq',
      { payload: { items: [item({ question: '  Apa yang harus dibawa?  ' })] } },
      'c',
    );
    expect(db.publicContent.create.mock.calls[0]![0].data).toMatchObject({
      contentKey: 'CLASS_DETAIL_FAQ',
      kind: 'FAQ',
      scopeKey: 'GLOBAL',
      status: 'PUBLISHED',
      version: 1,
    });
    expect(saved).toMatchObject({ kind: 'FAQ', payload: { items: [{ question: 'Apa yang harus dibawa?' }] } });
  });

  it('refuses invalid FAQ content before saving', async () => {
    const { service, db } = setup();
    await expect(service.save(owner, 'FAQ', { payload: { items: [] } }, 'c')).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    expect(db.publicContent.create).not.toHaveBeenCalled();
  });
});
