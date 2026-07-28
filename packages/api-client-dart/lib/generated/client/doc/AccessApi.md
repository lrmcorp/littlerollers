# openapi.api.AccessApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createAccessRole**](AccessApi.md#createaccessrole) | **POST** /access/roles | 
[**createUserPermissionOverride**](AccessApi.md#createuserpermissionoverride) | **POST** /users/{id}/permission-overrides | 
[**deactivateAccessRole**](AccessApi.md#deactivateaccessrole) | **POST** /access/roles/{id}/deactivate | 
[**getAccessRole**](AccessApi.md#getaccessrole) | **GET** /access/roles/{id} | 
[**getUserAccess**](AccessApi.md#getuseraccess) | **GET** /users/{id}/access | 
[**listAccessRoles**](AccessApi.md#listaccessroles) | **GET** /access/roles | 
[**listCapabilityDefinitions**](AccessApi.md#listcapabilitydefinitions) | **GET** /access/capabilities | 
[**replaceAccessRoleCapabilities**](AccessApi.md#replaceaccessrolecapabilities) | **PUT** /access/roles/{id}/capabilities | 
[**replaceUserAccessRoles**](AccessApi.md#replaceuseraccessroles) | **PUT** /users/{id}/access/roles | 
[**revokeUserPermissionOverride**](AccessApi.md#revokeuserpermissionoverride) | **POST** /users/{id}/permission-overrides/{overrideId}/revoke | 
[**updateAccessRole**](AccessApi.md#updateaccessrole) | **PATCH** /access/roles/{id} | 


# **createAccessRole**
> AccessRoleDefinition createAccessRole(idempotencyKey, createAccessRoleCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAccessApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final CreateAccessRoleCommand createAccessRoleCommand = ; // CreateAccessRoleCommand | 

try {
    final response = api.createAccessRole(idempotencyKey, createAccessRoleCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AccessApi->createAccessRole: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **createAccessRoleCommand** | [**CreateAccessRoleCommand**](CreateAccessRoleCommand.md)|  | 

### Return type

[**AccessRoleDefinition**](AccessRoleDefinition.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createUserPermissionOverride**
> Resource createUserPermissionOverride(id, idempotencyKey, createPermissionOverrideCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAccessApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final CreatePermissionOverrideCommand createPermissionOverrideCommand = ; // CreatePermissionOverrideCommand | 

try {
    final response = api.createUserPermissionOverride(id, idempotencyKey, createPermissionOverrideCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AccessApi->createUserPermissionOverride: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **createPermissionOverrideCommand** | [**CreatePermissionOverrideCommand**](CreatePermissionOverrideCommand.md)|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deactivateAccessRole**
> Resource deactivateAccessRole(id, idempotencyKey, versionedAccessReason)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAccessApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final VersionedAccessReason versionedAccessReason = ; // VersionedAccessReason | 

try {
    final response = api.deactivateAccessRole(id, idempotencyKey, versionedAccessReason);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AccessApi->deactivateAccessRole: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **versionedAccessReason** | [**VersionedAccessReason**](VersionedAccessReason.md)|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAccessRole**
> AccessRoleDefinition getAccessRole(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAccessApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.getAccessRole(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AccessApi->getAccessRole: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**AccessRoleDefinition**](AccessRoleDefinition.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUserAccess**
> UserAccess getUserAccess(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAccessApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.getUserAccess(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AccessApi->getUserAccess: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**UserAccess**](UserAccess.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listAccessRoles**
> AccessRolePage listAccessRoles(q, scope, active)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAccessApi();
final String q = q_example; // String | 
final AccessRoleScope scope = ; // AccessRoleScope | 
final bool active = true; // bool | 

try {
    final response = api.listAccessRoles(q, scope, active);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AccessApi->listAccessRoles: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **q** | **String**|  | [optional] 
 **scope** | [**AccessRoleScope**](.md)|  | [optional] 
 **active** | **bool**|  | [optional] 

### Return type

[**AccessRolePage**](AccessRolePage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listCapabilityDefinitions**
> CapabilityDefinitionPage listCapabilityDefinitions(q, category, sensitive, active)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAccessApi();
final String q = q_example; // String | 
final String category = category_example; // String | 
final bool sensitive = true; // bool | 
final bool active = true; // bool | 

try {
    final response = api.listCapabilityDefinitions(q, category, sensitive, active);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AccessApi->listCapabilityDefinitions: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **q** | **String**|  | [optional] 
 **category** | **String**|  | [optional] 
 **sensitive** | **bool**|  | [optional] 
 **active** | **bool**|  | [optional] 

### Return type

[**CapabilityDefinitionPage**](CapabilityDefinitionPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **replaceAccessRoleCapabilities**
> AccessRoleDefinition replaceAccessRoleCapabilities(id, idempotencyKey, replaceRoleCapabilitiesCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAccessApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final ReplaceRoleCapabilitiesCommand replaceRoleCapabilitiesCommand = ; // ReplaceRoleCapabilitiesCommand | 

try {
    final response = api.replaceAccessRoleCapabilities(id, idempotencyKey, replaceRoleCapabilitiesCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AccessApi->replaceAccessRoleCapabilities: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **replaceRoleCapabilitiesCommand** | [**ReplaceRoleCapabilitiesCommand**](ReplaceRoleCapabilitiesCommand.md)|  | 

### Return type

[**AccessRoleDefinition**](AccessRoleDefinition.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **replaceUserAccessRoles**
> Resource replaceUserAccessRoles(id, idempotencyKey, replaceUserAccessRolesCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAccessApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final ReplaceUserAccessRolesCommand replaceUserAccessRolesCommand = ; // ReplaceUserAccessRolesCommand | 

try {
    final response = api.replaceUserAccessRoles(id, idempotencyKey, replaceUserAccessRolesCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AccessApi->replaceUserAccessRoles: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **replaceUserAccessRolesCommand** | [**ReplaceUserAccessRolesCommand**](ReplaceUserAccessRolesCommand.md)|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **revokeUserPermissionOverride**
> Resource revokeUserPermissionOverride(id, overrideId, idempotencyKey, versionedAccessReason)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAccessApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String overrideId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final VersionedAccessReason versionedAccessReason = ; // VersionedAccessReason | 

try {
    final response = api.revokeUserPermissionOverride(id, overrideId, idempotencyKey, versionedAccessReason);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AccessApi->revokeUserPermissionOverride: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **overrideId** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **versionedAccessReason** | [**VersionedAccessReason**](VersionedAccessReason.md)|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateAccessRole**
> AccessRoleDefinition updateAccessRole(id, idempotencyKey, updateAccessRoleCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAccessApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final UpdateAccessRoleCommand updateAccessRoleCommand = ; // UpdateAccessRoleCommand | 

try {
    final response = api.updateAccessRole(id, idempotencyKey, updateAccessRoleCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AccessApi->updateAccessRole: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **updateAccessRoleCommand** | [**UpdateAccessRoleCommand**](UpdateAccessRoleCommand.md)|  | 

### Return type

[**AccessRoleDefinition**](AccessRoleDefinition.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

