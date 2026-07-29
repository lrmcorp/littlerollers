# openapi.model.Voucher

## Load the model package
```dart
import 'package:openapi/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** |  | 
**code** | **String** |  | 
**name** | **String** |  | 
**description** | **String** |  | [optional] 
**status** | **String** |  | 
**discountType** | **String** |  | 
**discountValue** | **int** |  | 
**maxDiscountRp** | **int** |  | [optional] 
**minimumPurchaseRp** | **int** |  | 
**activeFrom** | [**DateTime**](DateTime.md) |  | 
**activeUntil** | [**DateTime**](DateTime.md) |  | [optional] 
**totalUsageLimit** | **int** |  | [optional] 
**perCustomerUsageLimit** | **int** |  | [optional] 
**branch** | [**JsonObject**](.md) |  | [optional] 
**classType** | [**JsonObject**](.md) |  | [optional] 
**packageIds** | **BuiltList&lt;String&gt;** |  | [optional] 
**packages** | [**BuiltList&lt;VoucherPackagesInner&gt;**](VoucherPackagesInner.md) |  | [optional] 
**redeemedCount** | **int** |  | [optional] 
**version** | **int** |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


