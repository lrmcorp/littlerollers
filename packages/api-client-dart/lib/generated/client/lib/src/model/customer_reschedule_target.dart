//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/booking_branch.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/customer_reschedule_slot.dart';
import 'package:openapi/src/model/voucher_packages_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_reschedule_target.g.dart';

/// CustomerRescheduleTarget
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [classTypeId] 
/// * [startAt] 
/// * [endAt] 
/// * [timezone] 
/// * [status] 
/// * [capacity] 
/// * [bookedCount] 
/// * [branch] 
/// * [classType] 
/// * [availableCapacity] 
@BuiltValue()
abstract class CustomerRescheduleTarget implements CustomerRescheduleSlot, Built<CustomerRescheduleTarget, CustomerRescheduleTargetBuilder> {
  @BuiltValueField(wireName: r'availableCapacity')
  int get availableCapacity;

  CustomerRescheduleTarget._();

  factory CustomerRescheduleTarget([void updates(CustomerRescheduleTargetBuilder b)]) = _$CustomerRescheduleTarget;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerRescheduleTargetBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerRescheduleTarget> get serializer => _$CustomerRescheduleTargetSerializer();
}

class _$CustomerRescheduleTargetSerializer implements PrimitiveSerializer<CustomerRescheduleTarget> {
  @override
  final Iterable<Type> types = const [CustomerRescheduleTarget, _$CustomerRescheduleTarget];

  @override
  final String wireName = r'CustomerRescheduleTarget';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerRescheduleTarget object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'availableCapacity';
    yield serializers.serialize(
      object.availableCapacity,
      specifiedType: const FullType(int),
    );
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'timezone';
    yield serializers.serialize(
      object.timezone,
      specifiedType: const FullType(String),
    );
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'bookedCount';
    yield serializers.serialize(
      object.bookedCount,
      specifiedType: const FullType(int),
    );
    yield r'endAt';
    yield serializers.serialize(
      object.endAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'branch';
    yield serializers.serialize(
      object.branch,
      specifiedType: const FullType(BookingBranch),
    );
    yield r'classTypeId';
    yield serializers.serialize(
      object.classTypeId,
      specifiedType: const FullType(String),
    );
    yield r'startAt';
    yield serializers.serialize(
      object.startAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'classType';
    yield serializers.serialize(
      object.classType,
      specifiedType: const FullType(VoucherPackagesInner),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(CustomerRescheduleSlotStatusEnum),
    );
    yield r'capacity';
    yield serializers.serialize(
      object.capacity,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerRescheduleTarget object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerRescheduleTargetBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'availableCapacity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.availableCapacity = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'timezone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.timezone = valueDes;
          break;
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'bookedCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.bookedCount = valueDes;
          break;
        case r'endAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.endAt = valueDes;
          break;
        case r'branch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BookingBranch),
          ) as BookingBranch;
          result.branch.replace(valueDes);
          break;
        case r'classTypeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classTypeId = valueDes;
          break;
        case r'startAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.startAt = valueDes;
          break;
        case r'classType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(VoucherPackagesInner),
          ) as VoucherPackagesInner;
          result.classType.replace(valueDes);
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerRescheduleSlotStatusEnum),
          ) as CustomerRescheduleSlotStatusEnum;
          result.status = valueDes;
          break;
        case r'capacity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.capacity = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerRescheduleTarget deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerRescheduleTargetBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}

class CustomerRescheduleTargetStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'DRAFT')
  static const CustomerRescheduleTargetStatusEnum DRAFT = _$customerRescheduleTargetStatusEnum_DRAFT;
  @BuiltValueEnumConst(wireName: r'PUBLISHED')
  static const CustomerRescheduleTargetStatusEnum PUBLISHED = _$customerRescheduleTargetStatusEnum_PUBLISHED;
  @BuiltValueEnumConst(wireName: r'CONFIRMED')
  static const CustomerRescheduleTargetStatusEnum CONFIRMED = _$customerRescheduleTargetStatusEnum_CONFIRMED;
  @BuiltValueEnumConst(wireName: r'COMPLETED')
  static const CustomerRescheduleTargetStatusEnum COMPLETED = _$customerRescheduleTargetStatusEnum_COMPLETED;
  @BuiltValueEnumConst(wireName: r'AUTO_CANCELLED')
  static const CustomerRescheduleTargetStatusEnum AUTO_CANCELLED = _$customerRescheduleTargetStatusEnum_AUTO_CANCELLED;
  @BuiltValueEnumConst(wireName: r'MANUAL_CANCELLED')
  static const CustomerRescheduleTargetStatusEnum MANUAL_CANCELLED = _$customerRescheduleTargetStatusEnum_MANUAL_CANCELLED;

  static Serializer<CustomerRescheduleTargetStatusEnum> get serializer => _$customerRescheduleTargetStatusEnumSerializer;

  const CustomerRescheduleTargetStatusEnum._(String name): super(name);

  static BuiltSet<CustomerRescheduleTargetStatusEnum> get values => _$customerRescheduleTargetStatusEnumValues;
  static CustomerRescheduleTargetStatusEnum valueOf(String name) => _$customerRescheduleTargetStatusEnumValueOf(name);
}

