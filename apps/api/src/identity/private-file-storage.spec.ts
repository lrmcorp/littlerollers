import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalPrivateFileStorage } from './private-file-storage';

describe('LocalPrivateFileStorage', () => {
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
});
