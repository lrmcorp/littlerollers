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
[**getClassCompletionControl**](AttendanceApi.md#getclasscompletioncontrol) | **GET** /class-slots/{id}/completion-control | 
[**instructorCheckIn**](AttendanceApi.md#instructorcheckin) | **POST** /check-ins/instructors | 
[**issueCustomerCheckInLink**](AttendanceApi.md#issuecustomercheckinlink) | **POST** /bookings/{id}/customer-check-in-links | 
[**issueCustomerCheckInLinksBulk**](AttendanceApi.md#issuecustomercheckinlinksbulk) | **POST** /class-slots/{id}/customer-check-in-links/bulk | 
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



The owning Customer or authorized branch staff consumes a booking-bound QR token atomically. The valid interval is inclusive at H-30 and exclusive at class end.

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

# **getClassCompletionControl**
> GetClassCompletionControl200Response getClassCompletionControl(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAttendanceApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.getClassCompletionControl(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AttendanceApi->getClassCompletionControl: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**GetClassCompletionControl200Response**](GetClassCompletionControl200Response.md)

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
> CustomerCheckInIssue issueCustomerCheckInLink(id, idempotencyKey, issueCustomerCheckInLinkCommand)



Issues a one-time booking pass. The raw token is returned only on first issuance and is never persisted.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAttendanceApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final IssueCustomerCheckInLinkCommand issueCustomerCheckInLinkCommand = ; // IssueCustomerCheckInLinkCommand | 

try {
    final response = api.issueCustomerCheckInLink(id, idempotencyKey, issueCustomerCheckInLinkCommand);
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
 **issueCustomerCheckInLinkCommand** | [**IssueCustomerCheckInLinkCommand**](IssueCustomerCheckInLinkCommand.md)|  | 

### Return type

[**CustomerCheckInIssue**](CustomerCheckInIssue.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **issueCustomerCheckInLinksBulk**
> BulkCustomerCheckInLinkResult issueCustomerCheckInLinksBulk(id, idempotencyKey, bulkCustomerCheckInLinkCommand)



Issues passes independently for active bookings in one confirmed class; one failure does not roll back other results.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAttendanceApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final BulkCustomerCheckInLinkCommand bulkCustomerCheckInLinkCommand = ; // BulkCustomerCheckInLinkCommand | 

try {
    final response = api.issueCustomerCheckInLinksBulk(id, idempotencyKey, bulkCustomerCheckInLinkCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AttendanceApi->issueCustomerCheckInLinksBulk: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **bulkCustomerCheckInLinkCommand** | [**BulkCustomerCheckInLinkCommand**](BulkCustomerCheckInLinkCommand.md)|  | 

### Return type

[**BulkCustomerCheckInLinkResult**](BulkCustomerCheckInLinkResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
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
> CheckInTokenStatus revokeCheckInToken(id, revokeCheckInTokenCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAttendanceApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final RevokeCheckInTokenCommand revokeCheckInTokenCommand = ; // RevokeCheckInTokenCommand | 

try {
    final response = api.revokeCheckInToken(id, revokeCheckInTokenCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AttendanceApi->revokeCheckInToken: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **revokeCheckInTokenCommand** | [**RevokeCheckInTokenCommand**](RevokeCheckInTokenCommand.md)|  | 

### Return type

[**CheckInTokenStatus**](CheckInTokenStatus.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

