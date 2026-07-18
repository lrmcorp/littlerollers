# openapi.model.QuotaCapacityCommand

## Load the model package
```dart
import 'package:openapi/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**effectiveFrom** | [**Date**](Date.md) |  | 
**effectiveUntil** | [**Date**](Date.md) |  | [optional] 
**kind** | [**JsonObject**](.md) |  | 
**branchId** | **String** |  | 
**classTypeId** | **String** |  | 
**minimumQuota** | **int** |  | 
**defaultCapacity** | **int** | Must be greater than or equal to minimumQuota | 
**reason** | **String** |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


