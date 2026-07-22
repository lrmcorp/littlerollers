# openapi.api.BookingsApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createBooking**](BookingsApi.md#createbooking) | **POST** /bookings | 
[**decideReschedule**](BookingsApi.md#decidereschedule) | **POST** /reschedules/{id}/{decision} | 
[**listBookings**](BookingsApi.md#listbookings) | **GET** /bookings | 
[**requestReschedule**](BookingsApi.md#requestreschedule) | **POST** /reschedules | 


# **createBooking**
> Booking createBooking(idempotencyKey, bookingCommand)



Atomically creates one booking, one ACTIVE reservation, masked audit, and booking.created.v1. Synthetic H-2 cutoff is explicit configuration; production is fail-closed.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getBookingsApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final BookingCommand bookingCommand = ; // BookingCommand | 

try {
    final response = api.createBooking(idempotencyKey, bookingCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling BookingsApi->createBooking: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **bookingCommand** | [**BookingCommand**](BookingCommand.md)|  | 

### Return type

[**Booking**](Booking.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **decideReschedule**
> RescheduleDecisionResult decideReschedule(id, decision, idempotencyKey, deactivateUserRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getBookingsApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String decision = decision_example; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final DeactivateUserRequest deactivateUserRequest = ; // DeactivateUserRequest | 

try {
    final response = api.decideReschedule(id, decision, idempotencyKey, deactivateUserRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling BookingsApi->decideReschedule: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **decision** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **deactivateUserRequest** | [**DeactivateUserRequest**](DeactivateUserRequest.md)|  | 

### Return type

[**RescheduleDecisionResult**](RescheduleDecisionResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listBookings**
> BookingPage listBookings(branchId, cursor, status)



Customer self history or branch-scoped internal booking list, ordered by createdAt and id descending.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getBookingsApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String cursor = cursor_example; // String | 
final String status = status_example; // String | 

try {
    final response = api.listBookings(branchId, cursor, status);
    print(response);
} catch on DioException (e) {
    print('Exception when calling BookingsApi->listBookings: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **cursor** | **String**|  | [optional] 
 **status** | **String**|  | [optional] 

### Return type

[**BookingPage**](BookingPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **requestReschedule**
> Reschedule requestReschedule(idempotencyKey, rescheduleCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getBookingsApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final RescheduleCommand rescheduleCommand = ; // RescheduleCommand | 

try {
    final response = api.requestReschedule(idempotencyKey, rescheduleCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling BookingsApi->requestReschedule: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **rescheduleCommand** | [**RescheduleCommand**](RescheduleCommand.md)|  | 

### Return type

[**Reschedule**](Reschedule.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

