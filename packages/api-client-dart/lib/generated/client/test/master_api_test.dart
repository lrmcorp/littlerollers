import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for MasterApi
void main() {
  final instance = Openapi().getMasterApi();

  group(MasterApi, () {
    // Creates an active branch. Requires master:manage and MFA.
    //
    //Future<Branch> createBranch(BranchCommand branchCommand) async
    test('test createBranch', () async {
      // TODO
    });

    // Creates an active class type in one visible branch. Requires master:manage and MFA.
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

    //Future<Resource> createProjectionRate(ProjectionRateCommand projectionRateCommand) async
    test('test createProjectionRate', () async {
      // TODO
    });

    //Future<Resource> createQuotaCapacitySetting(QuotaCapacityCommand quotaCapacityCommand) async
    test('test createQuotaCapacitySetting', () async {
      // TODO
    });

    //Future<Branch> deactivateBranch(String id, VersionCommand versionCommand) async
    test('test deactivateBranch', () async {
      // TODO
    });

    //Future<ClassType> deactivateClassType(String id, VersionCommand versionCommand) async
    test('test deactivateClassType', () async {
      // TODO
    });

    //Future<BranchPage> listBranches() async
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

    //Future<EffectiveSettingPage> listProjectionRates({ String branchId, String cursor }) async
    test('test listProjectionRates', () async {
      // TODO
    });

    //Future<EffectiveSettingPage> listQuotaCapacitySettings({ String branchId, String cursor }) async
    test('test listQuotaCapacitySettings', () async {
      // TODO
    });

  });
}
