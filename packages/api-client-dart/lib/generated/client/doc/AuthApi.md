# openapi.api.AuthApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**authenticateGoogle**](AuthApi.md#authenticategoogle) | **POST** /auth/google | 
[**createMfaChallenge**](AuthApi.md#createmfachallenge) | **POST** /auth/mfa/challenges | 
[**linkVerifiedIdentity**](AuthApi.md#linkverifiedidentity) | **POST** /auth/account-links | 
[**logout**](AuthApi.md#logout) | **POST** /auth/logout | 
[**refreshSession**](AuthApi.md#refreshsession) | **POST** /auth/refresh | 
[**requestAccountRecovery**](AuthApi.md#requestaccountrecovery) | **POST** /auth/recovery-requests | 
[**requestOtp**](AuthApi.md#requestotp) | **POST** /auth/otp/requests | 
[**revokeAllSessions**](AuthApi.md#revokeallsessions) | **POST** /auth/sessions/revoke-all | 
[**verifyAccountRecovery**](AuthApi.md#verifyaccountrecovery) | **POST** /auth/recoveries/{id}/verify | 
[**verifyMfaChallenge**](AuthApi.md#verifymfachallenge) | **POST** /auth/mfa/verifications | 
[**verifyOtp**](AuthApi.md#verifyotp) | **POST** /auth/otp/verifications | 


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

# **createMfaChallenge**
> MfaChallenge createMfaChallenge(mfaChallengeCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthApi();
final MfaChallengeCommand mfaChallengeCommand = ; // MfaChallengeCommand | 

try {
    final response = api.createMfaChallenge(mfaChallengeCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthApi->createMfaChallenge: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **mfaChallengeCommand** | [**MfaChallengeCommand**](MfaChallengeCommand.md)|  | 

### Return type

[**MfaChallenge**](MfaChallenge.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
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

# **verifyMfaChallenge**
> Session verifyMfaChallenge(mfaVerifyCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthApi();
final MfaVerifyCommand mfaVerifyCommand = ; // MfaVerifyCommand | 

try {
    final response = api.verifyMfaChallenge(mfaVerifyCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthApi->verifyMfaChallenge: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **mfaVerifyCommand** | [**MfaVerifyCommand**](MfaVerifyCommand.md)|  | 

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

