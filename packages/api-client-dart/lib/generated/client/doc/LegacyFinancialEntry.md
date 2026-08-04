# openapi.model.LegacyFinancialEntry

## Load the model package
```dart
import 'package:openapi/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** |  | 
**branchId** | **String** |  | [optional] 
**purchaseId** | **String** |  | [optional] 
**actorUserId** | **String** |  | [optional] 
**parentId** | **String** |  | [optional] 
**type** | **String** |  | 
**amountRp** | **int** |  | 
**occurredAt** | [**DateTime**](DateTime.md) |  | 
**description** | **String** |  | [optional] 
**sourceTypeCode** | **String** |  | 
**historical** | **bool** |  | 
**branch** | [**UserAccessRoleAssignmentBranch**](UserAccessRoleAssignmentBranch.md) |  | [optional] 
**purchase** | [**LegacyFinancialEntryPurchase**](LegacyFinancialEntryPurchase.md) |  | [optional] 
**actor** | [**LegacyFinancialEntryActor**](LegacyFinancialEntryActor.md) |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


