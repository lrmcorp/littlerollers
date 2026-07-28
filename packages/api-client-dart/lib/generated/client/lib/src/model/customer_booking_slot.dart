//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/customer_booking_slot_class_type.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/customer_booking_slot_branch.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_booking_slot.g.dart';

/// CustomerBookingSlot
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
/// * [available] 
/// * [branch] 
/// * [classType] 
@BuiltValue()
abstract class CustomerBookingSlot implements Built<CustomerBookingSlot, CustomerBookingSlotBuilder> {
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
  CustomerBookingSlotStatusEnum get status;
  // enum statusEnum {  DRAFT,  PUBLISHED,  CONFIRMED,  AUTO_CANCELLED,  CANCELLED,  COMPLETED,  };

  @BuiltValueField(wireName: r'capacity')
  int get capacity;

  @BuiltValueField(wireName: r'bookedCount')
  int get bookedCount;

  @BuiltValueField(wireName: r'available')
  int get available;

  @BuiltValueField(wireName: r'branch')
  CustomerBookingSlotBranch get branch;

  @BuiltValueField(wireName: r'classType')
  CustomerBookingSlotClassType get classType;

  CustomerBookingSlot._();

  factory CustomerBookingSlot([void updates(CustomerBookingSlotBuilder b)]) = _$CustomerBookingSlot;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerBookingSlotBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerBookingSlot> get serializer => _$CustomerBookingSlotSerializer();
}

class _$CustomerBookingSlotSerializer implements PrimitiveSerializer<CustomerBookingSlot> {
  @override
  final Iterable<Type> types = const [CustomerBookingSlot, _$CustomerBookingSlot];

  @override
  final String wireName = r'CustomerBookingSlot';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerBookingSlot object, {
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
      specifiedType: const FullType(CustomerBookingSlotStatusEnum),
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
    yield r'available';
    yield serializers.serialize(
      object.available,
      specifiedType: const FullType(int),
    );
    yield r'branch';
    yield serializers.serialize(
      object.branch,
      specifiedType: const FullType(CustomerBookingSlotBranch),
    );
    yield r'classType';
    yield serializers.serialize(
      object.classType,
      specifiedType: const FullType(CustomerBookingSlotClassType),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerBookingSlot object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerBookingSlotBuilder result,
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
            specifiedType: const FullType(CustomerBookingSlotStatusEnum),
          ) as CustomerBookingSlotStatusEnum;
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
        case r'available':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.available = valueDes;
          break;
        case r'branch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerBookingSlotBranch),
          ) as CustomerBookingSlotBranch;
          result.branch.replace(valueDes);
          break;
        case r'classType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerBookingSlotClassType),
          ) as CustomerBookingSlotClassType;
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
  CustomerBookingSlot deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerBookingSlotBuilder();
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

class CustomerBookingSlotStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'DRAFT')
  static const CustomerBookingSlotStatusEnum DRAFT = _$customerBookingSlotStatusEnum_DRAFT;
  @BuiltValueEnumConst(wireName: r'PUBLISHED')
  static const CustomerBookingSlotStatusEnum PUBLISHED = _$customerBookingSlotStatusEnum_PUBLISHED;
  @BuiltValueEnumConst(wireName: r'CONFIRMED')
  static const CustomerBookingSlotStatusEnum CONFIRMED = _$customerBookingSlotStatusEnum_CONFIRMED;
  @BuiltValueEnumConst(wireName: r'AUTO_CANCELLED')
  static const CustomerBookingSlotStatusEnum AUTO_CANCELLED = _$customerBookingSlotStatusEnum_AUTO_CANCELLED;
  @BuiltValueEnumConst(wireName: r'CANCELLED')
  static const CustomerBookingSlotStatusEnum CANCELLED = _$customerBookingSlotStatusEnum_CANCELLED;
  @BuiltValueEnumConst(wireName: r'COMPLETED')
  static const CustomerBookingSlotStatusEnum COMPLETED = _$customerBookingSlotStatusEnum_COMPLETED;

  static Serializer<CustomerBookingSlotStatusEnum> get serializer => _$customerBookingSlotStatusEnumSerializer;

  const CustomerBookingSlotStatusEnum._(String name): super(name);

  static BuiltSet<CustomerBookingSlotStatusEnum> get values => _$customerBookingSlotStatusEnumValues;
  static CustomerBookingSlotStatusEnum valueOf(String name) => _$customerBookingSlotStatusEnumValueOf(name);
}

