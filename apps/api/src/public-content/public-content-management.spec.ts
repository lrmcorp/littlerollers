import { PolicyService } from '../identity/policy.service';
import { validateHeroCarousel } from './hero-carousel.validation';
import { PublicContentManagementService } from './public-content-management.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const contentId = id(10);

const principalFor = (capabilities: string[], branchIds: string[] = []) => ({
  sessionId: 's',
  userId: id(100),
  roles: [] as never,
  capabilities,
  branchIds,
});
const owner = principalFor(['public-content:read', 'public-content:manage', 'branch:all']);
const branchStaff = principalFor(['public-content:read', 'public-content:manage'], [id(1)]);

const slide = (overrides: Record<string, unknown> = {}) => ({
  id: 's1',
  title: 'Stronger Body',
  description: 'Deskripsi slide',
  imageSrc: '/images/public/landing/hero-pilates.png',
  primaryCta: { label: 'Lihat Jadwal', href: '/classes' },
  active: true,
  ...overrides,
});
const hero = (overrides: Record<string, unknown> = {}) => ({
  autoplay: true,
  intervalMs: 6000,
  slides: [slide()],
  ...overrides,
});

describe('validateHeroCarousel', () => {
  it('normalizes a valid payload and numbers the slides in order', () => {
    const result = validateHeroCarousel(
      hero({ slides: [slide({ title: '  Satu  ' }), slide({ id: undefined, title: 'Dua' })] }),
    );
    expect(result.slides.map((item) => [item.id, item.title, item.order])).toEqual([
      ['s1', 'Satu', 1],
      ['slide-2', 'Dua', 2],
    ]);
    expect(result).toMatchObject({ autoplay: true, intervalMs: 6000 });
  });

  it('rejects unsafe links, missing text and out-of-range settings', () => {
    const bad = [
      hero({ slides: [slide({ imageSrc: 'javascript:alert(1)' })] }),
      hero({ slides: [slide({ imageSrc: '//evil.example/x.png' })] }),
      hero({ slides: [slide({ imageSrc: 'http://insecure.example/x.png' })] }),
      hero({ slides: [slide({ primaryCta: { label: 'Klik', href: 'data:text/html,x' } })] }),
      hero({ slides: [slide({ primaryCta: { label: '', href: '/classes' } })] }),
      hero({ slides: [slide({ title: '' })] }),
      hero({ slides: [slide({ title: 'x'.repeat(121) })] }),
      hero({ slides: [slide({ description: 'x'.repeat(401) })] }),
      hero({ intervalMs: 500 }),
      hero({ intervalMs: 60000 }),
      hero({ autoplay: 'ya' }),
      hero({ slides: Array.from({ length: 11 }, () => slide()) }),
      hero({ slides: 'bukan-array' }),
      null,
    ];
    for (const payload of bad)
      expect(() => validateHeroCarousel(payload)).toThrow(
        expect.objectContaining({ code: 'VALIDATION_ERROR' }),
      );
  });

  it('accepts https and relative links and an empty slide list', () => {
    expect(() =>
      validateHeroCarousel(
        hero({
          slides: [
            slide({ imageSrc: 'https://cdn.example/x.png', primaryCta: { label: 'A', href: 'https://x.example/y' } }),
          ],
        }),
      ),
    ).not.toThrow();
    expect(validateHeroCarousel(hero({ slides: [] })).slides).toEqual([]);
  });
});

function setup(row: Record<string, unknown> | null = null) {
  const stored = {
    id: contentId,
    contentKey: 'HOME_HERO_CAROUSEL',
    scopeKey: 'GLOBAL',
    branchId: null,
    kind: 'HERO_CAROUSEL',
    locale: 'id-ID',
    version: 3,
    status: 'DRAFT',
    payload: hero(),
    createdById: id(100),
    publishedAt: null,
    archivedAt: null,
    createdAt: new Date('2026-09-01T00:00:00Z'),
    updatedAt: new Date('2026-09-01T00:00:00Z'),
    ...row,
  };
  const tx = { publicContent: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) } };
  const db = {
    publicContent: {
      findMany: jest.fn().mockResolvedValue([stored]),
      findUnique: jest.fn().mockResolvedValue(stored),
      aggregate: jest.fn().mockResolvedValue({ _max: { version: 3 } }),
      create: jest.fn().mockImplementation(async ({ data }) => ({ ...stored, ...data, id: id(11) })),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
  };
  const service = new PublicContentManagementService(db as never, new PolicyService());
  return { service, db, tx };
}

