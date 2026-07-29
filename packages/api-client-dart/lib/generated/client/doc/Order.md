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
**branchTimezone** | **String** |  | [optional] 
**packageId** | **String** |  | 
**packageName** | **String** |  | 
**priceRp** | **int** |  | 
**baseAmountRp** | **int** |  | 
**promotion** | [**OrderPromotion**](OrderPromotion.md) |  | [optional] 
**promotionalPriceRp** | **int** |  | 
**paymentUniqueCode** | **int** |  | [optional] 
**payableAmountRp** | **int** |  | 
**sessionCount** | **int** |  | 
**durationDays** | **int** |  | 
**status** | **String** |  | 
**submittedAt** | [**DateTime**](DateTime.md) |  | 
**decidedAt** | [**DateTime**](DateTime.md) |  | [optional] 
**expiresAt** | [**DateTime**](DateTime.md) |  | [optional] 
**continuationSlotId** | **String** |  | [optional] 
**paymentProofId** | **String** |  | [optional] 
**paymentProofStatus** | [**OrderPaymentProofStatus**](OrderPaymentProofStatus.md) |  | [optional] 
**decisionReasonCode** | **String** |  | [optional] 
**timelineComplete** | **bool** |  | 
**activation** | [**CustomerOrderActivation**](CustomerOrderActivation.md) |  | [optional] 
**timeline** | [**CustomerOrderTimelinePage**](CustomerOrderTimelinePage.md) |  | [optional] 
**version** | **int** |  | 
**paymentAccount** | [**OrderPaymentAccount**](OrderPaymentAccount.md) |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


