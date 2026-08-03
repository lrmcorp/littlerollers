import { createHash } from 'node:crypto';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalPrivateFileStorage, resolvePrivateUploadRoot } from './private-file-storage';

describe('LocalPrivateFileStorage', () => {
  it('resolves the development root consistently from the repository and API workspace', () => {
    const repositoryRoot = join(tmpdir(), 'repository');
    expect(resolvePrivateUploadRoot('apps/api/.local-data/private', repositoryRoot)).toBe(
      join(repositoryRoot, 'apps/api/.local-data/private'),
    );
    expect(
      resolvePrivateUploadRoot('apps/api/.local-data/private', join(repositoryRoot, 'apps', 'api')),
    ).toBe(join(repositoryRoot, 'apps/api/.local-data/private'));
  });

  it('writes, reads and deletes a scoped private file', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dd-private-'));
    const storage = new LocalPrivateFileStorage({
      value: { privateUploads: { root } },
    } as never);
    await storage.onModuleInit();
    await storage.put({ key: 'identity/user/document', content: Buffer.from('private') });
    expect(await storage.exists('identity/user/document')).toBe(true);
    const stream = await storage.read('identity/user/document');
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    expect(Buffer.concat(chunks).toString()).toBe('private');
    expect(await readFile(join(root, 'identity/user/document'), 'utf8')).toBe('private');
    await storage.delete('identity/user/document');
    expect(await storage.exists('identity/user/document')).toBe(false);
  });

  it('rejects traversal, absolute keys and public roots', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dd-private-'));
    const storage = new LocalPrivateFileStorage({
      value: { privateUploads: { root } },
    } as never);
    await expect(storage.put({ key: '../escape', content: Buffer.from('x') })).rejects.toThrow(
      'PRIVATE_FILE_KEY_INVALID',
    );
    await expect(storage.put({ key: '/escape', content: Buffer.from('x') })).rejects.toThrow(
      'PRIVATE_FILE_KEY_INVALID',
    );
    const publicStorage = new LocalPrivateFileStorage({
      value: { privateUploads: { root: join(root, 'public', 'files') } },
    } as never);
    await expect(publicStorage.onModuleInit()).rejects.toThrow(
      'PRIVATE_UPLOAD_ROOT_MUST_NOT_BE_PUBLIC',
    );
  });

  it('creates and safely replays a checksum-verified compatibility alias', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dd-private-'));
    const storage = new LocalPrivateFileStorage({
      value: { privateUploads: { root } },
    } as never);
    await storage.onModuleInit();
    const content = Buffer.from('immutable-payment-proof');
    const checksum = createHash('sha256').update(content).digest('hex');
    await storage.put({ key: 'payment-proofs/source', content });
    await expect(
      storage.createAlias({
        sourceKey: 'payment-proofs/source',
        aliasKey: 'v1-compat/private/rb_abc123.pdf',
        expectedChecksum: checksum,
        expectedSizeBytes: content.length,
      }),
    ).resolves.toMatchObject({ checksum, replay: false });
    await expect(
      storage.createAlias({
        sourceKey: 'payment-proofs/source',
        aliasKey: 'v1-compat/private/rb_abc123.pdf',
        expectedChecksum: checksum,
        expectedSizeBytes: content.length,
      }),
    ).resolves.toMatchObject({ checksum, replay: true });
    expect(await readFile(join(root, 'v1-compat/private/rb_abc123.pdf'), 'utf8')).toBe(
      content.toString(),
    );
  });

  it('fails closed when source or existing alias metadata differs', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dd-private-'));
    const storage = new LocalPrivateFileStorage({
      value: { privateUploads: { root } },
    } as never);
    await storage.onModuleInit();
    const source = Buffer.from('source');
    const checksum = createHash('sha256').update(source).digest('hex');
    await storage.put({ key: 'identity/source', content: source });
    await expect(
      storage.createAlias({
        sourceKey: 'identity/source',
        aliasKey: 'v1-compat/private/rb_conflict.jpg',
        expectedChecksum: '0'.repeat(64),
        expectedSizeBytes: source.length,
      }),
    ).rejects.toThrow('PILOT_MEDIA_SOURCE_MISMATCH');
    await storage.put({
      key: 'v1-compat/private/rb_conflict.jpg',
      content: Buffer.from('different'),
    });
    await expect(
      storage.createAlias({
        sourceKey: 'identity/source',
        aliasKey: 'v1-compat/private/rb_conflict.jpg',
        expectedChecksum: checksum,
        expectedSizeBytes: source.length,
      }),
    ).rejects.toThrow('PILOT_MEDIA_ALIAS_MISMATCH');
  });
});
