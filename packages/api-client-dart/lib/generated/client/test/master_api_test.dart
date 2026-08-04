import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for MasterApi
void main() {
  final instance = Openapi(basePathOverride: 'http://localhost/api/v1').getMasterApi();

  group(MasterApi, () {
    // Creates an active branch. Requires master:manage.
    //
    //Future<Branch> createBranch(String idempotencyKey, BranchCommand branchCommand) async
    test('test createBranch', () async {
      // TODO
    });

    //Future<Studio> createBranchStudio(String id, StudioCommand studioCommand) async
    test('test createBranchStudio', () async {
      // TODO
    });

    // Creates one global class type. Optional branchIds create explicit availability scopes; no active branch selection is required.
    //
    //Future<ClassType> createClassType(ClassTypeCommand classTypeCommand) async
    test('test createClassType', () async {
      // TODO
    });

    //Future<Resource> createEffectiveSetting(String kind, EffectiveSettingCommand effectiveSettingCommand) async
    test('test createEffectiveSetting', () async {
      // TODO
    });

    //Future<Resource> createInstructorFee(InstructorFeeCommand instructorFeeCommand) async
    test('test createInstructorFee', () async {
      // TODO
    });

    // Creates the single active account for a branch. Requires Super Owner payment-account permission.
    //
    //Future<PaymentAccount> createPaymentAccount(PaymentAccountCommand paymentAccountCommand) async
    test('test createPaymentAccount', () async {
      // TODO
    });

    //Future<Resource> createProjectionRate(ProjectionRateCommand projectionRateCommand) async
    test('test createProjectionRate', () async {
      // TODO
    });

    //Future<Resource> createQuotaCapacitySetting(QuotaCapacityCommand quotaCapacityCommand) async
    test('test createQuotaCapacitySetting', () async {
      // TODO
    });

    //Future<Room> createStudioRoom(String id, RoomCommand roomCommand) async
    test('test createStudioRoom', () async {
      // TODO
    });

    //Future<Branch> deactivateBranch(String id, String idempotencyKey, ReasonedVersionCommand body) async
    test('test deactivateBranch', () async {
      // TODO
    });

    //Future<ClassType> deactivateClassType(String id, String idempotencyKey, ReasonedVersionCommand reasonedVersionCommand) async
    test('test deactivateClassType', () async {
      // TODO
    });

    // Blocked while non-expired AWAITING_PAYMENT orders reference the account.
    //
    //Future<PaymentAccount> deactivatePaymentAccount(String id, String idempotencyKey, ReasonedVersionCommand reasonedVersionCommand) async
    test('test deactivatePaymentAccount', () async {
      // TODO
    });

    //Future<BranchManagementDetail> getBranch(String id) async
    test('test getBranch', () async {
      // TODO
    });

    // Returns masked account detail and safe dependency count.
    //
    //Future<PaymentAccountDetail> getPaymentAccount(String id) async
    test('test getPaymentAccount', () async {
      // TODO
    });

    //Future<PublicStudioDetail> getPublicStudioDetail(String slug) async
    test('test getPublicStudioDetail', () async {
      // TODO
    });

    //Future<StudioPage> listBranchStudios(String id) async
    test('test listBranchStudios', () async {
      // TODO
    });

    //Future<BranchPage> listBranches({ String q, String status, String cursor, int limit }) async
    test('test listBranches', () async {
      // TODO
    });

    //Future<ClassTypePage> listClassTypes({ String branchId }) async
    test('test listClassTypes', () async {
      // TODO
    });

    //Future<Page> listEffectiveSettings(String kind, { String branchId }) async
    test('test listEffectiveSettings', () async {
      // TODO
    });

    //Future<EffectiveSettingPage> listInstructorFees({ String branchId, String cursor }) async
    test('test listInstructorFees', () async {
      // TODO
    });

    // Returns masked account metadata only. Requires payment-account:read.
    //
    //Future<ListPaymentAccounts200Response> listPaymentAccounts({ String branchId }) async
    test('test listPaymentAccounts', () async {
      // TODO
    });

    //Future<EffectiveSettingPage> listProjectionRates({ String branchId, String cursor }) async
    test('test listProjectionRates', () async {
      // TODO
    });

    //Future<EffectiveSettingPage> listQuotaCapacitySettings({ String branchId, String cursor }) async
    test('test listQuotaCapacitySettings', () async {
      // TODO
    });

    //Future<RoomPage> listStudioRooms(String id) async
    test('test listStudioRooms', () async {
      // TODO
    });

    //Future<Branch> reactivateBranch(String id, String idempotencyKey, ReasonedVersionCommand body) async
    test('test reactivateBranch', () async {
      // TODO
    });

    //Future<ClassType> reactivateClassType(String id, String idempotencyKey, ReasonedVersionCommand reasonedVersionCommand) async
    test('test reactivateClassType', () async {
      // TODO
    });

    // Reactivates a historical account only when its branch is active and has no other active payment account.
    //
    //Future<PaymentAccount> reactivatePaymentAccount(String id, String idempotencyKey, ReasonedVersionCommand reasonedVersionCommand) async
    test('test reactivatePaymentAccount', () async {
      // TODO
    });

    // Replaces the explicit Studio/Cabang availability scopes for a global class type. \"All\" is expanded by the client to the active branch IDs at decision time.
    //
    //Future<ClassType> replaceClassTypeBranchScopes(String id, ClassTypeScopeCommand classTypeScopeCommand) async
    test('test replaceClassTypeBranchScopes', () async {
      // TODO
    });

    //Future<Branch> updateBranch(String id, String idempotencyKey, BranchUpdateCommand branchUpdateCommand) async
    test('test updateBranch', () async {
      // TODO
    });

    // Updates safe class-type metadata. Branch and business code remain immutable.
    //
    //Future<ClassType> updateClassType(String id, String idempotencyKey, ClassTypeUpdateCommand classTypeUpdateCommand) async
    test('test updateClassType', () async {
      // TODO
    });

    //Future<Room> updateRoom(String id, RoomUpdateCommand roomUpdateCommand) async
    test('test updateRoom', () async {
      // TODO
    });

    //Future<Studio> updateStudio(String id, StudioUpdateCommand studioUpdateCommand) async
    test('test updateStudio', () async {
      // TODO
    });

  });
}
