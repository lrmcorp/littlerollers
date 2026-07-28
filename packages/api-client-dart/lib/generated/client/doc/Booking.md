# openapi.model.Booking

## Load the model package
```dart
import 'package:openapi/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** |  | 
**branchId** | **String** |  | 
**classSlotId** | **String** |  | 
**customerUserId** | **String** |  | 
**customerPackageId** | **String** |  | 
**reservationId** | **String** |  | 
**createdById** | **String** |  | 
**source_** | **String** |  | 
**status** | **String** |  | 
**reservedQuantity** | **int** |  | 
**createdAt** | [**DateTime**](DateTime.md) |  | 
**version** | **int** |  | 
**idempotentReplay** | **bool** |  | 
**branch** | [**BookingBranch**](BookingBranch.md) |  | [optional] 
**classSlot** | [**BookingClassSlot**](BookingClassSlot.md) |  | [optional] 
**package** | [**BookingClassSlotClassType**](BookingClassSlotClassType.md) |  | [optional] 
**attendance** | [**BookingAttendance**](BookingAttendance.md) |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


