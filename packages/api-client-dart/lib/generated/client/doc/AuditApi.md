# openapi.api.AuditApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**authorizeAuditExportDownload**](AuditApi.md#authorizeauditexportdownload) | **POST** /audit-exports/{id}/download-authorizations | 
[**createAuditExport**](AuditApi.md#createauditexport) | **POST** /audit-exports | 
[**downloadAuditExport**](AuditApi.md#downloadauditexport) | **GET** /audit-exports/{id}/download | 
[**getAuditExportStatus**](AuditApi.md#getauditexportstatus) | **GET** /audit-exports/{id} | 
[**listAuditLogs**](AuditApi.md#listauditlogs) | **GET** /audit-logs | 


# **authorizeAuditExportDownload**
> DownloadAuthorization authorizeAuditExportDownload(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuditApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.authorizeAuditExportDownload(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuditApi->authorizeAuditExportDownload: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**DownloadAuthorization**](DownloadAuthorization.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createAuditExport**
> AuditExport createAuditExport(idempotencyKey, auditExportCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuditApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final AuditExportCommand auditExportCommand = ; // AuditExportCommand | 

try {
    final response = api.createAuditExport(idempotencyKey, auditExportCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuditApi->createAuditExport: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **auditExportCommand** | [**AuditExportCommand**](AuditExportCommand.md)|  | 

### Return type

[**AuditExport**](AuditExport.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **downloadAuditExport**
> String downloadAuditExport(id, token)



Consumes a single-use, short-lived opaque download token.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuditApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String token = token_example; // String | 

try {
    final response = api.downloadAuditExport(id, token);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuditApi->downloadAuditExport: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **token** | **String**|  | 

### Return type

**String**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/csv, application/x-ndjson, application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAuditExportStatus**
> AuditExport getAuditExportStatus(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuditApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.getAuditExportStatus(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuditApi->getAuditExportStatus: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**AuditExport**](AuditExport.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listAuditLogs**
> AuditLogPage listAuditLogs(branchId, cursor, actorId, targetUserId, action, correlationId, from, until)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuditApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String cursor = cursor_example; // String | 
final String actorId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String targetUserId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String action = action_example; // String | 
final String correlationId = correlationId_example; // String | 
final DateTime from = 2013-10-20T19:20:30+01:00; // DateTime | 
final DateTime until = 2013-10-20T19:20:30+01:00; // DateTime | 

try {
    final response = api.listAuditLogs(branchId, cursor, actorId, targetUserId, action, correlationId, from, until);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuditApi->listAuditLogs: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **cursor** | **String**|  | [optional] 
 **actorId** | **String**|  | [optional] 
 **targetUserId** | **String**|  | [optional] 
 **action** | **String**|  | [optional] 
 **correlationId** | **String**|  | [optional] 
 **from** | **DateTime**|  | [optional] 
 **until** | **DateTime**|  | [optional] 

### Return type

[**AuditLogPage**](AuditLogPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

