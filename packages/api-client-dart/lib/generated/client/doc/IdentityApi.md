# openapi.api.IdentityApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createAssignment**](IdentityApi.md#createassignment) | **POST** /assignments | 
[**deactivateUser**](IdentityApi.md#deactivateuser) | **POST** /users/{id}/deactivate | 
[**endAssignment**](IdentityApi.md#endassignment) | **POST** /assignments/{id}/end | 
[**getMe**](IdentityApi.md#getme) | **GET** /me | 
[**inviteUser**](IdentityApi.md#inviteuser) | **POST** /users | 
[**listAssignments**](IdentityApi.md#listassignments) | **GET** /assignments | 
[**listUsers**](IdentityApi.md#listusers) | **GET** /users | 


# **createAssignment**
> Resource createAssignment(assignmentCommand)



Creates an OWNER or INSTRUCTOR interval and linked role projection atomically. Requires assignment:manage and MFA.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();
final AssignmentCommand assignmentCommand = ; // AssignmentCommand | 

try {
    final response = api.createAssignment(assignmentCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->createAssignment: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **assignmentCommand** | [**AssignmentCommand**](AssignmentCommand.md)|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deactivateUser**
> Resource deactivateUser(id, deactivateUserRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final DeactivateUserRequest deactivateUserRequest = ; // DeactivateUserRequest | 

try {
    final response = api.deactivateUser(id, deactivateUserRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->deactivateUser: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **deactivateUserRequest** | [**DeactivateUserRequest**](DeactivateUserRequest.md)|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **endAssignment**
> Resource endAssignment(id, idempotencyKey, endAssignmentCommand)



Ends the half-open assignment at the start of the branch-local calendar date containing effectiveAt. Requires MFA and expectedVersion.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final EndAssignmentCommand endAssignmentCommand = ; // EndAssignmentCommand | 

try {
    final response = api.endAssignment(id, idempotencyKey, endAssignmentCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->endAssignment: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **endAssignmentCommand** | [**EndAssignmentCommand**](EndAssignmentCommand.md)|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMe**
> Me getMe()



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();

try {
    final response = api.getMe();
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->getMe: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**Me**](Me.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **inviteUser**
> Resource inviteUser(inviteUserRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();
final InviteUserRequest inviteUserRequest = ; // InviteUserRequest | 

try {
    final response = api.inviteUser(inviteUserRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->inviteUser: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **inviteUserRequest** | [**InviteUserRequest**](InviteUserRequest.md)|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listAssignments**
> AssignmentPage listAssignments(branchId, cursor)



Returns assignment intervals visible to the authenticated actor. Foreign branch scope is hidden as RESOURCE_NOT_FOUND.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String cursor = cursor_example; // String | 

try {
    final response = api.listAssignments(branchId, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->listAssignments: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **cursor** | **String**|  | [optional] 

### Return type

[**AssignmentPage**](AssignmentPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listUsers**
> Page listUsers(cursor, branchId)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();
final String cursor = cursor_example; // String | 
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority

try {
    final response = api.listUsers(cursor, branchId);
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->listUsers: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **cursor** | **String**|  | [optional] 
 **branchId** | **String**| Filter only; never grants authority | [optional] 

### Return type

[**Page**](Page.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

