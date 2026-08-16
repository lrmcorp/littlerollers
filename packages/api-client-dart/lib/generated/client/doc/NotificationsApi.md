# openapi.api.NotificationsApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createNotificationTemplate**](NotificationsApi.md#createnotificationtemplate) | **POST** /notification-management/templates | 
[**getMyNotificationUnreadCount**](NotificationsApi.md#getmynotificationunreadcount) | **GET** /me/notifications/unread-count | 
[**getNotificationManagementOverview**](NotificationsApi.md#getnotificationmanagementoverview) | **GET** /notification-management | 
[**listMyNotifications**](NotificationsApi.md#listmynotifications) | **GET** /me/notifications | 
[**markAllMyNotificationsRead**](NotificationsApi.md#markallmynotificationsread) | **POST** /me/notifications/read-all | 
[**markMyNotificationRead**](NotificationsApi.md#markmynotificationread) | **PATCH** /me/notifications/{id}/read | 
[**transitionNotificationTemplate**](NotificationsApi.md#transitionnotificationtemplate) | **POST** /notification-management/templates/{id}/{status} | 


# **createNotificationTemplate**
> Resource createNotificationTemplate(body)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getNotificationsApi();
final JsonObject body = Object; // JsonObject | 

try {
    final response = api.createNotificationTemplate(body);
    print(response);
} catch on DioException (e) {
    print('Exception when calling NotificationsApi->createNotificationTemplate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | **JsonObject**|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

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

# **getNotificationManagementOverview**
> JsonObject getNotificationManagementOverview(status)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getNotificationsApi();
final String status = status_example; // String | 

try {
    final response = api.getNotificationManagementOverview(status);
    print(response);
} catch on DioException (e) {
    print('Exception when calling NotificationsApi->getNotificationManagementOverview: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **status** | **String**|  | [optional] 

### Return type

[**JsonObject**](JsonObject.md)

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

# **transitionNotificationTemplate**
> Resource transitionNotificationTemplate(id, status)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getNotificationsApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String status = status_example; // String | 

try {
    final response = api.transitionNotificationTemplate(id, status);
    print(response);
} catch on DioException (e) {
    print('Exception when calling NotificationsApi->transitionNotificationTemplate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **status** | **String**|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

