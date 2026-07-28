//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/booking_branch.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/booking_class_slot_class_type.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_reschedule_slot.g.dart';

/// CustomerRescheduleSlot
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
@BuiltValue(instantiable: false)
abstract class CustomerRescheduleSlot  {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'classTypeId')
  String get classTypeId;

  @BuiltValueField(wireName: r'startAt')
  DateTime get startAt;

  @BuiltValueField(wireName: r'endAt')
  DateTime get endAt;

  @BuiltValueField(wireName: r'timezone')
  String get timezone;

  @BuiltValueField(wireName: r'status')
  CustomerRescheduleSlotStatusEnum get status;
  // enum statusEnum {  DRAFT,  PUBLISHED,  CONFIRMED,  COMPLETED,  AUTO_CANCELLED,  MANUAL_CANCELLED,  };

  @BuiltValueField(wireName: r'capacity')
  int get capacity;

  @BuiltValueField(wireName: r'bookedCount')
  int get bookedCount;

  @BuiltValueField(wireName: r'branch')
  BookingBranch get branch;

  @BuiltValueField(wireName: r'classType')
  BookingClassSlotClassType get classType;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerRescheduleSlot> get serializer => _$CustomerRescheduleSlotSerializer();
}

class _$CustomerRescheduleSlotSerializer implements PrimitiveSerializer<CustomerRescheduleSlot> {
  @override
  final Iterable<Type> types = const [CustomerRescheduleSlot];

  @override
  final String wireName = r'CustomerRescheduleSlot';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerRescheduleSlot object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
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
    yield r'endAt';
    yield serializers.serialize(
      object.endAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'timezone';
    yield serializers.serialize(
      object.timezone,
      specifiedType: const FullType(String),
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
    yield r'bookedCount';
    yield serializers.serialize(
      object.bookedCount,
      specifiedType: const FullType(int),
    );
    yield r'branch';
    yield serializers.serialize(
      object.branch,
      specifiedType: const FullType(BookingBranch),
    );
    yield r'classType';
    yield serializers.serialize(
      object.classType,
      specifiedType: const FullType(BookingClassSlotClassType),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerRescheduleSlot object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  @override
  CustomerRescheduleSlot deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.deserialize(serialized, specifiedType: FullType($CustomerRescheduleSlot)) as $CustomerRescheduleSlot;
  }
}

/// a concrete implementation of [CustomerRescheduleSlot], since [CustomerRescheduleSlot] is not instantiable
@BuiltValue(instantiable: true)
abstract class $CustomerRescheduleSlot implements CustomerRescheduleSlot, Built<$CustomerRescheduleSlot, $CustomerRescheduleSlotBuilder> {
  $CustomerRescheduleSlot._();

  factory $CustomerRescheduleSlot([void Function($CustomerRescheduleSlotBuilder)? updates]) = _$$CustomerRescheduleSlot;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults($CustomerRescheduleSlotBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<$CustomerRescheduleSlot> get serializer => _$$CustomerRescheduleSlotSerializer();
}

class _$$CustomerRescheduleSlotSerializer implements PrimitiveSerializer<$CustomerRescheduleSlot> {
  @override
  final Iterable<Type> types = const [$CustomerRescheduleSlot, _$$CustomerRescheduleSlot];

  @override
  final String wireName = r'$CustomerRescheduleSlot';

  @override
  Object serialize(
    Serializers serializers,
    $CustomerRescheduleSlot object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.serialize(object, specifiedType: FullType(CustomerRescheduleSlot))!;
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerRescheduleSlotBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
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
        case r'endAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.endAt = valueDes;
          break;
        case r'timezone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.timezone = valueDes;
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
        case r'bookedCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.bookedCount = valueDes;
          break;
        case r'branch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BookingBranch),
          ) as BookingBranch;
          result.branch.replace(valueDes);
          break;
        case r'classType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BookingClassSlotClassType),
          ) as BookingClassSlotClassType;
          result.classType.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  $CustomerRescheduleSlot deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = $CustomerRescheduleSlotBuilder();
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

class CustomerRescheduleSlotStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'DRAFT')
  static const CustomerRescheduleSlotStatusEnum DRAFT = _$customerRescheduleSlotStatusEnum_DRAFT;
  @BuiltValueEnumConst(wireName: r'PUBLISHED')
  static const CustomerRescheduleSlotStatusEnum PUBLISHED = _$customerRescheduleSlotStatusEnum_PUBLISHED;
  @BuiltValueEnumConst(wireName: r'CONFIRMED')
  static const CustomerRescheduleSlotStatusEnum CONFIRMED = _$customerRescheduleSlotStatusEnum_CONFIRMED;
  @BuiltValueEnumConst(wireName: r'COMPLETED')
  static const CustomerRescheduleSlotStatusEnum COMPLETED = _$customerRescheduleSlotStatusEnum_COMPLETED;
  @BuiltValueEnumConst(wireName: r'AUTO_CANCELLED')
  static const CustomerRescheduleSlotStatusEnum AUTO_CANCELLED = _$customerRescheduleSlotStatusEnum_AUTO_CANCELLED;
  @BuiltValueEnumConst(wireName: r'MANUAL_CANCELLED')
  static const CustomerRescheduleSlotStatusEnum MANUAL_CANCELLED = _$customerRescheduleSlotStatusEnum_MANUAL_CANCELLED;

  static Serializer<CustomerRescheduleSlotStatusEnum> get serializer => _$customerRescheduleSlotStatusEnumSerializer;

  const CustomerRescheduleSlotStatusEnum._(String name): super(name);

  static BuiltSet<CustomerRescheduleSlotStatusEnum> get values => _$customerRescheduleSlotStatusEnumValues;
  static CustomerRescheduleSlotStatusEnum valueOf(String name) => _$customerRescheduleSlotStatusEnumValueOf(name);
}

