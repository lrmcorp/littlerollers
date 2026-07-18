# openapi.api.MigrationApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**applyMigrationBatch**](MigrationApi.md#applymigrationbatch) | **POST** /migration-batches/{id}/apply | 
[**createMigrationBatch**](MigrationApi.md#createmigrationbatch) | **POST** /migration-batches | 
[**createMigrationSourceUpload**](MigrationApi.md#createmigrationsourceupload) | **POST** /uploads/migration-sources | 
[**finalizeMigrationSourceUpload**](MigrationApi.md#finalizemigrationsourceupload) | **POST** /uploads/migration-sources/{id}/finalize | 
[**getMigrationBatch**](MigrationApi.md#getmigrationbatch) | **GET** /migration-batches/{id} | 
[**listMigrationBatches**](MigrationApi.md#listmigrationbatches) | **GET** /migration-batches | 
[**reconcileMigrationBatch**](MigrationApi.md#reconcilemigrationbatch) | **POST** /migration-batches/{id}/reconcile | 
[**rollbackMigrationBatch**](MigrationApi.md#rollbackmigrationbatch) | **POST** /migration-batches/{id}/rollback | 
[**transitionMigrationBatch**](MigrationApi.md#transitionmigrationbatch) | **POST** /migration-batches/{id}/{action} | 
[**validateMigrationBatch**](MigrationApi.md#validatemigrationbatch) | **POST** /migration-batches/{id}/validate | 


# **applyMigrationBatch**
> MigrationBatchResult applyMigrationBatch(id, idempotencyKey, migrationBatchActionCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMigrationApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final MigrationBatchActionCommand migrationBatchActionCommand = ; // MigrationBatchActionCommand | 

try {
    final response = api.applyMigrationBatch(id, idempotencyKey, migrationBatchActionCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MigrationApi->applyMigrationBatch: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **migrationBatchActionCommand** | [**MigrationBatchActionCommand**](MigrationBatchActionCommand.md)|  | 

### Return type

[**MigrationBatchResult**](MigrationBatchResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createMigrationBatch**
> MigrationBatchResult createMigrationBatch(idempotencyKey, migrationBatchCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMigrationApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final MigrationBatchCommand migrationBatchCommand = ; // MigrationBatchCommand | 

try {
    final response = api.createMigrationBatch(idempotencyKey, migrationBatchCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MigrationApi->createMigrationBatch: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **migrationBatchCommand** | [**MigrationBatchCommand**](MigrationBatchCommand.md)|  | 

### Return type

[**MigrationBatchResult**](MigrationBatchResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createMigrationSourceUpload**
> MigrationSourceUpload createMigrationSourceUpload(idempotencyKey, migrationSourceUploadCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMigrationApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final MigrationSourceUploadCommand migrationSourceUploadCommand = ; // MigrationSourceUploadCommand | 

try {
    final response = api.createMigrationSourceUpload(idempotencyKey, migrationSourceUploadCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MigrationApi->createMigrationSourceUpload: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **migrationSourceUploadCommand** | [**MigrationSourceUploadCommand**](MigrationSourceUploadCommand.md)|  | 

### Return type

[**MigrationSourceUpload**](MigrationSourceUpload.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **finalizeMigrationSourceUpload**
> MigrationSourceUpload finalizeMigrationSourceUpload(id, idempotencyKey, finalizeUploadCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMigrationApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final FinalizeUploadCommand finalizeUploadCommand = ; // FinalizeUploadCommand | 

try {
    final response = api.finalizeMigrationSourceUpload(id, idempotencyKey, finalizeUploadCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MigrationApi->finalizeMigrationSourceUpload: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **finalizeUploadCommand** | [**FinalizeUploadCommand**](FinalizeUploadCommand.md)|  | 

### Return type

[**MigrationSourceUpload**](MigrationSourceUpload.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMigrationBatch**
> MigrationBatchResult getMigrationBatch(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMigrationApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.getMigrationBatch(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MigrationApi->getMigrationBatch: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**MigrationBatchResult**](MigrationBatchResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listMigrationBatches**
> MigrationBatchPage listMigrationBatches(cursor, status)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMigrationApi();
final String cursor = cursor_example; // String | 
final String status = status_example; // String | 

try {
    final response = api.listMigrationBatches(cursor, status);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MigrationApi->listMigrationBatches: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **cursor** | **String**|  | [optional] 
 **status** | **String**|  | [optional] 

### Return type

[**MigrationBatchPage**](MigrationBatchPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **reconcileMigrationBatch**
> MigrationBatchResult reconcileMigrationBatch(id, idempotencyKey, migrationBatchActionCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMigrationApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final MigrationBatchActionCommand migrationBatchActionCommand = ; // MigrationBatchActionCommand | 

try {
    final response = api.reconcileMigrationBatch(id, idempotencyKey, migrationBatchActionCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MigrationApi->reconcileMigrationBatch: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **migrationBatchActionCommand** | [**MigrationBatchActionCommand**](MigrationBatchActionCommand.md)|  | 

### Return type

[**MigrationBatchResult**](MigrationBatchResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rollbackMigrationBatch**
> MigrationBatchResult rollbackMigrationBatch(id, idempotencyKey, migrationBatchActionCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMigrationApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final MigrationBatchActionCommand migrationBatchActionCommand = ; // MigrationBatchActionCommand | 

try {
    final response = api.rollbackMigrationBatch(id, idempotencyKey, migrationBatchActionCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MigrationApi->rollbackMigrationBatch: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **migrationBatchActionCommand** | [**MigrationBatchActionCommand**](MigrationBatchActionCommand.md)|  | 

### Return type

[**MigrationBatchResult**](MigrationBatchResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **transitionMigrationBatch**
> MigrationBatchResult transitionMigrationBatch(id, action, idempotencyKey, migrationBatchActionCommand)



Compatibility-only draft; use explicit lifecycle operations.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMigrationApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String action = action_example; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final MigrationBatchActionCommand migrationBatchActionCommand = ; // MigrationBatchActionCommand | 

try {
    final response = api.transitionMigrationBatch(id, action, idempotencyKey, migrationBatchActionCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MigrationApi->transitionMigrationBatch: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **action** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **migrationBatchActionCommand** | [**MigrationBatchActionCommand**](MigrationBatchActionCommand.md)|  | 

### Return type

[**MigrationBatchResult**](MigrationBatchResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **validateMigrationBatch**
> MigrationBatchResult validateMigrationBatch(id, idempotencyKey, migrationBatchActionCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMigrationApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final MigrationBatchActionCommand migrationBatchActionCommand = ; // MigrationBatchActionCommand | 

try {
    final response = api.validateMigrationBatch(id, idempotencyKey, migrationBatchActionCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MigrationApi->validateMigrationBatch: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **migrationBatchActionCommand** | [**MigrationBatchActionCommand**](MigrationBatchActionCommand.md)|  | 

### Return type

[**MigrationBatchResult**](MigrationBatchResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

