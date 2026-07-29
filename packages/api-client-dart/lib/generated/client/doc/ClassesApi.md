# openapi.api.ClassesApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**assignClassSlotInstructor**](ClassesApi.md#assignclassslotinstructor) | **POST** /class-slots/{id}/assign-instructor | 
[**cancelClassSlot**](ClassesApi.md#cancelclassslot) | **POST** /class-slots/{id}/cancel | 
[**createAvailability**](ClassesApi.md#createavailability) | **POST** /instructor-availabilities | 
[**createClassSlot**](ClassesApi.md#createclassslot) | **POST** /class-slots | 
[**getPublicClassDetail**](ClassesApi.md#getpublicclassdetail) | **GET** /public/class-types/{slug} | 
[**getPublicScheduleDetail**](ClassesApi.md#getpublicscheduledetail) | **GET** /public/class-catalog/{id} | 
[**listAvailabilities**](ClassesApi.md#listavailabilities) | **GET** /instructor-availabilities | 
[**listClassSlots**](ClassesApi.md#listclassslots) | **GET** /class-slots | 
[**listPublicClassSchedule**](ClassesApi.md#listpublicclassschedule) | **GET** /public/class-catalog | 
[**publishClassSlot**](ClassesApi.md#publishclassslot) | **POST** /class-slots/{id}/publish | 
[**transitionClassSlot**](ClassesApi.md#transitionclassslot) | **POST** /class-slots/{id}/{action} | 
[**updateDraftClassSlot**](ClassesApi.md#updatedraftclassslot) | **PATCH** /class-slots/{id} | 


# **assignClassSlotInstructor**
> ClassSlot assignClassSlotInstructor(id, idempotencyKey, assignInstructorCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getClassesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final AssignInstructorCommand assignInstructorCommand = ; // AssignInstructorCommand | 

try {
    final response = api.assignClassSlotInstructor(id, idempotencyKey, assignInstructorCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ClassesApi->assignClassSlotInstructor: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **assignInstructorCommand** | [**AssignInstructorCommand**](AssignInstructorCommand.md)|  | 

### Return type

[**ClassSlot**](ClassSlot.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **cancelClassSlot**
> ClassSlot cancelClassSlot(id, idempotencyKey, classSlotCancellationCommand)



Permission-gated cancellation from DRAFT/PUBLISHED. Atomically releases ACTIVE reservations; production remains blocked by DEC-008.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getClassesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final ClassSlotCancellationCommand classSlotCancellationCommand = ; // ClassSlotCancellationCommand | 

try {
    final response = api.cancelClassSlot(id, idempotencyKey, classSlotCancellationCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ClassesApi->cancelClassSlot: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **classSlotCancellationCommand** | [**ClassSlotCancellationCommand**](ClassSlotCancellationCommand.md)|  | 

### Return type

[**ClassSlot**](ClassSlot.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createAvailability**
> Availability createAvailability(idempotencyKey, timeRangeCommand)



Creates one UTC-normalized [startAt,endAt) interval under an effective INSTRUCTOR assignment. Adjacent intervals are allowed; overlap for the same instructor across branches is rejected.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getClassesApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final TimeRangeCommand timeRangeCommand = ; // TimeRangeCommand | 

try {
    final response = api.createAvailability(idempotencyKey, timeRangeCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ClassesApi->createAvailability: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **timeRangeCommand** | [**TimeRangeCommand**](TimeRangeCommand.md)|  | 

### Return type

[**Availability**](Availability.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createClassSlot**
> ClassSlot createClassSlot(idempotencyKey, classSlotCommand)



Creates a DRAFT [startAt,endAt) slot and snapshots effective synthetic quota/capacity. No production defaults.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getClassesApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final ClassSlotCommand classSlotCommand = ; // ClassSlotCommand | 

try {
    final response = api.createClassSlot(idempotencyKey, classSlotCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ClassesApi->createClassSlot: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **classSlotCommand** | [**ClassSlotCommand**](ClassSlotCommand.md)|  | 

### Return type

[**ClassSlot**](ClassSlot.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPublicClassDetail**
> PublicClassDetail getPublicClassDetail(slug)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getClassesApi();
final String slug = slug_example; // String | 

try {
    final response = api.getPublicClassDetail(slug);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ClassesApi->getPublicClassDetail: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **slug** | **String**|  | 

### Return type

[**PublicClassDetail**](PublicClassDetail.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPublicScheduleDetail**
> PublicScheduleDetail getPublicScheduleDetail(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getClassesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.getPublicScheduleDetail(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ClassesApi->getPublicScheduleDetail: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**PublicScheduleDetail**](PublicScheduleDetail.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listAvailabilities**
> AvailabilityPage listAvailabilities(branchId, from, until, cursor)



Instructor-own half-open intervals ordered by startAt and id descending. Optional from/until selects intervals that overlap the requested UTC window.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getClassesApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final DateTime from = 2013-10-20T19:20:30+01:00; // DateTime | Inclusive UTC-normalized window start; offset or Z required
final DateTime until = 2013-10-20T19:20:30+01:00; // DateTime | Exclusive UTC-normalized window end; offset or Z required
final String cursor = cursor_example; // String | 

try {
    final response = api.listAvailabilities(branchId, from, until, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ClassesApi->listAvailabilities: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **from** | **DateTime**| Inclusive UTC-normalized window start; offset or Z required | [optional] 
 **until** | **DateTime**| Exclusive UTC-normalized window end; offset or Z required | [optional] 
 **cursor** | **String**|  | [optional] 

### Return type

[**AvailabilityPage**](AvailabilityPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listClassSlots**
> ClassSlotPage listClassSlots(branchId, status, from, until, cursor)



Scoped class slots ordered by startAt and id descending. Customer sees PUBLISHED only; Instructor sees assigned slots; internal roles see branch-scoped lifecycle.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getClassesApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String status = status_example; // String | 
final DateTime from = 2013-10-20T19:20:30+01:00; // DateTime | Inclusive UTC-normalized window start; offset or Z required
final DateTime until = 2013-10-20T19:20:30+01:00; // DateTime | Exclusive UTC-normalized window end; offset or Z required
final String cursor = cursor_example; // String | 

try {
    final response = api.listClassSlots(branchId, status, from, until, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ClassesApi->listClassSlots: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **status** | **String**|  | [optional] 
 **from** | **DateTime**| Inclusive UTC-normalized window start; offset or Z required | [optional] 
 **until** | **DateTime**| Exclusive UTC-normalized window end; offset or Z required | [optional] 
 **cursor** | **String**|  | [optional] 

### Return type

[**ClassSlotPage**](ClassSlotPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listPublicClassSchedule**
> PublicClassCatalog listPublicClassSchedule(branchId, from, until)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getClassesApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final DateTime from = 2013-10-20T19:20:30+01:00; // DateTime | Inclusive UTC-normalized window start; offset or Z required
final DateTime until = 2013-10-20T19:20:30+01:00; // DateTime | Exclusive UTC-normalized window end; offset or Z required

try {
    final response = api.listPublicClassSchedule(branchId, from, until);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ClassesApi->listPublicClassSchedule: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **from** | **DateTime**| Inclusive UTC-normalized window start; offset or Z required | [optional] 
 **until** | **DateTime**| Exclusive UTC-normalized window end; offset or Z required | [optional] 

### Return type

[**PublicClassCatalog**](PublicClassCatalog.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **publishClassSlot**
> ClassSlot publishClassSlot(id, idempotencyKey, classSlotVersionCommand)



Permission-gated DRAFT to PUBLISHED transition after assignment and availability revalidation.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getClassesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final ClassSlotVersionCommand classSlotVersionCommand = ; // ClassSlotVersionCommand | 

try {
    final response = api.publishClassSlot(id, idempotencyKey, classSlotVersionCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ClassesApi->publishClassSlot: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **classSlotVersionCommand** | [**ClassSlotVersionCommand**](ClassSlotVersionCommand.md)|  | 

### Return type

[**ClassSlot**](ClassSlot.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **transitionClassSlot**
> ClassSlot transitionClassSlot(id, action, idempotencyKey, actionCommand)



Compatibility-only draft; use explicit assign-instructor, publish, cancel, or complete operations.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getClassesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String action = action_example; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final ActionCommand actionCommand = ; // ActionCommand | 

try {
    final response = api.transitionClassSlot(id, action, idempotencyKey, actionCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ClassesApi->transitionClassSlot: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **action** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **actionCommand** | [**ActionCommand**](ActionCommand.md)|  | 

### Return type

[**ClassSlot**](ClassSlot.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateDraftClassSlot**
> ClassSlot updateDraftClassSlot(id, idempotencyKey, classSlotUpdateCommand)



Updates a DRAFT slot and re-snapshots effective capacity. Published or confirmed slots must be cancelled and recreated.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getClassesApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final ClassSlotUpdateCommand classSlotUpdateCommand = ; // ClassSlotUpdateCommand | 

try {
    final response = api.updateDraftClassSlot(id, idempotencyKey, classSlotUpdateCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ClassesApi->updateDraftClassSlot: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **classSlotUpdateCommand** | [**ClassSlotUpdateCommand**](ClassSlotUpdateCommand.md)|  | 

### Return type

[**ClassSlot**](ClassSlot.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

