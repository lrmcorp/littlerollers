# openapi.api.AuthApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**activatePassword**](AuthApi.md#activatepassword) | **POST** /auth/password/activations | 
[**authenticateGoogle**](AuthApi.md#authenticategoogle) | **POST** /auth/google | 
[**authenticatePassword**](AuthApi.md#authenticatepassword) | **POST** /auth/password/sessions | 
[**changePassword**](AuthApi.md#changepassword) | **POST** /auth/password/change | 
[**getAuthSecurityStatus**](AuthApi.md#getauthsecuritystatus) | **GET** /auth/security | 
[**linkVerifiedIdentity**](AuthApi.md#linkverifiedidentity) | **POST** /auth/account-links | 
[**logout**](AuthApi.md#logout) | **POST** /auth/logout | 
[**refreshSession**](AuthApi.md#refreshsession) | **POST** /auth/refresh | 
[**registerCustomer**](AuthApi.md#registercustomer) | **POST** /auth/customer-registrations | 
[**requestAccountRecovery**](AuthApi.md#requestaccountrecovery) | **POST** /auth/recovery-requests | 
[**requestOtp**](AuthApi.md#requestotp) | **POST** /auth/otp/requests | 
[**requestPasswordReset**](AuthApi.md#requestpasswordreset) | **POST** /auth/password/reset-requests | 
[**resetPassword**](AuthApi.md#resetpassword) | **POST** /auth/password/resets | 
[**revokeAllSessions**](AuthApi.md#revokeallsessions) | **POST** /auth/sessions/revoke-all | 
[**verifyAccountRecovery**](AuthApi.md#verifyaccountrecovery) | **POST** /auth/recoveries/{id}/verify | 
[**verifyOtp**](AuthApi.md#verifyotp) | **POST** /auth/otp/verifications | 


# **activatePassword**
> Session activatePassword(passwordTokenCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthApi();
final PasswordTokenCommand passwordTokenCommand = ; // PasswordTokenCommand | 

try {
    final response = api.activatePassword(passwordTokenCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthApi->activatePassword: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **passwordTokenCommand** | [**PasswordTokenCommand**](PasswordTokenCommand.md)|  | 

### Return type

[**Session**](Session.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authenticateGoogle**
> Session authenticateGoogle(googleAuthRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthApi();
final GoogleAuthRequest googleAuthRequest = ; // GoogleAuthRequest | 

try {
    final response = api.authenticateGoogle(googleAuthRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthApi->authenticateGoogle: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **googleAuthRequest** | [**GoogleAuthRequest**](GoogleAuthRequest.md)|  | 

### Return type

[**Session**](Session.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authenticatePassword**
> Session authenticatePassword(passwordSessionRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthApi();
final PasswordSessionRequest passwordSessionRequest = ; // PasswordSessionRequest | 

try {
    final response = api.authenticatePassword(passwordSessionRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthApi->authenticatePassword: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **passwordSessionRequest** | [**PasswordSessionRequest**](PasswordSessionRequest.md)|  | 

### Return type

[**Session**](Session.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **changePassword**
> ChangedStatus changePassword(passwordChangeCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthApi();
final PasswordChangeCommand passwordChangeCommand = ; // PasswordChangeCommand | 

try {
    final response = api.changePassword(passwordChangeCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthApi->changePassword: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **passwordChangeCommand** | [**PasswordChangeCommand**](PasswordChangeCommand.md)|  | 

### Return type

[**ChangedStatus**](ChangedStatus.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAuthSecurityStatus**
> AuthSecurityStatus getAuthSecurityStatus()



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthApi();

try {
    final response = api.getAuthSecurityStatus();
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthApi->getAuthSecurityStatus: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**AuthSecurityStatus**](AuthSecurityStatus.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **linkVerifiedIdentity**
> Resource linkVerifiedIdentity(idempotencyKey, accountLinkCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final AccountLinkCommand accountLinkCommand = ; // AccountLinkCommand | 

try {
    final response = api.linkVerifiedIdentity(idempotencyKey, accountLinkCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthApi->linkVerifiedIdentity: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **accountLinkCommand** | [**AccountLinkCommand**](AccountLinkCommand.md)|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **logout**
> logout()



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthApi();

try {
    api.logout();
} catch on DioException (e) {
    print('Exception when calling AuthApi->logout: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **refreshSession**
> Session refreshSession()



Mobile sends the rotating refresh token as Bearer credential; web uses its secure HttpOnly session cookie.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthApi();

try {
    final response = api.refreshSession();
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthApi->refreshSession: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**Session**](Session.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **registerCustomer**
> Session registerCustomer(customerRegistrationCommand)



Creates an active CUSTOMER account with pending private selfie and KTP verification, then issues a web session.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthApi();
final CustomerRegistrationCommand customerRegistrationCommand = ; // CustomerRegistrationCommand | 

try {
    final response = api.registerCustomer(customerRegistrationCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthApi->registerCustomer: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **customerRegistrationCommand** | [**CustomerRegistrationCommand**](CustomerRegistrationCommand.md)|  | 

### Return type

[**Session**](Session.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **requestAccountRecovery**
> ChallengeAccepted requestAccountRecovery(recoveryRequestCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthApi();
final RecoveryRequestCommand recoveryRequestCommand = ; // RecoveryRequestCommand | 

try {
    final response = api.requestAccountRecovery(recoveryRequestCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthApi->requestAccountRecovery: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **recoveryRequestCommand** | [**RecoveryRequestCommand**](RecoveryRequestCommand.md)|  | 

### Return type

[**ChallengeAccepted**](ChallengeAccepted.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **requestOtp**
> ChallengeAccepted requestOtp(otpRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthApi();
final OtpRequest otpRequest = ; // OtpRequest | 

try {
    final response = api.requestOtp(otpRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthApi->requestOtp: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **otpRequest** | [**OtpRequest**](OtpRequest.md)|  | 

### Return type

[**ChallengeAccepted**](ChallengeAccepted.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **requestPasswordReset**
> AcceptedStatus requestPasswordReset(passwordResetRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthApi();
final PasswordResetRequest passwordResetRequest = ; // PasswordResetRequest | 

try {
    final response = api.requestPasswordReset(passwordResetRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthApi->requestPasswordReset: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **passwordResetRequest** | [**PasswordResetRequest**](PasswordResetRequest.md)|  | 

### Return type

[**AcceptedStatus**](AcceptedStatus.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **resetPassword**
> ChangedStatus resetPassword(passwordTokenCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthApi();
final PasswordTokenCommand passwordTokenCommand = ; // PasswordTokenCommand | 

try {
    final response = api.resetPassword(passwordTokenCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthApi->resetPassword: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **passwordTokenCommand** | [**PasswordTokenCommand**](PasswordTokenCommand.md)|  | 

### Return type

[**ChangedStatus**](ChangedStatus.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **revokeAllSessions**
> revokeAllSessions(revokeSessionsCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthApi();
final RevokeSessionsCommand revokeSessionsCommand = ; // RevokeSessionsCommand | 

try {
    api.revokeAllSessions(revokeSessionsCommand);
} catch on DioException (e) {
    print('Exception when calling AuthApi->revokeAllSessions: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **revokeSessionsCommand** | [**RevokeSessionsCommand**](RevokeSessionsCommand.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/problem+json, application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **verifyAccountRecovery**
> Session verifyAccountRecovery(id, idempotencyKey, recoveryVerifyCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final RecoveryVerifyCommand recoveryVerifyCommand = ; // RecoveryVerifyCommand | 

try {
    final response = api.verifyAccountRecovery(id, idempotencyKey, recoveryVerifyCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthApi->verifyAccountRecovery: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **recoveryVerifyCommand** | [**RecoveryVerifyCommand**](RecoveryVerifyCommand.md)|  | 

### Return type

[**Session**](Session.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **verifyOtp**
> Session verifyOtp(otpVerifyRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthApi();
final OtpVerifyRequest otpVerifyRequest = ; // OtpVerifyRequest | 

try {
    final response = api.verifyOtp(otpVerifyRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthApi->verifyOtp: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **otpVerifyRequest** | [**OtpVerifyRequest**](OtpVerifyRequest.md)|  | 

### Return type

[**Session**](Session.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

