import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for NotificationsApi
void main() {
  final instance = Openapi(basePathOverride: 'http://localhost/api/v1').getNotificationsApi();

  group(NotificationsApi, () {
    //Future<GetMyNotificationUnreadCount200Response> getMyNotificationUnreadCount() async
    test('test getMyNotificationUnreadCount', () async {
      // TODO
    });

    // Self-only persistent in-app notification feed.
    //
    //Future<UserNotificationPage> listMyNotifications({ String cursor, int limit, bool unreadOnly }) async
    test('test listMyNotifications', () async {
      // TODO
    });

    //Future<MarkAllMyNotificationsRead200Response> markAllMyNotificationsRead() async
    test('test markAllMyNotificationsRead', () async {
      // TODO
    });

    //Future<UserNotification> markMyNotificationRead(String id) async
    test('test markMyNotificationRead', () async {
      // TODO
    });

    //Future receiveMetaWebhook() async
    test('test receiveMetaWebhook', () async {
      // TODO
    });

  });
}
