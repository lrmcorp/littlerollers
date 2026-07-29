import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for IdentityApi
void main() {
  final instance = Openapi().getIdentityApi();

  group(IdentityApi, () {
    //Future<AuthorizeIdentityVerificationView200Response> authorizeIdentityVerificationView(String id) async
    test('test authorizeIdentityVerificationView', () async {
      // TODO
    });

    //Future<IdentityDocumentSelfViewAuthorization> authorizeMyIdentityDocumentView(String kind) async
    test('test authorizeMyIdentityDocumentView', () async {
      // TODO
    });

    // Creates an OWNER or INSTRUCTOR interval and linked role projection atomically. Requires assignment:manage.
    //
    //Future<Resource> createAssignment(AssignmentCommand assignmentCommand) async
    test('test createAssignment', () async {
      // TODO
    });

    //Future<Resource> deactivateUser(String id, ReasonedVersionCommand reasonedVersionCommand) async
    test('test deactivateUser', () async {
      // TODO
    });

    //Future<IdentityVerificationDocument> decideIdentityVerification(String id, String decision, IdentityVerificationDecisionCommand identityVerificationDecisionCommand) async
    test('test decideIdentityVerification', () async {
      // TODO
    });

    //Future<IdentityVerificationDeletionResult> deleteIdentityVerificationFile(String id, DeleteIdentityVerificationFileRequest deleteIdentityVerificationFileRequest) async
    test('test deleteIdentityVerificationFile', () async {
      // TODO
    });

    // Ends the half-open assignment at the start of the branch-local calendar date containing effectiveAt. Requires assignment:manage and expectedVersion.
    //
    //Future<Resource> endAssignment(String id, String idempotencyKey, EndAssignmentCommand endAssignmentCommand) async
    test('test endAssignment', () async {
      // TODO
    });

    //Future<Me> getMe() async
    test('test getMe', () async {
      // TODO
    });

    //Future<IdentityVerificationSummary> getMyIdentityVerification() async
    test('test getMyIdentityVerification', () async {
      // TODO
    });

    //Future<MyProfile> getMyProfile() async
    test('test getMyProfile', () async {
      // TODO
    });

    //Future<PublicSiteConfig> getPublicSiteConfig() async
    test('test getPublicSiteConfig', () async {
      // TODO
    });

    // Compatibility projection of active system roles from the database-managed catalog.
    //
    //Future<RoleCatalog> getRoleCatalog() async
    test('test getRoleCatalog', () async {
      // TODO
    });

    //Future<UserSummary> getUser(String id) async
    test('test getUser', () async {
      // TODO
    });

    // Global reviewer-only identity summary for one customer. File content remains behind single-use authorization.
    //
    //Future<IdentityVerificationReviewCase> getUserIdentityVerification(String id) async
    test('test getUserIdentityVerification', () async {
      // TODO
    });

    //Future<Resource> inviteUser(InviteUserRequest inviteUserRequest) async
    test('test inviteUser', () async {
      // TODO
    });

    // Returns a capability-scoped assignment management projection. Omitted branchId means all authorized branches.
    //
    //Future<AssignmentPage> listAssignments({ String branchId, String q, String type, String status, String cursor, int limit }) async
    test('test listAssignments', () async {
      // TODO
    });

    //Future<IdentityVerificationReviewPage> listIdentityVerifications({ String q, String customerUserId, String status, String kind, String scanStatus, DateTime from, DateTime until, String cursor, int limit }) async
    test('test listIdentityVerifications', () async {
      // TODO
    });

    //Future<AuditLogPage> listUserAudit(String id, { String cursor }) async
    test('test listUserAudit', () async {
      // TODO
    });

    //Future<UserPage> listUsers({ String cursor, String branchId, String search, String status, Role role, String audience, String verificationStatus }) async
    test('test listUsers', () async {
      // TODO
    });

    // Returns active, identity-approved customers with a usable package in the requested branch. Requires booking:create:assisted.
    //
    //Future<CustomerLookupPage> lookupCustomers({ String q, String branchId, String cursor, int limit }) async
    test('test lookupCustomers', () async {
      // TODO
    });

    // Returns active instructors visible in the requested branch. Requires master:read or class-slot read/manage.
    //
    //Future<LookupPage> lookupInstructors({ String q, String branchId, String cursor, int limit }) async
    test('test lookupInstructors', () async {
      // TODO
    });

    // Returns a minimal, branch-scoped user selector payload. Requires user:read or audit:read.
    //
    //Future<LookupPage> lookupUsers({ String q, String branchId, String cursor, int limit }) async
    test('test lookupUsers', () async {
      // TODO
    });

    //Future<Resource> reactivateUser(String id, ReasonedVersionCommand reasonedVersionCommand) async
    test('test reactivateUser', () async {
      // TODO
    });

    // Streams one private identity image through a short-lived, viewer-bound, single-use authorization. The viewer is either the owning customer or an authorized reviewer. The response is never cacheable.
    //
    //Future<Uint8List> readAuthorizedIdentityVerificationFile(String authorizationId) async
    test('test readAuthorizedIdentityVerificationFile', () async {
      // TODO
    });

    //Future<IdentityVerificationDocument> replaceMyIdentityDocument(String kind, MultipartFile replacement, int expectedVersion) async
    test('test replaceMyIdentityDocument', () async {
      // TODO
    });

    //Future<ChallengeExpiry> requestUserPasswordSetup(String id, PasswordSetupRequest passwordSetupRequest) async
    test('test requestUserPasswordSetup', () async {
      // TODO
    });

    //Future<MyProfile> updateMyProfile(UpdateMyProfileCommand updateMyProfileCommand) async
    test('test updateMyProfile', () async {
      // TODO
    });

    // Updates permitted staff profile fields with optimistic locking and audit. Existing sessions remain valid because credential and authorization state do not change.
    //
    //Future<UserSummary> updateUserProfile(String id, UpdateUserProfileRequest updateUserProfileRequest) async
    test('test updateUserProfile', () async {
      // TODO
    });

    //Future<UserSummary> updateUserRoles(String id, String idempotencyKey, UpdateUserRolesCommand updateUserRolesCommand) async
    test('test updateUserRoles', () async {
      // TODO
    });

  });
}
