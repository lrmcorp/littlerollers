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
[**authorizeOwnOrderPaymentProofView**](PackagesApi.md#authorizeownorderpaymentproofview) | **POST** /orders/{id}/payment-proof/view-authorizations | 
[**authorizePaymentProofDownload**](PackagesApi.md#authorizepaymentproofdownload) | **POST** /uploads/payment-proofs/{id}/download-authorizations | 
[**createOrder**](PackagesApi.md#createorder) | **POST** /orders | 
[**createPackage**](PackagesApi.md#createpackage) | **POST** /packages | 
[**createPaymentProofUpload**](PackagesApi.md#createpaymentproofupload) | **POST** /uploads/payment-proofs | 
[**finalizePaymentProofUpload**](PackagesApi.md#finalizepaymentproofupload) | **POST** /uploads/payment-proofs/{id}/finalize | 
[**getCheckoutOptions**](PackagesApi.md#getcheckoutoptions) | **GET** /checkout/options | 
[**getOrder**](PackagesApi.md#getorder) | **GET** /orders/{id} | 
[**getPaymentProofStatus**](PackagesApi.md#getpaymentproofstatus) | **GET** /uploads/payment-proofs/{id} | 
[**getPaymentReviewDetail**](PackagesApi.md#getpaymentreviewdetail) | **GET** /purchases/{id} | 
[**getPublicPackageDetail**](PackagesApi.md#getpublicpackagedetail) | **GET** /public/package-catalog/{id} | 
[**listOrders**](PackagesApi.md#listorders) | **GET** /orders | 
[**listPackages**](PackagesApi.md#listpackages) | **GET** /packages | 
[**listPublicPackages**](PackagesApi.md#listpublicpackages) | **GET** /public/package-catalog | 
[**listPurchases**](PackagesApi.md#listpurchases) | **GET** /purchases | 
[**rejectPurchase**](PackagesApi.md#rejectpurchase) | **POST** /purchases/{id}/reject | 
[**replacePurchasePaymentProof**](PackagesApi.md#replacepurchasepaymentproof) | **POST** /purchases/{id}/payment-proof-replacements | 
[**submitPurchase**](PackagesApi.md#submitpurchase) | **POST** /purchases | 
[**uploadPaymentProofContent**](PackagesApi.md#uploadpaymentproofcontent) | **PUT** /uploads/payment-proofs/{id}/content | 
[**viewAuthorizedPaymentProofContent**](PackagesApi.md#viewauthorizedpaymentproofcontent) | **GET** /uploads/payment-proofs/view-authorizations/{id}/content | 


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

# **authorizeOwnOrderPaymentProofView**
> PaymentProofViewAuthorization authorizeOwnOrderPaymentProofView(id)



Issues a short-lived one-time authorization for the authenticated customer to view the CLEAN proof currently attached to their own order.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.authorizeOwnOrderPaymentProofView(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->authorizeOwnOrderPaymentProofView: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**PaymentProofViewAuthorization**](PaymentProofViewAuthorization.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authorizePaymentProofDownload**
> PaymentProofViewAuthorization authorizePaymentProofDownload(id)



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

[**PaymentProofViewAuthorization**](PaymentProofViewAuthorization.md)

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
> CheckoutOptions getCheckoutOptions(packageId, branchId)



Approved customer checkout snapshot with the full account number for the selected active package only.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String packageId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | When supplied, must match the package branch.

try {
    final response = api.getCheckoutOptions(packageId, branchId);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->getCheckoutOptions: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **packageId** | **String**|  | 
 **branchId** | **String**| When supplied, must match the package branch. | [optional] 

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

# **getPaymentReviewDetail**
> PaymentReviewDetail getPaymentReviewDetail(id, usageCursor)



Capability and branch-scoped reviewer detail with masked customer, private-proof metadata, authoritative balance, usage history, timeline, and persisted activation result.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String usageCursor = usageCursor_example; // String | 

try {
    final response = api.getPaymentReviewDetail(id, usageCursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->getPaymentReviewDetail: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **usageCursor** | **String**|  | [optional] 

### Return type

[**PaymentReviewDetail**](PaymentReviewDetail.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPublicPackageDetail**
> PublicPackageDetail getPublicPackageDetail(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.getPublicPackageDetail(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->getPublicPackageDetail: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**PublicPackageDetail**](PublicPackageDetail.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listOrders**
> OrderPage listOrders(status, cursor, q, from, until, limit)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String status = status_example; // String | 
final String cursor = cursor_example; // String | 
final String q = q_example; // String | 
final Date from = 2013-10-20; // Date | 
final Date until = 2013-10-20; // Date | 
final int limit = 56; // int | 

try {
    final response = api.listOrders(status, cursor, q, from, until, limit);
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
 **q** | **String**|  | [optional] 
 **from** | **Date**|  | [optional] 
 **until** | **Date**|  | [optional] 
 **limit** | **int**|  | [optional] [default to 20]

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

# **listPublicPackages**
> PublicPackageCatalog listPublicPackages(branchId)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority

try {
    final response = api.listPublicPackages(branchId);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->listPublicPackages: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 

### Return type

[**PublicPackageCatalog**](PublicPackageCatalog.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listPurchases**
> PaymentReviewPage listPurchases(branchId, cursor, status, limit, q, from, until, purchaseId)



Capability-scoped payment review queue. Omitted branchId means every authorized branch, including global scope for Super Owner and Finance.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String cursor = cursor_example; // String | 
final String status = status_example; // String | 
final int limit = 56; // int | 
final String q = q_example; // String | 
final DateTime from = 2013-10-20T19:20:30+01:00; // DateTime | 
final DateTime until = 2013-10-20T19:20:30+01:00; // DateTime | 
final String purchaseId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.listPurchases(branchId, cursor, status, limit, q, from, until, purchaseId);
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
 **limit** | **int**|  | [optional] [default to 20]
 **q** | **String**|  | [optional] 
 **from** | **DateTime**|  | [optional] 
 **until** | **DateTime**|  | [optional] 
 **purchaseId** | **String**|  | [optional] 

### Return type

[**PaymentReviewPage**](PaymentReviewPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

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

# **viewAuthorizedPaymentProofContent**
> Uint8List viewAuthorizedPaymentProofContent(id)



Consumes a one-time viewer-bound payment proof authorization issued for Finance review or customer self-view.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPackagesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.viewAuthorizedPaymentProofContent(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PackagesApi->viewAuthorizedPaymentProofContent: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**Uint8List**](Uint8List.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: image/jpeg, image/png, application/pdf, application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

