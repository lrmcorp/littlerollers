# openapi.api.PackagesApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**approvePurchase**](PackagesApi.md#approvepurchase) | **POST** /purchases/{id}/approve | 
[**authorizePaymentProofDownload**](PackagesApi.md#authorizepaymentproofdownload) | **POST** /uploads/payment-proofs/{id}/download-authorizations | 
[**createPackage**](PackagesApi.md#createpackage) | **POST** /packages | 
[**createPaymentProofUpload**](PackagesApi.md#createpaymentproofupload) | **POST** /uploads/payment-proofs | 
[**finalizePaymentProofUpload**](PackagesApi.md#finalizepaymentproofupload) | **POST** /uploads/payment-proofs/{id}/finalize | 
[**getPaymentProofStatus**](PackagesApi.md#getpaymentproofstatus) | **GET** /uploads/payment-proofs/{id} | 
[**listPackages**](PackagesApi.md#listpackages) | **GET** /packages | 
[**listPurchases**](PackagesApi.md#listpurchases) | **GET** /purchases | 
[**rejectPurchase**](PackagesApi.md#rejectpurchase) | **POST** /purchases/{id}/reject | 
[**replacePurchasePaymentProof**](PackagesApi.md#replacepurchasepaymentproof) | **POST** /purchases/{id}/payment-proof-replacements | 
[**submitPurchase**](PackagesApi.md#submitpurchase) | **POST** /purchases | 


# **approvePurchase**
> ApprovalResult approvePurchase(id, idempotencyKey, deactivateUserRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final DeactivateUserRequest deactivateUserRequest = ; // DeactivateUserRequest | 

try {
    final response = api.approvePurchase(id, idempotencyKey, deactivateUserRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->approvePurchase: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **deactivateUserRequest** | [**DeactivateUserRequest**](DeactivateUserRequest.md)|  | 

### Return type

[**ApprovalResult**](ApprovalResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authorizePaymentProofDownload**
> DownloadAuthorization authorizePaymentProofDownload(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.authorizePaymentProofDownload(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->authorizePaymentProofDownload: $e\n');
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

# **createPackage**
> Resource createPackage(packageCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final PackageCommand packageCommand = ; // PackageCommand | 

try {
    final response = api.createPackage(packageCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->createPackage: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **packageCommand** | [**PackageCommand**](PackageCommand.md)|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createPaymentProofUpload**
> Resource createPaymentProofUpload(createPaymentProofUploadRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final CreatePaymentProofUploadRequest createPaymentProofUploadRequest = ; // CreatePaymentProofUploadRequest | 

try {
    final response = api.createPaymentProofUpload(createPaymentProofUploadRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->createPaymentProofUpload: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createPaymentProofUploadRequest** | [**CreatePaymentProofUploadRequest**](CreatePaymentProofUploadRequest.md)|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **finalizePaymentProofUpload**
> PaymentProof finalizePaymentProofUpload(id, idempotencyKey, finalizeUploadCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final FinalizeUploadCommand finalizeUploadCommand = ; // FinalizeUploadCommand | 

try {
    final response = api.finalizePaymentProofUpload(id, idempotencyKey, finalizeUploadCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->finalizePaymentProofUpload: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **finalizeUploadCommand** | [**FinalizeUploadCommand**](FinalizeUploadCommand.md)|  | 

### Return type

[**PaymentProof**](PaymentProof.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPaymentProofStatus**
> PaymentProof getPaymentProofStatus(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.getPaymentProofStatus(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->getPaymentProofStatus: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**PaymentProof**](PaymentProof.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listPackages**
> Page listPackages(branchId, cursor)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String cursor = cursor_example; // String | 

try {
    final response = api.listPackages(branchId, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->listPackages: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **cursor** | **String**|  | [optional] 

### Return type

[**Page**](Page.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listPurchases**
> Page listPurchases(branchId, cursor, status)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String cursor = cursor_example; // String | 
final String status = status_example; // String | 

try {
    final response = api.listPurchases(branchId, cursor, status);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->listPurchases: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **cursor** | **String**|  | [optional] 
 **status** | **String**|  | [optional] 

### Return type

[**Page**](Page.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rejectPurchase**
> Purchase rejectPurchase(id, idempotencyKey, deactivateUserRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final DeactivateUserRequest deactivateUserRequest = ; // DeactivateUserRequest | 

try {
    final response = api.rejectPurchase(id, idempotencyKey, deactivateUserRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->rejectPurchase: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **deactivateUserRequest** | [**DeactivateUserRequest**](DeactivateUserRequest.md)|  | 

### Return type

[**Purchase**](Purchase.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **replacePurchasePaymentProof**
> Resource replacePurchasePaymentProof(id, idempotencyKey, replacePaymentProofCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final ReplacePaymentProofCommand replacePaymentProofCommand = ; // ReplacePaymentProofCommand | 

try {
    final response = api.replacePurchasePaymentProof(id, idempotencyKey, replacePaymentProofCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->replacePurchasePaymentProof: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **replacePaymentProofCommand** | [**ReplacePaymentProofCommand**](ReplacePaymentProofCommand.md)|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **submitPurchase**
> Purchase submitPurchase(idempotencyKey, submitPurchaseRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final SubmitPurchaseRequest submitPurchaseRequest = ; // SubmitPurchaseRequest | 

try {
    final response = api.submitPurchase(idempotencyKey, submitPurchaseRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->submitPurchase: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **submitPurchaseRequest** | [**SubmitPurchaseRequest**](SubmitPurchaseRequest.md)|  | 

### Return type

[**Purchase**](Purchase.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

