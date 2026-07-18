# openapi.api.AttendanceApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**backfillCustomerCheckIn**](AttendanceApi.md#backfillcustomercheckin) | **POST** /check-ins/customers/backfill | 
[**completeClassSlot**](AttendanceApi.md#completeclassslot) | **POST** /class-slots/{id}/complete | 
[**customerCheckIn**](AttendanceApi.md#customercheckin) | **POST** /check-ins/customers | 
[**getCheckInTokenStatus**](AttendanceApi.md#getcheckintokenstatus) | **GET** /check-in-tokens/{id} | 
[**instructorCheckIn**](AttendanceApi.md#instructorcheckin) | **POST** /check-ins/instructors | 
[**issueCustomerCheckInLink**](AttendanceApi.md#issuecustomercheckinlink) | **POST** /bookings/{id}/customer-check-in-links | 
[**issueInstructorCheckInToken**](AttendanceApi.md#issueinstructorcheckintoken) | **POST** /class-slots/{id}/instructor-check-in-tokens | 
[**revokeCheckInToken**](AttendanceApi.md#revokecheckintoken) | **POST** /check-in-tokens/{id}/revoke | 


# **backfillCustomerCheckIn**
> CheckInResult backfillCustomerCheckIn(idempotencyKey, backfillCustomerCheckInRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAttendanceApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final BackfillCustomerCheckInRequest backfillCustomerCheckInRequest = ; // BackfillCustomerCheckInRequest | 

try {
    final response = api.backfillCustomerCheckIn(idempotencyKey, backfillCustomerCheckInRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AttendanceApi->backfillCustomerCheckIn: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **backfillCustomerCheckInRequest** | [**BackfillCustomerCheckInRequest**](BackfillCustomerCheckInRequest.md)|  | 

### Return type

[**CheckInResult**](CheckInResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **completeClassSlot**
> CompletionResult completeClassSlot(id, idempotencyKey, completeClassCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAttendanceApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final CompleteClassCommand completeClassCommand = ; // CompleteClassCommand | 

try {
    final response = api.completeClassSlot(id, idempotencyKey, completeClassCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AttendanceApi->completeClassSlot: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **completeClassCommand** | [**CompleteClassCommand**](CompleteClassCommand.md)|  | 

### Return type

[**CompletionResult**](CompletionResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **customerCheckIn**
> CheckInResult customerCheckIn(idempotencyKey, tokenCheckInCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAttendanceApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final TokenCheckInCommand tokenCheckInCommand = ; // TokenCheckInCommand | 

try {
    final response = api.customerCheckIn(idempotencyKey, tokenCheckInCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AttendanceApi->customerCheckIn: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **tokenCheckInCommand** | [**TokenCheckInCommand**](TokenCheckInCommand.md)|  | 

### Return type

[**CheckInResult**](CheckInResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCheckInTokenStatus**
> CheckInTokenStatus getCheckInTokenStatus(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAttendanceApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.getCheckInTokenStatus(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AttendanceApi->getCheckInTokenStatus: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**CheckInTokenStatus**](CheckInTokenStatus.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **instructorCheckIn**
> CheckInResult instructorCheckIn(idempotencyKey, tokenCheckInCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAttendanceApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final TokenCheckInCommand tokenCheckInCommand = ; // TokenCheckInCommand | 

try {
    final response = api.instructorCheckIn(idempotencyKey, tokenCheckInCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AttendanceApi->instructorCheckIn: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **tokenCheckInCommand** | [**TokenCheckInCommand**](TokenCheckInCommand.md)|  | 

### Return type

[**CheckInResult**](CheckInResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **issueCustomerCheckInLink**
> CheckInToken issueCustomerCheckInLink(id, idempotencyKey)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAttendanceApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 

try {
    final response = api.issueCustomerCheckInLink(id, idempotencyKey);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AttendanceApi->issueCustomerCheckInLink: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 

### Return type

[**CheckInToken**](CheckInToken.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **issueInstructorCheckInToken**
> CheckInToken issueInstructorCheckInToken(id, idempotencyKey)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAttendanceApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 

try {
    final response = api.issueInstructorCheckInToken(id, idempotencyKey);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AttendanceApi->issueInstructorCheckInToken: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 

### Return type

[**CheckInToken**](CheckInToken.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **revokeCheckInToken**
> CheckInTokenStatus revokeCheckInToken(id, idempotencyKey, deactivateUserRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAttendanceApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final DeactivateUserRequest deactivateUserRequest = ; // DeactivateUserRequest | 

try {
    final response = api.revokeCheckInToken(id, idempotencyKey, deactivateUserRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AttendanceApi->revokeCheckInToken: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **deactivateUserRequest** | [**DeactivateUserRequest**](DeactivateUserRequest.md)|  | 

### Return type

[**CheckInTokenStatus**](CheckInTokenStatus.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

