import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for MasterApi
void main() {
  final instance = Openapi().getMasterApi();

  group(MasterApi, () {
    //Future<Resource> createBranch(BranchCommand branchCommand) async
    test('test createBranch', () async {
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

    //Future<Page> listBranches() async
    test('test listBranches', () async {
      // TODO
    });

    //Future<Page> listClassTypes() async
    test('test listClassTypes', () async {
      // TODO
    });

    //Future<Page> listEffectiveSettings(String kind, { String branchId }) async
    test('test listEffectiveSettings', () async {
      // TODO
    });

    //Future<Page> listInstructorFees({ String branchId, String cursor }) async
    test('test listInstructorFees', () async {
      // TODO
    });

    //Future<Page> listProjectionRates({ String branchId, String cursor }) async
    test('test listProjectionRates', () async {
      // TODO
    });

    //Future<Page> listQuotaCapacitySettings({ String branchId, String cursor }) async
    test('test listQuotaCapacitySettings', () async {
      // TODO
    });

  });
}
