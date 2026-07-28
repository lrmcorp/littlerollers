# openapi.model.PublicScheduleDetail

## Load the model package
```dart
import 'package:openapi/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** |  | 
**branchId** | **String** |  | [optional] 
**startAt** | [**DateTime**](DateTime.md) |  | 
**endAt** | [**DateTime**](DateTime.md) |  | 
**timezone** | **String** |  | 
**status** | **String** |  | 
**capacity** | **int** |  | 
**available** | **int** |  | 
**branch** | [**PublicBranch**](PublicBranch.md) |  | 
**classType** | [**PublicClassTypeRef**](PublicClassTypeRef.md) |  | 
**instructor** | [**PublicScheduleSummaryInstructor**](PublicScheduleSummaryInstructor.md) |  | [optional] 
**classProfile** | [**PublicClassProfile**](PublicClassProfile.md) |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


