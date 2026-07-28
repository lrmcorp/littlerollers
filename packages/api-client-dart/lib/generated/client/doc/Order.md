# openapi.model.Order

## Load the model package
```dart
import 'package:openapi/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** |  | 
**branchId** | **String** |  | 
**branchName** | **String** |  | [optional] 
**packageId** | **String** |  | 
**packageName** | **String** |  | 
**priceRp** | **int** |  | 
**baseAmountRp** | **int** |  | 
**paymentUniqueCode** | **int** |  | [optional] 
**payableAmountRp** | **int** |  | 
**sessionCount** | **int** |  | 
**durationDays** | **int** |  | 
**status** | **String** |  | 
**submittedAt** | [**DateTime**](DateTime.md) |  | 
**expiresAt** | [**DateTime**](DateTime.md) |  | [optional] 
**continuationSlotId** | **String** |  | [optional] 
**paymentProofId** | **String** |  | [optional] 
**paymentProofStatus** | [**OrderPaymentProofStatus**](OrderPaymentProofStatus.md) |  | [optional] 
**decisionReasonCode** | **String** |  | [optional] 
**version** | **int** |  | 
**paymentAccount** | [**OrderPaymentAccount**](OrderPaymentAccount.md) |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


