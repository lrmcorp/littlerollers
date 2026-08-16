# openapi.api.InstructorManagementApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getManagedInstructor**](InstructorManagementApi.md#getmanagedinstructor) | **GET** /instructors/{id} | 
[**listManagedInstructors**](InstructorManagementApi.md#listmanagedinstructors) | **GET** /instructors | 


# **getManagedInstructor**
> JsonObject getManagedInstructor(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getInstructorManagementApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.getManagedInstructor(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling InstructorManagementApi->getManagedInstructor: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**JsonObject**](JsonObject.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listManagedInstructors**
> JsonObject listManagedInstructors(q, branchId, cursor)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getInstructorManagementApi();
final String q = q_example; // String | 
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String cursor = cursor_example; // String | 

try {
    final response = api.listManagedInstructors(q, branchId, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling InstructorManagementApi->listManagedInstructors: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **q** | **String**|  | [optional] 
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **cursor** | **String**|  | [optional] 

### Return type

[**JsonObject**](JsonObject.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

