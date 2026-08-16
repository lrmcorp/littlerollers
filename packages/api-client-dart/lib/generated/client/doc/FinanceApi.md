# openapi.api.FinanceApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to */api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**closeMonth**](FinanceApi.md#closemonth) | **POST** /monthly-closes | 
[**createOtherCost**](FinanceApi.md#createothercost) | **POST** /other-costs | 
[**decideCorrection**](FinanceApi.md#decidecorrection) | **POST** /correction-journals/{id}/{decision} | 
[**exportAuthoritativeFinanceReport**](FinanceApi.md#exportauthoritativefinancereport) | **POST** /finance-exports | 
[**getFinanceReconciliationAnomalies**](FinanceApi.md#getfinancereconciliationanomalies) | **GET** /finance/reconciliation/anomalies | 
[**getFinanceReconciliationOverview**](FinanceApi.md#getfinancereconciliationoverview) | **GET** /finance/reconciliation/overview | 
[**getFinancialReport**](FinanceApi.md#getfinancialreport) | **GET** /reports/{reportType} | 
[**listCorrections**](FinanceApi.md#listcorrections) | **GET** /correction-journals | 
[**listLegacyFinancialEntries**](FinanceApi.md#listlegacyfinancialentries) | **GET** /finance/reconciliation/legacy-cashflow | 
[**listOtherCosts**](FinanceApi.md#listothercosts) | **GET** /other-costs | 
[**listPeriods**](FinanceApi.md#listperiods) | **GET** /periods | 
[**requestCorrection**](FinanceApi.md#requestcorrection) | **POST** /correction-journals | 


# **closeMonth**
> CloseResult closeMonth(idempotencyKey, closeMonthRequest)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getFinanceApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final CloseMonthRequest closeMonthRequest = ; // CloseMonthRequest | 

try {
    final response = api.closeMonth(idempotencyKey, closeMonthRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling FinanceApi->closeMonth: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **closeMonthRequest** | [**CloseMonthRequest**](CloseMonthRequest.md)|  | 

### Return type

[**CloseResult**](CloseResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createOtherCost**
> OtherCost createOtherCost(idempotencyKey, otherCostCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getFinanceApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final OtherCostCommand otherCostCommand = ; // OtherCostCommand | 

try {
    final response = api.createOtherCost(idempotencyKey, otherCostCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling FinanceApi->createOtherCost: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **otherCostCommand** | [**OtherCostCommand**](OtherCostCommand.md)|  | 

### Return type

[**OtherCost**](OtherCost.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **decideCorrection**
> CorrectionDecisionResult decideCorrection(id, decision, idempotencyKey, reasonCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getFinanceApi();
final String id = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | 
final String decision = decision_example; // String | 
final String idempotencyKey = idempotencyKey_example; // String | 
final ReasonCommand reasonCommand = ; // ReasonCommand | 

try {
    final response = api.decideCorrection(id, decision, idempotencyKey, reasonCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling FinanceApi->decideCorrection: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **decision** | **String**|  | 
 **idempotencyKey** | **String**|  | 
 **reasonCommand** | [**ReasonCommand**](ReasonCommand.md)|  | 

### Return type

[**CorrectionDecisionResult**](CorrectionDecisionResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **exportAuthoritativeFinanceReport**
> FinanceExportResult exportAuthoritativeFinanceReport(exportAuthoritativeFinanceReportRequest)



Builds an audited CSV from the same authoritative server-side aggregation used by dashboard, reports, and monthly close.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getFinanceApi();
final ExportAuthoritativeFinanceReportRequest exportAuthoritativeFinanceReportRequest = ; // ExportAuthoritativeFinanceReportRequest | 

try {
    final response = api.exportAuthoritativeFinanceReport(exportAuthoritativeFinanceReportRequest);
    print(response);
} catch on DioException (e) {
    print('Exception when calling FinanceApi->exportAuthoritativeFinanceReport: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **exportAuthoritativeFinanceReportRequest** | [**ExportAuthoritativeFinanceReportRequest**](ExportAuthoritativeFinanceReportRequest.md)|  | 

### Return type

[**FinanceExportResult**](FinanceExportResult.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getFinanceReconciliationAnomalies**
> GetFinanceReconciliationAnomalies200Response getFinanceReconciliationAnomalies(branchId, from, until, cursor, limit)



Actionable reconciliation anomalies without private proof contents.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getFinanceApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final Date from = 2013-10-20; // Date | 
final Date until = 2013-10-20; // Date | 
final String cursor = cursor_example; // String | 
final int limit = 56; // int | 

try {
    final response = api.getFinanceReconciliationAnomalies(branchId, from, until, cursor, limit);
    print(response);
} catch on DioException (e) {
    print('Exception when calling FinanceApi->getFinanceReconciliationAnomalies: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **from** | **Date**|  | [optional] 
 **until** | **Date**|  | [optional] 
 **cursor** | **String**|  | [optional] 
 **limit** | **int**|  | [optional] [default to 20]

### Return type

[**GetFinanceReconciliationAnomalies200Response**](GetFinanceReconciliationAnomalies200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getFinanceReconciliationOverview**
> FinanceReconciliationOverview getFinanceReconciliationOverview(branchId, from, until)



Global Finance or Super Owner reconciliation aggregates from authoritative purchase and ledger records.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getFinanceApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final Date from = 2013-10-20; // Date | 
final Date until = 2013-10-20; // Date | 

try {
    final response = api.getFinanceReconciliationOverview(branchId, from, until);
    print(response);
} catch on DioException (e) {
    print('Exception when calling FinanceApi->getFinanceReconciliationOverview: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **from** | **Date**|  | [optional] 
 **until** | **Date**|  | [optional] 

### Return type

[**FinanceReconciliationOverview**](FinanceReconciliationOverview.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getFinancialReport**
> FinancialReportPage getFinancialReport(reportType, period, branchId, cursor)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getFinanceApi();
final String reportType = reportType_example; // String | 
final String period = period_example; // String | 
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String cursor = cursor_example; // String | 

try {
    final response = api.getFinancialReport(reportType, period, branchId, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling FinanceApi->getFinancialReport: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **reportType** | **String**|  | 
 **period** | **String**|  | 
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **cursor** | **String**|  | [optional] 

### Return type

[**FinancialReportPage**](FinancialReportPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listCorrections**
> JsonObject listCorrections(period, branchId, status, q, cursor)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getFinanceApi();
final String period = period_example; // String | 
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String status = status_example; // String | 
final String q = q_example; // String | 
final String cursor = cursor_example; // String | 

try {
    final response = api.listCorrections(period, branchId, status, q, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling FinanceApi->listCorrections: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **period** | **String**|  | 
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **status** | **String**|  | [optional] 
 **q** | **String**|  | [optional] 
 **cursor** | **String**|  | [optional] 

### Return type

[**JsonObject**](JsonObject.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listLegacyFinancialEntries**
> LegacyFinancialEntryPage listLegacyFinancialEntries(branchId, from, until, cursor, limit)



Historical single-entry v1 cashflow, explicitly separated from new v2 double-entry journals.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getFinanceApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final Date from = 2013-10-20; // Date | 
final Date until = 2013-10-20; // Date | 
final String cursor = cursor_example; // String | 
final int limit = 56; // int | 

try {
    final response = api.listLegacyFinancialEntries(branchId, from, until, cursor, limit);
    print(response);
} catch on DioException (e) {
    print('Exception when calling FinanceApi->listLegacyFinancialEntries: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **from** | **Date**|  | [optional] 
 **until** | **Date**|  | [optional] 
 **cursor** | **String**|  | [optional] 
 **limit** | **int**|  | [optional] [default to 20]

### Return type

[**LegacyFinancialEntryPage**](LegacyFinancialEntryPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listOtherCosts**
> OtherCostPage listOtherCosts(period, branchId, cursor)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getFinanceApi();
final String period = period_example; // String | 
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String cursor = cursor_example; // String | 

try {
    final response = api.listOtherCosts(period, branchId, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling FinanceApi->listOtherCosts: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **period** | **String**|  | 
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **cursor** | **String**|  | [optional] 

### Return type

[**OtherCostPage**](OtherCostPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listPeriods**
> BranchPeriodPage listPeriods(branchId, cursor)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getFinanceApi();
final String branchId = 38400000-8cf0-11bd-b23e-10b96e4ef00d; // String | Filter only; never grants authority
final String cursor = cursor_example; // String | 

try {
    final response = api.listPeriods(branchId, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling FinanceApi->listPeriods: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **branchId** | **String**| Filter only; never grants authority | [optional] 
 **cursor** | **String**|  | [optional] 

### Return type

[**BranchPeriodPage**](BranchPeriodPage.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **requestCorrection**
> Correction requestCorrection(idempotencyKey, correctionCommand)



### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getFinanceApi();
final String idempotencyKey = idempotencyKey_example; // String | 
final CorrectionCommand correctionCommand = ; // CorrectionCommand | 

try {
    final response = api.requestCorrection(idempotencyKey, correctionCommand);
    print(response);
} catch on DioException (e) {
    print('Exception when calling FinanceApi->requestCorrection: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **idempotencyKey** | **String**|  | 
 **correctionCommand** | [**CorrectionCommand**](CorrectionCommand.md)|  | 

### Return type

[**Correction**](Correction.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, application/problem+json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

