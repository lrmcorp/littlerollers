import { DevFallbackPrivateFileStorage } from './dev-fallback-private-file-storage';
import type { PrivateFileStorage } from './private-file-storage';

describe('DevFallbackPrivateFileStorage', () => {
  let primary: jest.Mocked<PrivateFileStorage>;
  let fallback: jest.Mocked<PrivateFileStorage>;
  let storage: DevFallbackPrivateFileStorage;

  beforeEach(() => {
    primary = {
      put: jest.fn(),
      read: jest.fn(),
      exists: jest.fn(),
      delete: jest.fn(),
      inspect: jest.fn(),
      createAlias: jest.fn(),
    };
    fallback = {
      put: jest.fn(),
      read: jest.fn(),
      exists: jest.fn(),
      delete: jest.fn(),
      inspect: jest.fn(),
      createAlias: jest.fn(),
    };
    storage = new DevFallbackPrivateFileStorage(primary, fallback);
  });

  it('uses primary when primary exists', async () => {
    primary.exists.mockResolvedValue(true);
    primary.read.mockResolvedValue('primary-stream' as any);
    primary.inspect.mockResolvedValue({ sizeBytes: 100, checksum: 'abc' });

    expect(await storage.exists('test-key')).toBe(true);
    expect(await storage.read('test-key')).toBe('primary-stream');
    expect(await storage.inspect('test-key')).toEqual({ sizeBytes: 100, checksum: 'abc' });
    expect(fallback.exists).not.toHaveBeenCalled();
    expect(fallback.read).not.toHaveBeenCalled();
  });

  it('falls back to fallback storage when primary does not have file or throws', async () => {
    primary.exists.mockRejectedValue(new Error('S3 ECONNREFUSED'));
    fallback.exists.mockResolvedValue(true);
    fallback.read.mockResolvedValue('fallback-stream' as any);
    fallback.inspect.mockResolvedValue({ sizeBytes: 200, checksum: 'def' });

    expect(await storage.exists('test-key')).toBe(true);
    expect(await storage.read('test-key')).toBe('fallback-stream');
    expect(await storage.inspect('test-key')).toEqual({ sizeBytes: 200, checksum: 'def' });
    expect(fallback.exists).toHaveBeenCalledWith('test-key');
    expect(fallback.read).toHaveBeenCalledWith('test-key');
  });

  it('falls back on put and createAlias failure', async () => {
    primary.put.mockRejectedValue(new Error('S3 offline'));
    fallback.put.mockResolvedValue({ key: 'test-key', sizeBytes: 50 });

    const putResult = await storage.put({ key: 'test-key', content: Buffer.from('hello') });
    expect(putResult).toEqual({ key: 'test-key', sizeBytes: 50 });

    primary.createAlias.mockRejectedValue(new Error('S3 offline'));
    fallback.createAlias.mockResolvedValue({
      key: 'alias-key',
      sizeBytes: 50,
      checksum: 'hash',
      replay: false,
    });

    const aliasResult = await storage.createAlias({
      sourceKey: 'src',
      aliasKey: 'dst',
      expectedChecksum: 'hash',
      expectedSizeBytes: 50,
    });
    expect(aliasResult.key).toBe('alias-key');
  });
});
