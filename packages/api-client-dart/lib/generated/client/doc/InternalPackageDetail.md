# openapi.model.InternalPackageDetail

## Load the model package
```dart
import 'package:openapi/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** |  | 
**branchScopes** | [**BuiltList&lt;PackageBranchScope&gt;**](PackageBranchScope.md) |  | [optional] 
**classTypeScopes** | [**BuiltList&lt;PackageClassTypeScope&gt;**](PackageClassTypeScope.md) |  | [optional] 
**revisions** | [**BuiltList&lt;Package&gt;**](Package.md) |  | 
**businessKey** | **String** |  | 
**name** | **String** |  | 
**sessionCount** | **int** |  | 
**sessionDurationMinutes** | [**SessionDurationMinutes**](SessionDurationMinutes.md) |  | [optional] 
**durationDays** | **int** |  | 
**priceRp** | **int** |  | 
**status** | **String** |  | 
**effectiveState** | **String** |  | [optional] 
**livePromotion** | **bool** |  | [optional] 
**effectiveFrom** | [**Date**](Date.md) |  | 
**effectiveUntil** | [**Date**](Date.md) |  | [optional] 
**version** | **int** |  | 
**promotions** | [**BuiltList&lt;PackagePromotion&gt;**](PackagePromotion.md) |  | 
**auditActivity** | [**BuiltList&lt;SafeAuditActivity&gt;**](SafeAuditActivity.md) |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


