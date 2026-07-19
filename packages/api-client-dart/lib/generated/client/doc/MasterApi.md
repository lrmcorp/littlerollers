# openapi.api.MasterApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createBranch**](MasterApi.md#createbranch) | **POST** /branches | 
[**createClassType**](MasterApi.md#createclasstype) | **POST** /class-types | 
[**createEffectiveSetting**](MasterApi.md#createeffectivesetting) | **POST** /master-settings/{kind} | 
[**createInstructorFee**](MasterApi.md#createinstructorfee) | **POST** /instructor-fees | 
[**createProjectionRate**](MasterApi.md#createprojectionrate) | **POST** /projection-rates | 
[**createQuotaCapacitySetting**](MasterApi.md#createquotacapacitysetting) | **POST** /quota-capacity-settings | 
[**deactivateBranch**](MasterApi.md#deactivatebranch) | **POST** /branches/{id}/deactivate | 
[**deactivateClassType**](MasterApi.md#deactivateclasstype) | **POST** /class-types/{id}/deactivate | 
[**listBranches**](MasterApi.md#listbranches) | **GET** /branches | 
[**listClassTypes**](MasterApi.md#listclasstypes) | **GET** /class-types | 
[**listEffectiveSettings**](MasterApi.md#listeffectivesettings) | **GET** /master-settings/{kind} | 
[**listInstructorFees**](MasterApi.md#listinstructorfees) | **GET** /instructor-fees | 
[**listProjectionRates**](MasterApi.md#listprojectionrates) | **GET** /projection-rates | 
[**listQuotaCapacitySettings**](MasterApi.md#listquotacapacitysettings) | **GET** /quota-capacity-settings | 


# **createBranch**
> Branch createBranch(branchCommand)



Creates an active branch. Requires master:manage and MFA.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final BranchCommand branchCommand = ; // BranchCommand | 

try {
    final response = api.createBranch(branchCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->createBranch: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchCommand** | [**BranchCommand**](BranchCommand.md)|  | 

### Return type

[**Branch**](Branch.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createClassType**
> ClassType createClassType(classTypeCommand)



Creates an active class type in one visible branch. Requires master:manage and MFA.

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

# **deactivateBranch**
> Branch deactivateBranch(id, versionCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final VersionCommand versionCommand = ; // VersionCommand | 

try {
    final response = api.deactivateBranch(id, versionCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->deactivateBranch: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **versionCommand** | [**VersionCommand**](VersionCommand.md)|  | 

### Return type

[**Branch**](Branch.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deactivateClassType**
> ClassType deactivateClassType(id, versionCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final VersionCommand versionCommand = ; // VersionCommand | 

try {
    final response = api.deactivateClassType(id, versionCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->deactivateClassType: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **versionCommand** | [**VersionCommand**](VersionCommand.md)|  | 

### Return type

[**ClassType**](ClassType.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listBranches**
> BranchPage listBranches()



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getMasterApi();

try {
    final response = api.listBranches();
    print(response);
} catch on DioException (e) {
    print('Exception when calling MasterApi->listBranches: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

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

