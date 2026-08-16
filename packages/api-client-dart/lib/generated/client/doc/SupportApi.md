# openapi.api.SupportApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**addSupportCaseInternalNote**](SupportApi.md#addsupportcaseinternalnote) | **POST** /support-cases/{id}/internal-notes | 
[**createSupportCase**](SupportApi.md#createsupportcase) | **POST** /support-cases | 
[**getSupportCase**](SupportApi.md#getsupportcase) | **GET** /support-cases/{id} | 
[**listSupportCases**](SupportApi.md#listsupportcases) | **GET** /support-cases | 
[**updateSupportCase**](SupportApi.md#updatesupportcase) | **PATCH** /support-cases/{id} | 


# **addSupportCaseInternalNote**
> Resource addSupportCaseInternalNote(id, addSupportCaseInternalNoteRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getSupportApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final AddSupportCaseInternalNoteRequest addSupportCaseInternalNoteRequest = ; // AddSupportCaseInternalNoteRequest | 

try {
    final response = api.addSupportCaseInternalNote(id, addSupportCaseInternalNoteRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling SupportApi->addSupportCaseInternalNote: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **addSupportCaseInternalNoteRequest** | [**AddSupportCaseInternalNoteRequest**](AddSupportCaseInternalNoteRequest.md)|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createSupportCase**
> Resource createSupportCase(body)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getSupportApi();
final JsonObject body = Object; // JsonObject | 

try {
    final response = api.createSupportCase(body);
    print(response);
} catch on DioException (e) {
    print('Exception when calling SupportApi->createSupportCase: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | **JsonObject**|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSupportCase**
> JsonObject getSupportCase(id)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getSupportApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 

try {
    final response = api.getSupportCase(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling SupportApi->getSupportCase: $e\n');
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

# **listSupportCases**
> JsonObject listSupportCases(branchId, status, priority, q, cursor)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getSupportApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String status = status_example; // String | 
final String priority = priority_example; // String | 
final String q = q_example; // String | 
final String cursor = cursor_example; // String | 

try {
    final response = api.listSupportCases(branchId, status, priority, q, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling SupportApi->listSupportCases: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **status** | **String**|  | [optional] 
 **priority** | **String**|  | [optional] 
 **q** | **String**|  | [optional] 
 **cursor** | **String**|  | [optional] 

### Return type

[**JsonObject**](JsonObject.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateSupportCase**
> Resource updateSupportCase(id, body)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getSupportApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final JsonObject body = Object; // JsonObject | 

try {
    final response = api.updateSupportCase(id, body);
    print(response);
} catch on DioException (e) {
    print('Exception when calling SupportApi->updateSupportCase: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **body** | **JsonObject**|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

