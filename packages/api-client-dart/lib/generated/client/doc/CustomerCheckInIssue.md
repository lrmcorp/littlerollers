# openapi.model.CustomerCheckInIssue

## Load the model package
```dart
import 'package:openapi/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** |  | 
**purpose** | [**JsonObject**](.md) |  | 
**bookingId** | **String** |  | 
**notBeforeAt** | [**DateTime**](DateTime.md) |  | 
**expiresAt** | [**DateTime**](DateTime.md) |  | 
**status** | **String** |  | 
**version** | **int** |  | 
**token** | **String** | Returned only once; never log, persist as plaintext, or send to analytics. | 
**qrPayload** | **String** |  | 
**passUrl** | **String** |  | 
**maskedCustomerPhone** | **String** |  | 
**whatsappUrl** | **String** |  | 
**message** | **String** |  | 
**idempotentReplay** | **bool** |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