describe('PublicContentManagementService', () => {
  it('requires the read and manage capabilities', async () => {
    const { service } = setup();
    const nobody = principalFor([]);
    await expect(service.list(nobody, {})).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(
      service.create(nobody, { kind: 'HERO_CAROUSEL', payload: hero() }, 'c'),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.transition(nobody, contentId, 'PUBLISHED', 'c')).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('only lets branch:all holders change global content, and hides everything else from branch staff', async () => {
    const { service, db } = setup();
    await expect(
      service.create(branchStaff, { kind: 'HERO_CAROUSEL', payload: hero() }, 'c'),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(service.transition(branchStaff, contentId, 'PUBLISHED', 'c')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    expect(db.publicContent.create).not.toHaveBeenCalled();
    await service.list(branchStaff, {});
    expect(JSON.stringify(db.publicContent.findMany.mock.calls[0]![0].where)).toContain('"in":["' + id(1) + '"]');
  });

  it('refuses kinds the public site does not read and branch-scoped hero content', async () => {
    const { service, db } = setup();
    await expect(
      service.create(owner, { kind: 'BANNER', payload: { items: [] } }, 'c'),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.create(owner, { kind: 'HERO_CAROUSEL', contentKey: 'FOOTER_NOTICE', payload: hero() }, 'c'),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.create(owner, { kind: 'HERO_CAROUSEL', branchId: id(1), payload: hero() }, 'c'),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.create(owner, { kind: 'HERO_CAROUSEL', payload: hero({ slides: [slide({ imageSrc: 'javascript:x' })] }) }, 'c'),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(db.publicContent.create).not.toHaveBeenCalled();
  });

  it('creates the next draft version with the normalized payload', async () => {
    const { service, db } = setup();
    const created = await service.create(owner, { kind: 'hero_carousel', payload: hero() }, 'c');
    expect(db.publicContent.create.mock.calls[0]![0].data).toMatchObject({
      contentKey: 'HOME_HERO_CAROUSEL',
      scopeKey: 'GLOBAL',
      version: 4,
      status: 'DRAFT',
      createdById: owner.userId,
    });
    expect(created).toMatchObject({ status: 'DRAFT', version: 4 });
  });

  it('edits only drafts and duplicates any version into a new draft', async () => {
    const { service, db } = setup();
    await service.updateDraft(owner, contentId, { payload: hero({ intervalMs: 8000 }) }, 'c');
    expect(db.publicContent.updateMany.mock.calls[0]![0].where).toEqual({ id: contentId, status: 'DRAFT' });
    db.publicContent.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.updateDraft(owner, contentId, { payload: hero() }, 'c'),
    ).rejects.toMatchObject({ code: 'INVALID_STATE' });
    await service.duplicate(owner, contentId, 'c');
    expect(db.publicContent.create.mock.calls[0]![0].data).toMatchObject({ version: 4, status: 'DRAFT' });
  });

  it('publishing archives the previously published version of the same key in one transaction', async () => {
    const { service, tx } = setup();
    await service.transition(owner, contentId, 'PUBLISHED', 'c');
    expect(tx.publicContent.updateMany).toHaveBeenNthCalledWith(1, {
      where: { id: contentId, status: 'DRAFT' },
      data: { status: 'PUBLISHED', publishedAt: expect.any(Date) },
    });
    expect(tx.publicContent.updateMany).toHaveBeenNthCalledWith(2, {
      where: expect.objectContaining({
        contentKey: 'HOME_HERO_CAROUSEL',
        scopeKey: 'GLOBAL',
        status: 'PUBLISHED',
        id: { not: contentId },
      }),
      data: { status: 'ARCHIVED', archivedAt: expect.any(Date) },
    });
  });

  it('only publishes drafts and archives non-archived content', async () => {
    const { service, tx, db } = setup();
    tx.publicContent.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(service.transition(owner, contentId, 'PUBLISHED', 'c')).rejects.toMatchObject({
      code: 'INVALID_STATE',
    });
    expect(tx.publicContent.updateMany).toHaveBeenCalledTimes(1);
    db.publicContent.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.transition(owner, contentId, 'ARCHIVED', 'c', 'Konten usang')).rejects.toMatchObject({
      code: 'INVALID_STATE',
    });
    await expect(
      service.transition(owner, contentId, 'DELETED' as never, 'c'),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('archiving needs a typed reason (and changes nothing without it); publishing needs none', async () => {
    const { service, db } = setup();
    for (const reason of [undefined, '', '  ', 'ab'])
      await expect(service.transition(owner, contentId, 'ARCHIVED', 'c', reason)).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
      });
    expect(db.publicContent.updateMany).not.toHaveBeenCalled();
  });
});
