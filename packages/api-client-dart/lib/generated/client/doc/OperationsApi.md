# openapi.api.OperationsApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**deadLetterOperationalJob**](OperationsApi.md#deadletteroperationaljob) | **POST** /operations/jobs/{id}/dead-letter | 
[**getDashboardOverview**](OperationsApi.md#getdashboardoverview) | **GET** /dashboard/overview | 
[**getHealth**](OperationsApi.md#gethealth) | **GET** /operations/health | 
[**listJobs**](OperationsApi.md#listjobs) | **GET** /operations/jobs | 
[**retryOperationalJob**](OperationsApi.md#retryoperationaljob) | **POST** /operations/jobs/{id}/retry | 
[**runQuotaEvaluation**](OperationsApi.md#runquotaevaluation) | **POST** /operations/quota-evaluations/{id}/run | 


# **deadLetterOperationalJob**
> OperationalJobResult deadLetterOperationalJob(id, idempotencyKey, deactivateUserRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getOperationsApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final DeactivateUserRequest deactivateUserRequest = ; // DeactivateUserRequest | 

try {
    final response = api.deadLetterOperationalJob(id, idempotencyKey, deactivateUserRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling OperationsApi->deadLetterOperationalJob: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **deactivateUserRequest** | [**DeactivateUserRequest**](DeactivateUserRequest.md)|  | 

### Return type

[**OperationalJobResult**](OperationalJobResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDashboardOverview**
> DashboardOverview getDashboardOverview(branchId, from, until)



Capability- and branch-scoped aggregate overview for authenticated internal workspaces.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getOperationsApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final Date from = 2013-10-20; // Date | 
final Date until = 2013-10-20; // Date | 

try {
    final response = api.getDashboardOverview(branchId, from, until);
    print(response);
} catch on DioException (e) {
    print('Exception when calling OperationsApi->getDashboardOverview: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **from** | **Date**|  | [optional] 
 **until** | **Date**|  | [optional] 

### Return type

[**DashboardOverview**](DashboardOverview.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getHealth**
> HealthResult getHealth()



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getOperationsApi();

try {
    final response = api.getHealth();
    print(response);
} catch on DioException (e) {
    print('Exception when calling OperationsApi->getHealth: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**HealthResult**](HealthResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listJobs**
> OperationalJobPage listJobs(cursor, status)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getOperationsApi();
final String cursor = cursor_example; // String | 
final String status = status_example; // String | 

try {
    final response = api.listJobs(cursor, status);
    print(response);
} catch on DioException (e) {
    print('Exception when calling OperationsApi->listJobs: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **cursor** | **String**|  | [optional] 
 **status** | **String**|  | [optional] 

### Return type

[**OperationalJobPage**](OperationalJobPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **retryOperationalJob**
> OperationalJobResult retryOperationalJob(id, idempotencyKey, deactivateUserRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getOperationsApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final DeactivateUserRequest deactivateUserRequest = ; // DeactivateUserRequest | 

try {
    final response = api.retryOperationalJob(id, idempotencyKey, deactivateUserRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling OperationsApi->retryOperationalJob: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **deactivateUserRequest** | [**DeactivateUserRequest**](DeactivateUserRequest.md)|  | 

### Return type

[**OperationalJobResult**](OperationalJobResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **runQuotaEvaluation**
> QuotaEvaluationResult runQuotaEvaluation(id, idempotencyKey, quotaEvaluationCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getOperationsApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final QuotaEvaluationCommand quotaEvaluationCommand = ; // QuotaEvaluationCommand | 

try {
    final response = api.runQuotaEvaluation(id, idempotencyKey, quotaEvaluationCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling OperationsApi->runQuotaEvaluation: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **quotaEvaluationCommand** | [**QuotaEvaluationCommand**](QuotaEvaluationCommand.md)|  | 

### Return type

[**QuotaEvaluationResult**](QuotaEvaluationResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

