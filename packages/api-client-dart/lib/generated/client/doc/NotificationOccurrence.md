# openapi.model.NotificationOccurrence

## Load the model package
```dart
import 'package:openapi/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** |  | 
**eventType** | **String** |  | 
**templateKey** | **String** |  | 
**recipientMasked** | **String** |  | 
**channel** | [**JsonObject**](.md) |  | 
**status** | **String** |  | 
**attemptCount** | **int** |  | 
**rateLimitWaitCount** | **int** |  | 
**maxAttempts** | **int** |  | 
**nextAttemptAt** | [**DateTime**](DateTime.md) |  | [optional] 
**lastErrorCode** | **String** |  | [optional] 
**correlationId** | **String** |  | 
**createdAt** | [**DateTime**](DateTime.md) |  | 
**acceptedAt** | [**DateTime**](DateTime.md) |  | [optional] 
**lastAttempt** | [**NotificationAttempt**](NotificationAttempt.md) |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


