-- Package is a global catalog identity. Legacy branchId remains only as a
-- nullable compatibility projection; PackageBranchScope is authoritative.
ALTER TABLE `Package` MODIFY `branchId` CHAR(36) NULL;
