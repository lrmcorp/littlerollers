# openapi.model.Session

## Load the model package
```dart
import 'package:openapi/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**accessToken** | **String** | Mobile only; web uses secure HttpOnly cookie | [optional] 
**refreshToken** | **String** | Mobile only and returned only at issuance/rotation | [optional] 
**user** | [**Me**](Me.md) |  | 
**channel** | **String** |  | 
**expiresAt** | [**DateTime**](DateTime.md) |  | 
**refreshExpiresAt** | [**DateTime**](DateTime.md) |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


