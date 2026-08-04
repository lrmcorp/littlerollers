# openapi.api.MasterApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createBranch**](MasterApi.md#createbranch) | **POST** /branches | 
[**createBranchStudio**](MasterApi.md#createbranchstudio) | **POST** /branches/{id}/studios | 
[**createClassType**](MasterApi.md#createclasstype) | **POST** /class-types | 
[**createEffectiveSetting**](MasterApi.md#createeffectivesetting) | **POST** /master-settings/{kind} | 
[**createInstructorFee**](MasterApi.md#createinstructorfee) | **POST** /instructor-fees | 
[**createPaymentAccount**](MasterApi.md#createpaymentaccount) | **POST** /payment-accounts | 
[**createProjectionRate**](MasterApi.md#createprojectionrate) | **POST** /projection-rates | 
[**createQuotaCapacitySetting**](MasterApi.md#createquotacapacitysetting) | **POST** /quota-capacity-settings | 
[**createStudioRoom**](MasterApi.md#createstudioroom) | **POST** /studios/{id}/rooms | 
[**deactivateBranch**](MasterApi.md#deactivatebranch) | **POST** /branches/{id}/deactivate | 
[**deactivateClassType**](MasterApi.md#deactivateclasstype) | **POST** /class-types/{id}/deactivate | 
[**deactivatePaymentAccount**](MasterApi.md#deactivatepaymentaccount) | **POST** /payment-accounts/{id}/deactivate | 
[**getBranch**](MasterApi.md#getbranch) | **GET** /branches/{id} | 
[**getPaymentAccount**](MasterApi.md#getpaymentaccount) | **GET** /payment-accounts/{id} | 
[**getPublicStudioDetail**](MasterApi.md#getpublicstudiodetail) | **GET** /public/studios/{slug} | 
[**listBranchStudios**](MasterApi.md#listbranchstudios) | **GET** /branches/{id}/studios | 
[**listBranches**](MasterApi.md#listbranches) | **GET** /branches | 
[**listClassTypes**](MasterApi.md#listclasstypes) | **GET** /class-types | 
[**listEffectiveSettings**](MasterApi.md#listeffectivesettings) | **GET** /master-settings/{kind} | 
[**listInstructorFees**](MasterApi.md#listinstructorfees) | **GET** /instructor-fees | 
[**listPaymentAccounts**](MasterApi.md#listpaymentaccounts) | **GET** /payment-accounts | 
[**listProjectionRates**](MasterApi.md#listprojectionrates) | **GET** /projection-rates | 
[**listQuotaCapacitySettings**](MasterApi.md#listquotacapacitysettings) | **GET** /quota-capacity-settings | 
[**listStudioRooms**](MasterApi.md#liststudiorooms) | **GET** /studios/{id}/rooms | 
[**reactivateBranch**](MasterApi.md#reactivatebranch) | **POST** /branches/{id}/reactivate | 
[**reactivateClassType**](MasterApi.md#reactivateclasstype) | **POST** /class-types/{id}/reactivate | 
[**reactivatePaymentAccount**](MasterApi.md#reactivatepaymentaccount) | **POST** /payment-accounts/{id}/reactivate | 
[**replaceClassTypeBranchScopes**](MasterApi.md#replaceclasstypebranchscopes) | **PUT** /class-types/{id}/scopes | 
[**updateBranch**](MasterApi.md#updatebranch) | **PATCH** /branches/{id} | 
[**updateClassType**](MasterApi.md#updateclasstype) | **PATCH** /class-types/{id} | 
[**updateRoom**](MasterApi.md#updateroom) | **PATCH** /rooms/{id} | 
[**updateStudio**](MasterApi.md#updatestudio) | **PATCH** /studios/{id} | 


# **createBranch**
> Branch createBranch(idempotencyKey, branchCommand)



Creates an active branch. Requires master:manage.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final BranchCommand branchCommand = ; // BranchCommand | 

try {
    final response = api.createBranch(idempotencyKey, branchCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->createBranch: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **branchCommand** | [**BranchCommand**](BranchCommand.md)|  | 

### Return type

[**Branch**](Branch.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createBranchStudio**
> Studio createBranchStudio(id, studioCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final StudioCommand studioCommand = ; // StudioCommand | 

try {
    final response = api.createBranchStudio(id, studioCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->createBranchStudio: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **studioCommand** | [**StudioCommand**](StudioCommand.md)|  | 

### Return type

[**Studio**](Studio.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createClassType**
> ClassType createClassType(classTypeCommand)



Creates one global class type. Optional branchIds create explicit availability scopes; no active branch selection is required.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final ClassTypeCommand classTypeCommand = ; // ClassTypeCommand | 

try {
    final response = api.createClassType(classTypeCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->createClassType: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **classTypeCommand** | [**ClassTypeCommand**](ClassTypeCommand.md)|  | 

### Return type

[**ClassType**](ClassType.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createEffectiveSetting**
> Resource createEffectiveSetting(kind, effectiveSettingCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String kind = kind_example; // String | 
final EffectiveSettingCommand effectiveSettingCommand = ; // EffectiveSettingCommand | 

try {
    final response = api.createEffectiveSetting(kind, effectiveSettingCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->createEffectiveSetting: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **kind** | **String**|  | 
 **effectiveSettingCommand** | [**EffectiveSettingCommand**](EffectiveSettingCommand.md)|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createInstructorFee**
> Resource createInstructorFee(instructorFeeCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final InstructorFeeCommand instructorFeeCommand = ; // InstructorFeeCommand | 

try {
    final response = api.createInstructorFee(instructorFeeCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->createInstructorFee: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **instructorFeeCommand** | [**InstructorFeeCommand**](InstructorFeeCommand.md)|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createPaymentAccount**
> PaymentAccount createPaymentAccount(paymentAccountCommand)



Creates the single active account for a branch. Requires Super Owner payment-account permission.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final PaymentAccountCommand paymentAccountCommand = ; // PaymentAccountCommand | 

try {
    final response = api.createPaymentAccount(paymentAccountCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->createPaymentAccount: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **paymentAccountCommand** | [**PaymentAccountCommand**](PaymentAccountCommand.md)|  | 

### Return type

[**PaymentAccount**](PaymentAccount.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createProjectionRate**
> Resource createProjectionRate(projectionRateCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final ProjectionRateCommand projectionRateCommand = ; // ProjectionRateCommand | 

try {
    final response = api.createProjectionRate(projectionRateCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->createProjectionRate: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **projectionRateCommand** | [**ProjectionRateCommand**](ProjectionRateCommand.md)|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createQuotaCapacitySetting**
> Resource createQuotaCapacitySetting(quotaCapacityCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final QuotaCapacityCommand quotaCapacityCommand = ; // QuotaCapacityCommand | 

try {
    final response = api.createQuotaCapacitySetting(quotaCapacityCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->createQuotaCapacitySetting: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **quotaCapacityCommand** | [**QuotaCapacityCommand**](QuotaCapacityCommand.md)|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createStudioRoom**
> Room createStudioRoom(id, roomCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final RoomCommand roomCommand = ; // RoomCommand | 

try {
    final response = api.createStudioRoom(id, roomCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->createStudioRoom: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **roomCommand** | [**RoomCommand**](RoomCommand.md)|  | 

### Return type

[**Room**](Room.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deactivateBranch**
> Branch deactivateBranch(id, idempotencyKey, body)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final ReasonedVersionCommand body = ; // ReasonedVersionCommand | 

try {
    final response = api.deactivateBranch(id, idempotencyKey, body);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->deactivateBranch: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **body** | **ReasonedVersionCommand**|  | 

### Return type

[**Branch**](Branch.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deactivateClassType**
> ClassType deactivateClassType(id, idempotencyKey, reasonedVersionCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final ReasonedVersionCommand reasonedVersionCommand = ; // ReasonedVersionCommand | 

try {
    final response = api.deactivateClassType(id, idempotencyKey, reasonedVersionCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->deactivateClassType: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **reasonedVersionCommand** | [**ReasonedVersionCommand**](ReasonedVersionCommand.md)|  | 

### Return type

[**ClassType**](ClassType.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deactivatePaymentAccount**
> PaymentAccount deactivatePaymentAccount(id, idempotencyKey, reasonedVersionCommand)



Blocked while non-expired AWAITING_PAYMENT orders reference the account.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final ReasonedVersionCommand reasonedVersionCommand = ; // ReasonedVersionCommand | 

try {
    final response = api.deactivatePaymentAccount(id, idempotencyKey, reasonedVersionCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->deactivatePaymentAccount: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **reasonedVersionCommand** | [**ReasonedVersionCommand**](ReasonedVersionCommand.md)|  | 

### Return type

[**PaymentAccount**](PaymentAccount.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getBranch**
> BranchManagementDetail getBranch(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.getBranch(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->getBranch: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**BranchManagementDetail**](BranchManagementDetail.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPaymentAccount**
> PaymentAccountDetail getPaymentAccount(id)



Returns masked account detail and safe dependency count.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.getPaymentAccount(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->getPaymentAccount: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**PaymentAccountDetail**](PaymentAccountDetail.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPublicStudioDetail**
> PublicStudioDetail getPublicStudioDetail(slug)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String slug = slug_example; // String | 

try {
    final response = api.getPublicStudioDetail(slug);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->getPublicStudioDetail: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **slug** | **String**|  | 

### Return type

[**PublicStudioDetail**](PublicStudioDetail.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listBranchStudios**
> StudioPage listBranchStudios(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.listBranchStudios(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->listBranchStudios: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**StudioPage**](StudioPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listBranches**
> BranchPage listBranches(q, status, cursor, limit)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String q = q_example; // String | 
final String status = status_example; // String | 
final String cursor = cursor_example; // String | 
final int limit = 56; // int | 

try {
    final response = api.listBranches(q, status, cursor, limit);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->listBranches: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **q** | **String**|  | [optional] 
 **status** | **String**|  | [optional] 
 **cursor** | **String**|  | [optional] 
 **limit** | **int**|  | [optional] [default to 20]

### Return type

[**BranchPage**](BranchPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listClassTypes**
> ClassTypePage listClassTypes(branchId)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority

try {
    final response = api.listClassTypes(branchId);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->listClassTypes: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 

### Return type

[**ClassTypePage**](ClassTypePage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listEffectiveSettings**
> Page listEffectiveSettings(kind, branchId)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String kind = kind_example; // String | 
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority

try {
    final response = api.listEffectiveSettings(kind, branchId);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->listEffectiveSettings: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **kind** | **String**|  | 
 **branchId** | **String**| Filter only; never grants authority | [optional] 

### Return type

[**Page**](Page.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listInstructorFees**
> EffectiveSettingPage listInstructorFees(branchId, cursor)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String cursor = cursor_example; // String | 

try {
    final response = api.listInstructorFees(branchId, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->listInstructorFees: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **cursor** | **String**|  | [optional] 

### Return type

[**EffectiveSettingPage**](EffectiveSettingPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listPaymentAccounts**
> ListPaymentAccounts200Response listPaymentAccounts(branchId)



Returns masked account metadata only. Requires payment-account:read.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority

try {
    final response = api.listPaymentAccounts(branchId);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->listPaymentAccounts: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 

### Return type

[**ListPaymentAccounts200Response**](ListPaymentAccounts200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listProjectionRates**
> EffectiveSettingPage listProjectionRates(branchId, cursor)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String cursor = cursor_example; // String | 

try {
    final response = api.listProjectionRates(branchId, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->listProjectionRates: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **cursor** | **String**|  | [optional] 

### Return type

[**EffectiveSettingPage**](EffectiveSettingPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listQuotaCapacitySettings**
> EffectiveSettingPage listQuotaCapacitySettings(branchId, cursor)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String cursor = cursor_example; // String | 

try {
    final response = api.listQuotaCapacitySettings(branchId, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->listQuotaCapacitySettings: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **cursor** | **String**|  | [optional] 

### Return type

[**EffectiveSettingPage**](EffectiveSettingPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listStudioRooms**
> RoomPage listStudioRooms(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.listStudioRooms(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->listStudioRooms: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**RoomPage**](RoomPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **reactivateBranch**
> Branch reactivateBranch(id, idempotencyKey, body)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final ReasonedVersionCommand body = ; // ReasonedVersionCommand | 

try {
    final response = api.reactivateBranch(id, idempotencyKey, body);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->reactivateBranch: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **body** | **ReasonedVersionCommand**|  | 

### Return type

[**Branch**](Branch.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **reactivateClassType**
> ClassType reactivateClassType(id, idempotencyKey, reasonedVersionCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final ReasonedVersionCommand reasonedVersionCommand = ; // ReasonedVersionCommand | 

try {
    final response = api.reactivateClassType(id, idempotencyKey, reasonedVersionCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->reactivateClassType: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **reasonedVersionCommand** | [**ReasonedVersionCommand**](ReasonedVersionCommand.md)|  | 

### Return type

[**ClassType**](ClassType.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **reactivatePaymentAccount**
> PaymentAccount reactivatePaymentAccount(id, idempotencyKey, reasonedVersionCommand)



Reactivates a historical account only when its branch is active and has no other active payment account.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final ReasonedVersionCommand reasonedVersionCommand = ; // ReasonedVersionCommand | 

try {
    final response = api.reactivatePaymentAccount(id, idempotencyKey, reasonedVersionCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->reactivatePaymentAccount: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **reasonedVersionCommand** | [**ReasonedVersionCommand**](ReasonedVersionCommand.md)|  | 

### Return type

[**PaymentAccount**](PaymentAccount.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **replaceClassTypeBranchScopes**
> ClassType replaceClassTypeBranchScopes(id, classTypeScopeCommand)



Replaces the explicit Studio/Cabang availability scopes for a global class type. \"All\" is expanded by the client to the active branch IDs at decision time.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final ClassTypeScopeCommand classTypeScopeCommand = ; // ClassTypeScopeCommand | 

try {
    final response = api.replaceClassTypeBranchScopes(id, classTypeScopeCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->replaceClassTypeBranchScopes: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **classTypeScopeCommand** | [**ClassTypeScopeCommand**](ClassTypeScopeCommand.md)|  | 

### Return type

[**ClassType**](ClassType.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateBranch**
> Branch updateBranch(id, idempotencyKey, branchUpdateCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final BranchUpdateCommand branchUpdateCommand = ; // BranchUpdateCommand | 

try {
    final response = api.updateBranch(id, idempotencyKey, branchUpdateCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->updateBranch: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **branchUpdateCommand** | [**BranchUpdateCommand**](BranchUpdateCommand.md)|  | 

### Return type

[**Branch**](Branch.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateClassType**
> ClassType updateClassType(id, idempotencyKey, classTypeUpdateCommand)



Updates safe class-type metadata. Branch and business code remain immutable.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final ClassTypeUpdateCommand classTypeUpdateCommand = ; // ClassTypeUpdateCommand | 

try {
    final response = api.updateClassType(id, idempotencyKey, classTypeUpdateCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->updateClassType: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **classTypeUpdateCommand** | [**ClassTypeUpdateCommand**](ClassTypeUpdateCommand.md)|  | 

### Return type

[**ClassType**](ClassType.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateRoom**
> Room updateRoom(id, roomUpdateCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final RoomUpdateCommand roomUpdateCommand = ; // RoomUpdateCommand | 

try {
    final response = api.updateRoom(id, roomUpdateCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->updateRoom: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **roomUpdateCommand** | [**RoomUpdateCommand**](RoomUpdateCommand.md)|  | 

### Return type

[**Room**](Room.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateStudio**
> Studio updateStudio(id, studioUpdateCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final StudioUpdateCommand studioUpdateCommand = ; // StudioUpdateCommand | 

try {
    final response = api.updateStudio(id, studioUpdateCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->updateStudio: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **studioUpdateCommand** | [**StudioUpdateCommand**](StudioUpdateCommand.md)|  | 

### Return type

[**Studio**](Studio.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

