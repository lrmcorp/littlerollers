-- Package.classTypeId adalah compatibility projection.
-- Eligibility authoritative berada di PackageClassTypeScope.
-- Kolom dan FK tetap dipertahankan sementara untuk importer/cutover V1.
ALTER TABLE `Package`
  MODIFY `classTypeId` CHAR(36) NULL;
