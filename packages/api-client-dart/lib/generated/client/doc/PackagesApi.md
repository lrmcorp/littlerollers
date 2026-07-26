# openapi.api.PackagesApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**approvePurchase**](PackagesApi.md#approvepurchase) | **POST** /purchases/{id}/approve | 
[**attachOrderPaymentProof**](PackagesApi.md#attachorderpaymentproof) | **POST** /orders/{id}/payment-proof | 
[**authorizePaymentProofDownload**](PackagesApi.md#authorizepaymentproofdownload) | **POST** /uploads/payment-proofs/{id}/download-authorizations | 
[**createOrder**](PackagesApi.md#createorder) | **POST** /orders | 
[**createPackage**](PackagesApi.md#createpackage) | **POST** /packages | 
[**createPaymentProofUpload**](PackagesApi.md#createpaymentproofupload) | **POST** /uploads/payment-proofs | 
[**finalizePaymentProofUpload**](PackagesApi.md#finalizepaymentproofupload) | **POST** /uploads/payment-proofs/{id}/finalize | 
[**getCheckoutOptions**](PackagesApi.md#getcheckoutoptions) | **GET** /checkout/options | 
[**getOrder**](PackagesApi.md#getorder) | **GET** /orders/{id} | 
[**getPaymentProofStatus**](PackagesApi.md#getpaymentproofstatus) | **GET** /uploads/payment-proofs/{id} | 
[**listOrders**](PackagesApi.md#listorders) | **GET** /orders | 
[**listPackages**](PackagesApi.md#listpackages) | **GET** /packages | 
[**listPurchases**](PackagesApi.md#listpurchases) | **GET** /purchases | 
[**rejectPurchase**](PackagesApi.md#rejectpurchase) | **POST** /purchases/{id}/reject | 
[**replacePurchasePaymentProof**](PackagesApi.md#replacepurchasepaymentproof) | **POST** /purchases/{id}/payment-proof-replacements | 
[**submitPurchase**](PackagesApi.md#submitpurchase) | **POST** /purchases | 
[**uploadPaymentProofContent**](PackagesApi.md#uploadpaymentproofcontent) | **PUT** /uploads/payment-proofs/{id}/content | 


# **approvePurchase**
> ApprovalResult approvePurchase(id, idempotencyKey, approvePurchaseRequest)



Permission-gated atomic decision. Activation is the approval date in branch timezone; expiry is exclusive at the start of activationDate + durationDays.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final ApprovePurchaseRequest approvePurchaseRequest = ; // ApprovePurchaseRequest | 

try {
    final response = api.approvePurchase(id, idempotencyKey, approvePurchaseRequest);
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
 **approvePurchaseRequest** | [**ApprovePurchaseRequest**](ApprovePurchaseRequest.md)|  | 

### Return type

[**ApprovalResult**](ApprovalResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **attachOrderPaymentProof**
> Order attachOrderPaymentProof(id, attachOrderProofCommand)



Attaches a CLEAN finalized private upload and transitions the same order to PENDING.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final AttachOrderProofCommand attachOrderProofCommand = ; // AttachOrderProofCommand | 

try {
    final response = api.attachOrderPaymentProof(id, attachOrderProofCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->attachOrderPaymentProof: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **attachOrderProofCommand** | [**AttachOrderProofCommand**](AttachOrderProofCommand.md)|  | 

### Return type

[**Order**](Order.md)

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

# **createOrder**
> Order createOrder(idempotencyKey, createOrderCommand)



Creates AWAITING_PAYMENT before transfer with commercial and destination-account snapshots.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final CreateOrderCommand createOrderCommand = ; // CreateOrderCommand | 

try {
    final response = api.createOrder(idempotencyKey, createOrderCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->createOrder: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **createOrderCommand** | [**CreateOrderCommand**](CreateOrderCommand.md)|  | 

### Return type

[**Order**](Order.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
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
> PaymentProofUploadInstruction createPaymentProofUpload(createPaymentProofUploadRequest)



Issues an opaque private upload reference after metadata, order ownership and expiry validation.

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

[**PaymentProofUploadInstruction**](PaymentProofUploadInstruction.md)

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

# **getCheckoutOptions**
> CheckoutOptions getCheckoutOptions(packageId)



Approved customer checkout snapshot with the full account number for the selected active package only.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String packageId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.getCheckoutOptions(packageId);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->getCheckoutOptions: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **packageId** | **String**|  | 

### Return type

[**CheckoutOptions**](CheckoutOptions.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getOrder**
> Order getOrder(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.getOrder(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->getOrder: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**Order**](Order.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
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

# **listOrders**
> OrderPage listOrders(status, cursor)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String status = status_example; // String | 
final String cursor = cursor_example; // String | 

try {
    final response = api.listOrders(status, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->listOrders: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **status** | **String**|  | [optional] 
 **cursor** | **String**|  | [optional] 

### Return type

[**OrderPage**](OrderPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listPackages**
> PackagePage listPackages(branchId, cursor)



Returns ACTIVE packages effective for the requested scoped branch. Commercial periods are half-open [effectiveFrom,effectiveUntil).

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

[**PackagePage**](PackagePage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listPurchases**
> PurchasePage listPurchases(branchId, cursor, status)



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

[**PurchasePage**](PurchasePage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **rejectPurchase**
> Purchase rejectPurchase(id, idempotencyKey, approvePurchaseRequest)



Permission-gated rejection. Creates no customer package or ledger entry.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final ApprovePurchaseRequest approvePurchaseRequest = ; // ApprovePurchaseRequest | 

try {
    final response = api.rejectPurchase(id, idempotencyKey, approvePurchaseRequest);
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
 **approvePurchaseRequest** | [**ApprovePurchaseRequest**](ApprovePurchaseRequest.md)|  | 

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

# **uploadPaymentProofContent**
> PaymentProof uploadPaymentProofContent(id, body)



Moves actual bytes into private storage after ownership, size, checksum, extension and MIME-signature validation.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final MultipartFile body = BINARY_DATA_HERE; // MultipartFile | 

try {
    final response = api.uploadPaymentProofContent(id, body);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->uploadPaymentProofContent: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **body** | **MultipartFile**|  | 

### Return type

[**PaymentProof**](PaymentProof.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/octet-stream
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

