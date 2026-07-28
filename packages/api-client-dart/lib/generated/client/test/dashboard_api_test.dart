import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for DashboardApi
void main() {
  final instance = Openapi().getDashboardApi();

  group(DashboardApi, () {
    // Customer-owned actionable overview.
    //
    //Future<CustomerDashboardOverview> getMyDashboard() async
    test('test getMyDashboard', () async {
      // TODO
    });

  });
}
