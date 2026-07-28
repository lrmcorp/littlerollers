# openapi.model.PaymentReviewItem

## Load the model package
```dart
import 'package:openapi/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** |  | 
**branchId** | **String** |  | 
**userId** | **String** |  | 
**packageId** | **String** |  | 
**paymentProofId** | **String** |  | [optional] 
**packageNameSnapshot** | **String** |  | 
**priceRpSnapshot** | **int** |  | 
**paymentUniqueCode** | **int** |  | [optional] 
**payableAmountRpSnapshot** | **int** |  | [optional] 
**sessionCountSnapshot** | **int** |  | 
**durationDaysSnapshot** | **int** |  | 
**status** | **String** |  | 
**submittedAt** | [**DateTime**](DateTime.md) |  | 
**paymentExpiresAt** | [**DateTime**](DateTime.md) |  | [optional] 
**decidedAt** | [**DateTime**](DateTime.md) |  | [optional] 
**decidedById** | **String** |  | [optional] 
**decisionReasonCode** | **String** |  | [optional] 
**auditReference** | **String** |  | 
**version** | **int** |  | 
**customer** | [**PaymentReviewCustomer**](PaymentReviewCustomer.md) |  | 
**branch** | [**PaymentReviewBranch**](PaymentReviewBranch.md) |  | 
**paymentProof** | [**PaymentReviewProof**](PaymentReviewProof.md) |  | 
**activationSummary** | [**PaymentActivationSummary**](PaymentActivationSummary.md) |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


