# openapi.model.SessionAdjustment

## Load the model package
```dart
import 'package:openapi/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** |  | 
**customerPackageId** | **String** |  | 
**quantity** | **int** |  | 
**reasonCode** | **String** |  | 
**requestedById** | **String** |  | 
**requestedBy** | [**AdjustmentActor**](AdjustmentActor.md) |  | [optional] 
**decidedById** | **String** |  | [optional] 
**decidedBy** | [**AdjustmentActor**](AdjustmentActor.md) |  | [optional] 
**decisionCode** | **String** |  | [optional] 
**decisionNote** | **String** |  | [optional] 
**status** | **String** |  | 
**ledgerBalanceAtRequest** | **int** |  | [optional] 
**reservedAtRequest** | **int** |  | [optional] 
**customer** | [**AdjustmentCustomer**](AdjustmentCustomer.md) |  | [optional] 
**branch** | [**AdjustmentNamedReference**](AdjustmentNamedReference.md) |  | [optional] 
**package** | [**AdjustmentNamedReference**](AdjustmentNamedReference.md) |  | [optional] 
**classType** | [**AdjustmentNamedReference**](AdjustmentNamedReference.md) |  | [optional] 
**currentBalance** | **int** |  | [optional] 
**currentReserved** | **int** |  | [optional] 
**currentAvailable** | **int** |  | [optional] 
**projectedLedgerBalance** | **int** |  | [optional] 
**projectedAvailable** | **int** |  | [optional] 
**eligibleForApproval** | **bool** |  | [optional] 
**eligibilityReason** | **String** |  | [optional] 
**ledgerEntryId** | **String** |  | [optional] 
**auditReference** | **String** |  | [optional] 
**version** | **int** |  | 
**createdAt** | [**DateTime**](DateTime.md) |  | 
**decidedAt** | [**DateTime**](DateTime.md) |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


