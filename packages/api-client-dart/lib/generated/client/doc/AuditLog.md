# openapi.model.AuditLog

## Load the model package
```dart
import 'package:openapi/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** |  | 
**occurredAt** | [**DateTime**](DateTime.md) |  | 
**actorType** | **String** |  | 
**actorId** | **String** |  | [optional] 
**branchId** | **String** |  | [optional] 
**action** | **String** |  | 
**objectType** | **String** |  | 
**objectId** | **String** |  | 
**beforeMasked** | [**JsonObject**](.md) |  | [optional] 
**afterMasked** | [**JsonObject**](.md) |  | [optional] 
**correlationId** | **String** |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


