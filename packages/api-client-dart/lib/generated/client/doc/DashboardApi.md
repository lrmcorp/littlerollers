# openapi.api.DashboardApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getMyDashboard**](DashboardApi.md#getmydashboard) | **GET** /me/dashboard | 


# **getMyDashboard**
> CustomerDashboardOverview getMyDashboard()



Customer-owned actionable overview.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getDashboardApi();

try {
    final response = api.getMyDashboard();
    print(response);
} catch on DioException (e) {
    print('Exception when calling DashboardApi->getMyDashboard: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**CustomerDashboardOverview**](CustomerDashboardOverview.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

