# openapi.api.NotificationsApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getMyNotificationUnreadCount**](NotificationsApi.md#getmynotificationunreadcount) | **GET** /me/notifications/unread-count | 
[**listMyNotifications**](NotificationsApi.md#listmynotifications) | **GET** /me/notifications | 
[**listNotifications**](NotificationsApi.md#listnotifications) | **GET** /notifications | 
[**markAllMyNotificationsRead**](NotificationsApi.md#markallmynotificationsread) | **POST** /me/notifications/read-all | 
[**markMyNotificationRead**](NotificationsApi.md#markmynotificationread) | **PATCH** /me/notifications/{id}/read | 
[**receiveMetaWebhook**](NotificationsApi.md#receivemetawebhook) | **POST** /webhooks/meta | 
[**retryNotification**](NotificationsApi.md#retrynotification) | **POST** /notifications/{id}/retry | 


# **getMyNotificationUnreadCount**
> GetMyNotificationUnreadCount200Response getMyNotificationUnreadCount()



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getNotificationsApi();

try {
    final response = api.getMyNotificationUnreadCount();
    print(response);
} catch on DioException (e) {
    print('Exception when calling NotificationsApi->getMyNotificationUnreadCount: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**GetMyNotificationUnreadCount200Response**](GetMyNotificationUnreadCount200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listMyNotifications**
> UserNotificationPage listMyNotifications(cursor, limit, unreadOnly)



Self-only persistent in-app notification feed.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getNotificationsApi();
final String cursor = cursor_example; // String | 
final int limit = 56; // int | 
final bool unreadOnly = true; // bool | 

try {
    final response = api.listMyNotifications(cursor, limit, unreadOnly);
    print(response);
} catch on DioException (e) {
    print('Exception when calling NotificationsApi->listMyNotifications: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **cursor** | **String**|  | [optional] 
 **limit** | **int**|  | [optional] [default to 20]
 **unreadOnly** | **bool**|  | [optional] [default to false]

### Return type

[**UserNotificationPage**](UserNotificationPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listNotifications**
> NotificationOccurrencePage listNotifications(cursor, status)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getNotificationsApi();
final String cursor = cursor_example; // String | 
final String status = status_example; // String | 

try {
    final response = api.listNotifications(cursor, status);
    print(response);
} catch on DioException (e) {
    print('Exception when calling NotificationsApi->listNotifications: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **cursor** | **String**|  | [optional] 
 **status** | **String**|  | [optional] 

### Return type

[**NotificationOccurrencePage**](NotificationOccurrencePage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **markAllMyNotificationsRead**
> MarkAllMyNotificationsRead200Response markAllMyNotificationsRead()



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getNotificationsApi();

try {
    final response = api.markAllMyNotificationsRead();
    print(response);
} catch on DioException (e) {
    print('Exception when calling NotificationsApi->markAllMyNotificationsRead: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**MarkAllMyNotificationsRead200Response**](MarkAllMyNotificationsRead200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **markMyNotificationRead**
> UserNotification markMyNotificationRead(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getNotificationsApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.markMyNotificationRead(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling NotificationsApi->markMyNotificationRead: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**UserNotification**](UserNotification.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **receiveMetaWebhook**
> receiveMetaWebhook()



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getNotificationsApi();

try {
    api.receiveMetaWebhook();
} catch on DioException (e) {
    print('Exception when calling NotificationsApi->receiveMetaWebhook: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **retryNotification**
> NotificationAttempt retryNotification(id, idempotencyKey, decideCorrectionRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getNotificationsApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final DecideCorrectionRequest decideCorrectionRequest = ; // DecideCorrectionRequest | 

try {
    final response = api.retryNotification(id, idempotencyKey, decideCorrectionRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling NotificationsApi->retryNotification: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **decideCorrectionRequest** | [**DecideCorrectionRequest**](DecideCorrectionRequest.md)|  | 

### Return type

[**NotificationAttempt**](NotificationAttempt.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

