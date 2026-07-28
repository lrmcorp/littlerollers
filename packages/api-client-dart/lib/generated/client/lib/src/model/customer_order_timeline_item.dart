//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_order_timeline_item.g.dart';

/// CustomerOrderTimelineItem
///
/// Properties:
/// * [id] 
/// * [type] 
/// * [reasonCode] 
/// * [occurredAt] 
/// * [derived] 
@BuiltValue()
abstract class CustomerOrderTimelineItem implements Built<CustomerOrderTimelineItem, CustomerOrderTimelineItemBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'type')
  CustomerOrderTimelineItemTypeEnum get type;
  // enum typeEnum {  ORDER_CREATED,  PAYMENT_DEADLINE_SET,  PROOF_SUBMITTED,  PROOF_SCAN_COMPLETED,  ACTION_REQUIRED,  PAYMENT_APPROVED,  PAYMENT_REJECTED,  ORDER_EXPIRED,  PACKAGE_ACTIVATED,  };

  @BuiltValueField(wireName: r'reasonCode')
  String? get reasonCode;

  @BuiltValueField(wireName: r'occurredAt')
  DateTime get occurredAt;

  @BuiltValueField(wireName: r'derived')
  bool get derived;

  CustomerOrderTimelineItem._();

  factory CustomerOrderTimelineItem([void updates(CustomerOrderTimelineItemBuilder b)]) = _$CustomerOrderTimelineItem;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerOrderTimelineItemBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerOrderTimelineItem> get serializer => _$CustomerOrderTimelineItemSerializer();
}

class _$CustomerOrderTimelineItemSerializer implements PrimitiveSerializer<CustomerOrderTimelineItem> {
  @override
  final Iterable<Type> types = const [CustomerOrderTimelineItem, _$CustomerOrderTimelineItem];

  @override
  final String wireName = r'CustomerOrderTimelineItem';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerOrderTimelineItem object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'type';
    yield serializers.serialize(
      object.type,
      specifiedType: const FullType(CustomerOrderTimelineItemTypeEnum),
    );
    if (object.reasonCode != null) {
      yield r'reasonCode';
      yield serializers.serialize(
        object.reasonCode,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'occurredAt';
    yield serializers.serialize(
      object.occurredAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'derived';
    yield serializers.serialize(
      object.derived,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerOrderTimelineItem object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerOrderTimelineItemBuilder result,
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
        case r'type':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerOrderTimelineItemTypeEnum),
          ) as CustomerOrderTimelineItemTypeEnum;
          result.type = valueDes;
          break;
        case r'reasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.reasonCode = valueDes;
          break;
        case r'occurredAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.occurredAt = valueDes;
          break;
        case r'derived':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.derived = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerOrderTimelineItem deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerOrderTimelineItemBuilder();
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

class CustomerOrderTimelineItemTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ORDER_CREATED')
  static const CustomerOrderTimelineItemTypeEnum ORDER_CREATED = _$customerOrderTimelineItemTypeEnum_ORDER_CREATED;
  @BuiltValueEnumConst(wireName: r'PAYMENT_DEADLINE_SET')
  static const CustomerOrderTimelineItemTypeEnum PAYMENT_DEADLINE_SET = _$customerOrderTimelineItemTypeEnum_PAYMENT_DEADLINE_SET;
  @BuiltValueEnumConst(wireName: r'PROOF_SUBMITTED')
  static const CustomerOrderTimelineItemTypeEnum PROOF_SUBMITTED = _$customerOrderTimelineItemTypeEnum_PROOF_SUBMITTED;
  @BuiltValueEnumConst(wireName: r'PROOF_SCAN_COMPLETED')
  static const CustomerOrderTimelineItemTypeEnum PROOF_SCAN_COMPLETED = _$customerOrderTimelineItemTypeEnum_PROOF_SCAN_COMPLETED;
  @BuiltValueEnumConst(wireName: r'ACTION_REQUIRED')
  static const CustomerOrderTimelineItemTypeEnum ACTION_REQUIRED = _$customerOrderTimelineItemTypeEnum_ACTION_REQUIRED;
  @BuiltValueEnumConst(wireName: r'PAYMENT_APPROVED')
  static const CustomerOrderTimelineItemTypeEnum PAYMENT_APPROVED = _$customerOrderTimelineItemTypeEnum_PAYMENT_APPROVED;
  @BuiltValueEnumConst(wireName: r'PAYMENT_REJECTED')
  static const CustomerOrderTimelineItemTypeEnum PAYMENT_REJECTED = _$customerOrderTimelineItemTypeEnum_PAYMENT_REJECTED;
  @BuiltValueEnumConst(wireName: r'ORDER_EXPIRED')
  static const CustomerOrderTimelineItemTypeEnum ORDER_EXPIRED = _$customerOrderTimelineItemTypeEnum_ORDER_EXPIRED;
  @BuiltValueEnumConst(wireName: r'PACKAGE_ACTIVATED')
  static const CustomerOrderTimelineItemTypeEnum PACKAGE_ACTIVATED = _$customerOrderTimelineItemTypeEnum_PACKAGE_ACTIVATED;

  static Serializer<CustomerOrderTimelineItemTypeEnum> get serializer => _$customerOrderTimelineItemTypeEnumSerializer;

  const CustomerOrderTimelineItemTypeEnum._(String name): super(name);

  static BuiltSet<CustomerOrderTimelineItemTypeEnum> get values => _$customerOrderTimelineItemTypeEnumValues;
  static CustomerOrderTimelineItemTypeEnum valueOf(String name) => _$customerOrderTimelineItemTypeEnumValueOf(name);
}

