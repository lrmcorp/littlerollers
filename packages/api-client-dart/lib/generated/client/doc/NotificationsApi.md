# openapi.api.NotificationsApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**listNotifications**](NotificationsApi.md#listnotifications) | **GET** /notifications | 
[**receiveMetaWebhook**](NotificationsApi.md#receivemetawebhook) | **POST** /webhooks/meta | 
[**retryNotification**](NotificationsApi.md#retrynotification) | **POST** /notifications/{id}/retry | 


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
> NotificationAttempt retryNotification(id, idempotencyKey, deactivateUserRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getNotificationsApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final DeactivateUserRequest deactivateUserRequest = ; // DeactivateUserRequest | 

try {
    final response = api.retryNotification(id, idempotencyKey, deactivateUserRequest);
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
 **deactivateUserRequest** | [**DeactivateUserRequest**](DeactivateUserRequest.md)|  | 

### Return type

[**NotificationAttempt**](NotificationAttempt.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

