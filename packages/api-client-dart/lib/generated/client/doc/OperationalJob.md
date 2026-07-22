# openapi.model.OperationalJob

## Load the model package
```dart
import 'package:openapi/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** |  | 
**type** | [**JsonObject**](.md) |  | 
**status** | **String** |  | 
**attemptCount** | **int** |  | 
**maxAttempts** | **int** |  | 
**progress** | **int** |  | 
**dueAt** | [**DateTime**](DateTime.md) |  | 
**nextAttemptAt** | [**DateTime**](DateTime.md) |  | 
**leaseExpiresAt** | [**DateTime**](DateTime.md) |  | [optional] 
**lastErrorCode** | **String** | Safe code only; no provider or user data. | [optional] 
**createdAt** | [**DateTime**](DateTime.md) |  | 
**version** | **int** |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


