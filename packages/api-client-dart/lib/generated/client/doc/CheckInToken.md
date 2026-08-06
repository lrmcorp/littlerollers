# openapi.model.CheckInToken

## Load the model package
```dart
import 'package:openapi/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** |  | 
**purpose** | **String** |  | 
**audienceType** | **String** |  | 
**resourceType** | **String** |  | 
**resourceId** | **String** |  | 
**notBeforeAt** | [**DateTime**](DateTime.md) |  | 
**expiresAt** | [**DateTime**](DateTime.md) |  | 
**status** | **String** |  | 
**version** | **int** |  | 
**token** | **String** | Returned only at first issuance; never log, persist, or send to analytics. | 
**idempotentReplay** | **bool** |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


