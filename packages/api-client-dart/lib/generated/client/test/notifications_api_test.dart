import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for NotificationsApi
void main() {
  final instance = Openapi().getNotificationsApi();

  group(NotificationsApi, () {
    //Future<NotificationOccurrencePage> listNotifications({ String cursor, String status }) async
    test('test listNotifications', () async {
      // TODO
    });

    //Future receiveMetaWebhook() async
    test('test receiveMetaWebhook', () async {
      // TODO
    });

    //Future<NotificationAttempt> retryNotification(String id, String idempotencyKey, DeactivateUserRequest deactivateUserRequest) async
    test('test retryNotification', () async {
      // TODO
    });

  });
}
