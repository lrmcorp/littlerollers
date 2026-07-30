import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for DashboardApi
void main() {
  final instance = Openapi(basePathOverride: 'http://localhost/api/v1').getDashboardApi();

  group(DashboardApi, () {
    // Customer-owned actionable overview.
    //
    //Future<CustomerDashboardOverview> getMyDashboard() async
    test('test getMyDashboard', () async {
      // TODO
    });

  });
}
