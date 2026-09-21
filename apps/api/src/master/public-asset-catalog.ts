/**
 * @deprecated Hardcoded PUBLIC_ASSET_KEYS has been eliminated in Phase 4.
 * Asset keys are now dynamically discovered from database and MinIO storage.
 */
export const PUBLIC_ASSET_KEYS: readonly string[] = [];
export const PUBLIC_ASSET_KEY_SET: ReadonlySet<string> = new Set<string>();
