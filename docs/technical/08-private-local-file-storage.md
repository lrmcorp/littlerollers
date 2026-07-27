# Private local file storage

Customer identity images use the `local` implementation of `PrivateFileStorage` in v1. The configured `PRIVATE_UPLOAD_ROOT` must be a persistent directory outside every Web/public directory. API startup rejects a path containing a `public` segment and verifies read/write access before accepting traffic.

Production requirements:

- mount `PRIVATE_UPLOAD_ROOT` on a persistent volume owned by the API process;
- restrict the directory to the API operating-system user (directory mode `0700`, files `0600`);
- never expose the volume through Next.js, Nginx static aliases, CDN, analytics, or backup browsers;
- back up the volume and database in the same recovery window so object keys remain consistent;
- encrypt backup media, encrypt transport to the backup destination, limit restore access, and test a restore on a restricted environment;
- include the volume in retention and secure-erasure procedures. A successful database-only backup is not a complete identity-document backup.

The database stores only an opaque object key and verification metadata, never an absolute path or BLOB. Reviewer and customer self-view access use short-lived, viewer-bound, purpose-specific, single-use database authorizations. A customer authorization can only target that customer's current document. The content endpoint sends `private, no-store`, `nosniff`, and `no-referrer` headers.

Moving to S3/MinIO later requires another `PrivateFileStorage` adapter; registration, replacement, review, and deletion services must not depend on provider-specific URLs.
