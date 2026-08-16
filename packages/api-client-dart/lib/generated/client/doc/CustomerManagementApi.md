# openapi.api.CustomerManagementApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createManagedCustomer**](CustomerManagementApi.md#createmanagedcustomer) | **POST** /customers | 
[**deactivateManagedCustomer**](CustomerManagementApi.md#deactivatemanagedcustomer) | **POST** /customers/{id}/deactivate | 
[**getManagedCustomer**](CustomerManagementApi.md#getmanagedcustomer) | **GET** /customers/{id} | 
[**getManagedCustomerTimeline**](CustomerManagementApi.md#getmanagedcustomertimeline) | **GET** /customers/{id}/timeline | 
[**listCustomers**](CustomerManagementApi.md#listcustomers) | **GET** /customers | 
[**reactivateManagedCustomer**](CustomerManagementApi.md#reactivatemanagedcustomer) | **POST** /customers/{id}/reactivate | 
[**updateManagedCustomerProfile**](CustomerManagementApi.md#updatemanagedcustomerprofile) | **PATCH** /customers/{id}/profile | 


# **createManagedCustomer**
> JsonObject createManagedCustomer(idempotencyKey, xCustomerStepUp, createManagedCustomerRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getCustomerManagementApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final String xCustomerStepUp = xCustomerStepUp_example; // String | Short-lived secret; never log or persist.
final CreateManagedCustomerRequest createManagedCustomerRequest = ; // CreateManagedCustomerRequest | 

try {
    final response = api.createManagedCustomer(idempotencyKey, xCustomerStepUp, createManagedCustomerRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling CustomerManagementApi->createManagedCustomer: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **xCustomerStepUp** | **String**| Short-lived secret; never log or persist. | 
 **createManagedCustomerRequest** | [**CreateManagedCustomerRequest**](CreateManagedCustomerRequest.md)|  | 

### Return type

[**JsonObject**](JsonObject.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deactivateManagedCustomer**
> Resource deactivateManagedCustomer(id, idempotencyKey, xCustomerStepUp, versionedReasonCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getCustomerManagementApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final String xCustomerStepUp = xCustomerStepUp_example; // String | 
final VersionedReasonCommand versionedReasonCommand = ; // VersionedReasonCommand | 

try {
    final response = api.deactivateManagedCustomer(id, idempotencyKey, xCustomerStepUp, versionedReasonCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling CustomerManagementApi->deactivateManagedCustomer: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **xCustomerStepUp** | **String**|  | 
 **versionedReasonCommand** | [**VersionedReasonCommand**](VersionedReasonCommand.md)|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getManagedCustomer**
> JsonObject getManagedCustomer(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getCustomerManagementApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.getManagedCustomer(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling CustomerManagementApi->getManagedCustomer: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**JsonObject**](JsonObject.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getManagedCustomerTimeline**
> JsonObject getManagedCustomerTimeline(id, cursor)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getCustomerManagementApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String cursor = cursor_example; // String | 

try {
    final response = api.getManagedCustomerTimeline(id, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling CustomerManagementApi->getManagedCustomerTimeline: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **cursor** | **String**|  | [optional] 

### Return type

[**JsonObject**](JsonObject.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listCustomers**
> JsonObject listCustomers(q, cursor, status, verificationStatus, preferredBranchId, packageStatus, activity)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getCustomerManagementApi();
final String q = q_example; // String | 
final String cursor = cursor_example; // String | 
final String status = status_example; // String | 
final String verificationStatus = verificationStatus_example; // String | 
final String preferredBranchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String packageStatus = packageStatus_example; // String | 
final String activity = activity_example; // String | 

try {
    final response = api.listCustomers(q, cursor, status, verificationStatus, preferredBranchId, packageStatus, activity);
    print(response);
} catch on DioException (e) {
    print('Exception when calling CustomerManagementApi->listCustomers: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **q** | **String**|  | [optional] 
 **cursor** | **String**|  | [optional] 
 **status** | **String**|  | [optional] 
 **verificationStatus** | **String**|  | [optional] 
 **preferredBranchId** | **String**|  | [optional] 
 **packageStatus** | **String**|  | [optional] 
 **activity** | **String**|  | [optional] 

### Return type

[**JsonObject**](JsonObject.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **reactivateManagedCustomer**
> Resource reactivateManagedCustomer(id, idempotencyKey, xCustomerStepUp, versionedReasonCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getCustomerManagementApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final String xCustomerStepUp = xCustomerStepUp_example; // String | 
final VersionedReasonCommand versionedReasonCommand = ; // VersionedReasonCommand | 

try {
    final response = api.reactivateManagedCustomer(id, idempotencyKey, xCustomerStepUp, versionedReasonCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling CustomerManagementApi->reactivateManagedCustomer: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **xCustomerStepUp** | **String**|  | 
 **versionedReasonCommand** | [**VersionedReasonCommand**](VersionedReasonCommand.md)|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateManagedCustomerProfile**
> Resource updateManagedCustomerProfile(id, idempotencyKey, xCustomerStepUp, body)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getCustomerManagementApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final String xCustomerStepUp = xCustomerStepUp_example; // String | 
final JsonObject body = Object; // JsonObject | 

try {
    final response = api.updateManagedCustomerProfile(id, idempotencyKey, xCustomerStepUp, body);
    print(response);
} catch on DioException (e) {
    print('Exception when calling CustomerManagementApi->updateManagedCustomerProfile: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **xCustomerStepUp** | **String**|  | 
 **body** | **JsonObject**|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

