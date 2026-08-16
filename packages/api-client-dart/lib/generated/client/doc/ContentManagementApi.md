# openapi.api.ContentManagementApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**createManagedPublicContent**](ContentManagementApi.md#createmanagedpubliccontent) | **POST** /public-content-management | 
[**listManagedPublicContent**](ContentManagementApi.md#listmanagedpubliccontent) | **GET** /public-content-management | 
[**transitionManagedPublicContent**](ContentManagementApi.md#transitionmanagedpubliccontent) | **POST** /public-content-management/{id}/{status} | 


# **createManagedPublicContent**
> Resource createManagedPublicContent(body)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getContentManagementApi();
final JsonObject body = Object; // JsonObject | 

try {
    final response = api.createManagedPublicContent(body);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ContentManagementApi->createManagedPublicContent: $e\n');
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

# **listManagedPublicContent**
> BuiltList<JsonObject> listManagedPublicContent(branchId, kind, status)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getContentManagementApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String kind = kind_example; // String | 
final String status = status_example; // String | 

try {
    final response = api.listManagedPublicContent(branchId, kind, status);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ContentManagementApi->listManagedPublicContent: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **kind** | **String**|  | [optional] 
 **status** | **String**|  | [optional] 

### Return type

[**BuiltList&lt;JsonObject&gt;**](JsonObject.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **transitionManagedPublicContent**
> Resource transitionManagedPublicContent(id, status)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getContentManagementApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String status = status_example; // String | 

try {
    final response = api.transitionManagedPublicContent(id, status);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ContentManagementApi->transitionManagedPublicContent: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **status** | **String**|  | 

### Return type

[**Resource**](Resource.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

