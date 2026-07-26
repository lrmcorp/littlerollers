# openapi.api.LedgerApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**decideSessionAdjustment**](LedgerApi.md#decidesessionadjustment) | **POST** /session-adjustments/{id}/{decision} | 
[**getPackageLedger**](LedgerApi.md#getpackageledger) | **GET** /customer-packages/{id}/ledger | 
[**listCustomerPackages**](LedgerApi.md#listcustomerpackages) | **GET** /customer-packages | 
[**listSessionAdjustments**](LedgerApi.md#listsessionadjustments) | **GET** /session-adjustments | 
[**requestSessionAdjustment**](LedgerApi.md#requestsessionadjustment) | **POST** /session-adjustments | 


# **decideSessionAdjustment**
> AdjustmentDecisionResult decideSessionAdjustment(id, decision, idempotencyKey, sessionAdjustmentDecisionCommand)



Permission-gated decision by a different Manager or Super Owner. Approval atomically posts one ADJUST_MANUAL entry.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getLedgerApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String decision = decision_example; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final SessionAdjustmentDecisionCommand sessionAdjustmentDecisionCommand = ; // SessionAdjustmentDecisionCommand | 

try {
    final response = api.decideSessionAdjustment(id, decision, idempotencyKey, sessionAdjustmentDecisionCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling LedgerApi->decideSessionAdjustment: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **decision** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **sessionAdjustmentDecisionCommand** | [**SessionAdjustmentDecisionCommand**](SessionAdjustmentDecisionCommand.md)|  | 

### Return type

[**AdjustmentDecisionResult**](AdjustmentDecisionResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPackageLedger**
> PackageLedgerResult getPackageLedger(id, cursor)



Append-only entries ordered by occurredAt and id descending with opaque keyset cursor and active reservation summary.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getLedgerApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String cursor = cursor_example; // String | 

try {
    final response = api.getPackageLedger(id, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling LedgerApi->getPackageLedger: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **cursor** | **String**|  | [optional] 

### Return type

[**PackageLedgerResult**](PackageLedgerResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listCustomerPackages**
> CustomerPackageBalancePage listCustomerPackages(branchId, cursor)



Customer-own or branch-scoped balances from an authoritative ledger/reservation snapshot. Invalid cursor is rejected; invariant mismatch is never silently clamped.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getLedgerApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String cursor = cursor_example; // String | 

try {
    final response = api.listCustomerPackages(branchId, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling LedgerApi->listCustomerPackages: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **cursor** | **String**|  | [optional] 

### Return type

[**CustomerPackageBalancePage**](CustomerPackageBalancePage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listSessionAdjustments**
> SessionAdjustmentPage listSessionAdjustments(branchId, status, cursor)



Branch-scoped adjustment queue ordered by createdAt and id descending.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getLedgerApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String status = status_example; // String | 
final String cursor = cursor_example; // String | 

try {
    final response = api.listSessionAdjustments(branchId, status, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling LedgerApi->listSessionAdjustments: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **status** | **String**|  | [optional] 
 **cursor** | **String**|  | [optional] 

### Return type

[**SessionAdjustmentPage**](SessionAdjustmentPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **requestSessionAdjustment**
> SessionAdjustment requestSessionAdjustment(idempotencyKey, adjustmentCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getLedgerApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final AdjustmentCommand adjustmentCommand = ; // AdjustmentCommand | 

try {
    final response = api.requestSessionAdjustment(idempotencyKey, adjustmentCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling LedgerApi->requestSessionAdjustment: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **adjustmentCommand** | [**AdjustmentCommand**](AdjustmentCommand.md)|  | 

### Return type

[**SessionAdjustment**](SessionAdjustment.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

