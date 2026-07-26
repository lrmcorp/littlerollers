# openapi.api.IdentityApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**authorizeIdentityVerificationView**](IdentityApi.md#authorizeidentityverificationview) | **POST** /identity-verifications/{id}/view-authorizations | 
[**createAssignment**](IdentityApi.md#createassignment) | **POST** /assignments | 
[**deactivateUser**](IdentityApi.md#deactivateuser) | **POST** /users/{id}/deactivate | 
[**decideIdentityVerification**](IdentityApi.md#decideidentityverification) | **POST** /identity-verifications/{id}/decisions/{decision} | 
[**deleteIdentityVerificationFile**](IdentityApi.md#deleteidentityverificationfile) | **POST** /identity-verifications/{id}/delete | 
[**endAssignment**](IdentityApi.md#endassignment) | **POST** /assignments/{id}/end | 
[**getMe**](IdentityApi.md#getme) | **GET** /me | 
[**getMyIdentityVerification**](IdentityApi.md#getmyidentityverification) | **GET** /identity-verification/me | 
[**getRoleCatalog**](IdentityApi.md#getrolecatalog) | **GET** /users/role-catalog | 
[**getUser**](IdentityApi.md#getuser) | **GET** /users/{id} | 
[**inviteUser**](IdentityApi.md#inviteuser) | **POST** /users | 
[**listAssignments**](IdentityApi.md#listassignments) | **GET** /assignments | 
[**listIdentityVerifications**](IdentityApi.md#listidentityverifications) | **GET** /identity-verifications | 
[**listUserAudit**](IdentityApi.md#listuseraudit) | **GET** /users/{id}/audit | 
[**listUsers**](IdentityApi.md#listusers) | **GET** /users | 
[**lookupInstructors**](IdentityApi.md#lookupinstructors) | **GET** /lookups/instructors | 
[**lookupUsers**](IdentityApi.md#lookupusers) | **GET** /lookups/users | 
[**reactivateUser**](IdentityApi.md#reactivateuser) | **POST** /users/{id}/reactivate | 
[**replaceMyIdentityDocument**](IdentityApi.md#replacemyidentitydocument) | **POST** /identity-verification/me/documents/{kind}/replacements | 
[**requestUserPasswordSetup**](IdentityApi.md#requestuserpasswordsetup) | **POST** /users/{id}/password-setup-requests | 
[**updateUserRoles**](IdentityApi.md#updateuserroles) | **POST** /users/{id}/roles | 


# **authorizeIdentityVerificationView**
> AuthorizeIdentityVerificationView200Response authorizeIdentityVerificationView(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.authorizeIdentityVerificationView(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->authorizeIdentityVerificationView: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**AuthorizeIdentityVerificationView200Response**](AuthorizeIdentityVerificationView200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createAssignment**
> Resource createAssignment(assignmentCommand)



Creates an OWNER or INSTRUCTOR interval and linked role projection atomically. Requires assignment:manage.

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

# **decideIdentityVerification**
> IdentityVerificationDocument decideIdentityVerification(id, decision, identityVerificationDecisionCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String decision = decision_example; // String | 
final IdentityVerificationDecisionCommand identityVerificationDecisionCommand = ; // IdentityVerificationDecisionCommand | 

try {
    final response = api.decideIdentityVerification(id, decision, identityVerificationDecisionCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->decideIdentityVerification: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **decision** | **String**|  | 
 **identityVerificationDecisionCommand** | [**IdentityVerificationDecisionCommand**](IdentityVerificationDecisionCommand.md)|  | 

### Return type

[**IdentityVerificationDocument**](IdentityVerificationDocument.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteIdentityVerificationFile**
> Resource deleteIdentityVerificationFile(id, deleteIdentityVerificationFileRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final DeleteIdentityVerificationFileRequest deleteIdentityVerificationFileRequest = ; // DeleteIdentityVerificationFileRequest | 

try {
    final response = api.deleteIdentityVerificationFile(id, deleteIdentityVerificationFileRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->deleteIdentityVerificationFile: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **deleteIdentityVerificationFileRequest** | [**DeleteIdentityVerificationFileRequest**](DeleteIdentityVerificationFileRequest.md)|  | 

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



Ends the half-open assignment at the start of the branch-local calendar date containing effectiveAt. Requires assignment:manage and expectedVersion.

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
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyIdentityVerification**
> IdentityVerificationSummary getMyIdentityVerification()



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();

try {
    final response = api.getMyIdentityVerification();
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->getMyIdentityVerification: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**IdentityVerificationSummary**](IdentityVerificationSummary.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getRoleCatalog**
> RoleCatalog getRoleCatalog()



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();

try {
    final response = api.getRoleCatalog();
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->getRoleCatalog: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**RoleCatalog**](RoleCatalog.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUser**
> UserSummary getUser(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.getUser(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->getUser: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**UserSummary**](UserSummary.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

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

# **listIdentityVerifications**
> ListIdentityVerifications200Response listIdentityVerifications(status)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();
final String status = status_example; // String | 

try {
    final response = api.listIdentityVerifications(status);
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->listIdentityVerifications: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **status** | **String**|  | [optional] 

### Return type

[**ListIdentityVerifications200Response**](ListIdentityVerifications200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listUserAudit**
> AuditLogPage listUserAudit(id, cursor)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String cursor = cursor_example; // String | 

try {
    final response = api.listUserAudit(id, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->listUserAudit: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **cursor** | **String**|  | [optional] 

### Return type

[**AuditLogPage**](AuditLogPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listUsers**
> UserPage listUsers(cursor, branchId, search, status, role)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();
final String cursor = cursor_example; // String | 
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String search = search_example; // String | 
final String status = status_example; // String | 
final Role role = ; // Role | 

try {
    final response = api.listUsers(cursor, branchId, search, status, role);
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
 **search** | **String**|  | [optional] 
 **status** | **String**|  | [optional] 
 **role** | [**Role**](.md)|  | [optional] 

### Return type

[**UserPage**](UserPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **lookupInstructors**
> LookupPage lookupInstructors(q, branchId, cursor, limit)



Returns active instructors visible in the requested branch. Requires master:read or class-slot read/manage.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();
final String q = q_example; // String | 
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String cursor = cursor_example; // String | 
final int limit = 56; // int | 

try {
    final response = api.lookupInstructors(q, branchId, cursor, limit);
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->lookupInstructors: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **q** | **String**|  | [optional] 
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **cursor** | **String**|  | [optional] 
 **limit** | **int**|  | [optional] [default to 20]

### Return type

[**LookupPage**](LookupPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **lookupUsers**
> LookupPage lookupUsers(q, branchId, cursor, limit)



Returns a minimal, branch-scoped user selector payload. Requires user:read or audit:read.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();
final String q = q_example; // String | 
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String cursor = cursor_example; // String | 
final int limit = 56; // int | 

try {
    final response = api.lookupUsers(q, branchId, cursor, limit);
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->lookupUsers: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **q** | **String**|  | [optional] 
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **cursor** | **String**|  | [optional] 
 **limit** | **int**|  | [optional] [default to 20]

### Return type

[**LookupPage**](LookupPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **reactivateUser**
> Resource reactivateUser(id, deactivateUserRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final DeactivateUserRequest deactivateUserRequest = ; // DeactivateUserRequest | 

try {
    final response = api.reactivateUser(id, deactivateUserRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->reactivateUser: $e\n');
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

# **replaceMyIdentityDocument**
> IdentityVerificationDocument replaceMyIdentityDocument(kind, replaceMyIdentityDocumentRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();
final String kind = kind_example; // String | 
final ReplaceMyIdentityDocumentRequest replaceMyIdentityDocumentRequest = ; // ReplaceMyIdentityDocumentRequest | 

try {
    final response = api.replaceMyIdentityDocument(kind, replaceMyIdentityDocumentRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->replaceMyIdentityDocument: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **kind** | **String**|  | 
 **replaceMyIdentityDocumentRequest** | [**ReplaceMyIdentityDocumentRequest**](ReplaceMyIdentityDocumentRequest.md)|  | 

### Return type

[**IdentityVerificationDocument**](IdentityVerificationDocument.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **requestUserPasswordSetup**
> ChallengeExpiry requestUserPasswordSetup(id, passwordSetupRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final PasswordSetupRequest passwordSetupRequest = ; // PasswordSetupRequest | 

try {
    final response = api.requestUserPasswordSetup(id, passwordSetupRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->requestUserPasswordSetup: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **passwordSetupRequest** | [**PasswordSetupRequest**](PasswordSetupRequest.md)|  | 

### Return type

[**ChallengeExpiry**](ChallengeExpiry.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateUserRoles**
> UserSummary updateUserRoles(id, updateUserRolesCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getIdentityApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final UpdateUserRolesCommand updateUserRolesCommand = ; // UpdateUserRolesCommand | 

try {
    final response = api.updateUserRoles(id, updateUserRolesCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling IdentityApi->updateUserRoles: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **updateUserRolesCommand** | [**UpdateUserRolesCommand**](UpdateUserRolesCommand.md)|  | 

### Return type

[**UserSummary**](UserSummary.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

