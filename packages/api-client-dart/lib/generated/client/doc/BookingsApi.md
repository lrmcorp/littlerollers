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
[**getBooking**](BookingsApi.md#getbooking) | **GET** /bookings/{id} | 
[**getCustomerBookingOptions**](BookingsApi.md#getcustomerbookingoptions) | **GET** /bookings/options/{classSlotId} | 
[**listBookings**](BookingsApi.md#listbookings) | **GET** /bookings | 
[**listReschedules**](BookingsApi.md#listreschedules) | **GET** /reschedules | 
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
> RescheduleDecisionResult decideReschedule(id, decision, idempotencyKey, rescheduleDecisionCommand)



Permission-gated Admin/Super Owner decision. Approval atomically moves the existing booking reservation and both slot counts; rejection preserves the source reservation.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getBookingsApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String decision = decision_example; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final RescheduleDecisionCommand rescheduleDecisionCommand = ; // RescheduleDecisionCommand | 

try {
    final response = api.decideReschedule(id, decision, idempotencyKey, rescheduleDecisionCommand);
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
 **rescheduleDecisionCommand** | [**RescheduleDecisionCommand**](RescheduleDecisionCommand.md)|  | 

### Return type

[**RescheduleDecisionResult**](RescheduleDecisionResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getBooking**
> Booking getBooking(id)



Customer-owned or branch-scoped booking detail with safe class, studio, package, and attendance labels.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getBookingsApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.getBooking(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling BookingsApi->getBooking: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**Booking**](Booking.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCustomerBookingOptions**
> CustomerBookingOptions getCustomerBookingOptions(classSlotId)



Returns one safe future slot and only the authenticated customer own eligible package balances.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getBookingsApi();
final String classSlotId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.getCustomerBookingOptions(classSlotId);
    print(response);
} catch on DioException (e) {
    print('Exception when calling BookingsApi->getCustomerBookingOptions: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **classSlotId** | **String**|  | 

### Return type

[**CustomerBookingOptions**](CustomerBookingOptions.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
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

# **listReschedules**
> ReschedulePage listReschedules(branchId, status, cursor)



Customer-own or internal branch-scoped reschedule queue ordered by requestedAt and id descending.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getBookingsApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String status = status_example; // String | 
final String cursor = cursor_example; // String | 

try {
    final response = api.listReschedules(branchId, status, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling BookingsApi->listReschedules: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **status** | **String**|  | [optional] 
 **cursor** | **String**|  | [optional] 

### Return type

[**ReschedulePage**](ReschedulePage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **requestReschedule**
> Reschedule requestReschedule(idempotencyKey, rescheduleRequestCommand)



Customer-owned request before the explicit synthetic H-24 boundary. Request marks booking pending without moving its reservation.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getBookingsApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final RescheduleRequestCommand rescheduleRequestCommand = ; // RescheduleRequestCommand | 

try {
    final response = api.requestReschedule(idempotencyKey, rescheduleRequestCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling BookingsApi->requestReschedule: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **rescheduleRequestCommand** | [**RescheduleRequestCommand**](RescheduleRequestCommand.md)|  | 

### Return type

[**Reschedule**](Reschedule.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

