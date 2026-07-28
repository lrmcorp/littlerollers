//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'payment_usage_history_item.g.dart';

/// PaymentUsageHistoryItem
///
/// Properties:
/// * [id] 
/// * [type] 
/// * [label] 
/// * [quantity] 
/// * [balanceAfter] 
/// * [occurredAt] 
/// * [referenceType] 
/// * [referenceId] 
@BuiltValue()
abstract class PaymentUsageHistoryItem implements Built<PaymentUsageHistoryItem, PaymentUsageHistoryItemBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'type')
  PaymentUsageHistoryItemTypeEnum get type;
  // enum typeEnum {  PURCHASE,  ATTEND,  REVERSAL,  ADJUST_MANUAL,  MIGRATION_OPENING,  };

  @BuiltValueField(wireName: r'label')
  String get label;

  @BuiltValueField(wireName: r'quantity')
  int get quantity;

  @BuiltValueField(wireName: r'balanceAfter')
  int get balanceAfter;

  @BuiltValueField(wireName: r'occurredAt')
  DateTime get occurredAt;

  @BuiltValueField(wireName: r'referenceType')
  String get referenceType;

  @BuiltValueField(wireName: r'referenceId')
  String get referenceId;

  PaymentUsageHistoryItem._();

  factory PaymentUsageHistoryItem([void updates(PaymentUsageHistoryItemBuilder b)]) = _$PaymentUsageHistoryItem;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PaymentUsageHistoryItemBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PaymentUsageHistoryItem> get serializer => _$PaymentUsageHistoryItemSerializer();
}

class _$PaymentUsageHistoryItemSerializer implements PrimitiveSerializer<PaymentUsageHistoryItem> {
  @override
  final Iterable<Type> types = const [PaymentUsageHistoryItem, _$PaymentUsageHistoryItem];

  @override
  final String wireName = r'PaymentUsageHistoryItem';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PaymentUsageHistoryItem object, {
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
      specifiedType: const FullType(PaymentUsageHistoryItemTypeEnum),
    );
    yield r'label';
    yield serializers.serialize(
      object.label,
      specifiedType: const FullType(String),
    );
    yield r'quantity';
    yield serializers.serialize(
      object.quantity,
      specifiedType: const FullType(int),
    );
    yield r'balanceAfter';
    yield serializers.serialize(
      object.balanceAfter,
      specifiedType: const FullType(int),
    );
    yield r'occurredAt';
    yield serializers.serialize(
      object.occurredAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'referenceType';
    yield serializers.serialize(
      object.referenceType,
      specifiedType: const FullType(String),
    );
    yield r'referenceId';
    yield serializers.serialize(
      object.referenceId,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PaymentUsageHistoryItem object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PaymentUsageHistoryItemBuilder result,
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
            specifiedType: const FullType(PaymentUsageHistoryItemTypeEnum),
          ) as PaymentUsageHistoryItemTypeEnum;
          result.type = valueDes;
          break;
        case r'label':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.label = valueDes;
          break;
        case r'quantity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.quantity = valueDes;
          break;
        case r'balanceAfter':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.balanceAfter = valueDes;
          break;
        case r'occurredAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.occurredAt = valueDes;
          break;
        case r'referenceType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.referenceType = valueDes;
          break;
        case r'referenceId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.referenceId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PaymentUsageHistoryItem deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PaymentUsageHistoryItemBuilder();
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

class PaymentUsageHistoryItemTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PURCHASE')
  static const PaymentUsageHistoryItemTypeEnum PURCHASE = _$paymentUsageHistoryItemTypeEnum_PURCHASE;
  @BuiltValueEnumConst(wireName: r'ATTEND')
  static const PaymentUsageHistoryItemTypeEnum ATTEND = _$paymentUsageHistoryItemTypeEnum_ATTEND;
  @BuiltValueEnumConst(wireName: r'REVERSAL')
  static const PaymentUsageHistoryItemTypeEnum REVERSAL = _$paymentUsageHistoryItemTypeEnum_REVERSAL;
  @BuiltValueEnumConst(wireName: r'ADJUST_MANUAL')
  static const PaymentUsageHistoryItemTypeEnum ADJUST_MANUAL = _$paymentUsageHistoryItemTypeEnum_ADJUST_MANUAL;
  @BuiltValueEnumConst(wireName: r'MIGRATION_OPENING')
  static const PaymentUsageHistoryItemTypeEnum MIGRATION_OPENING = _$paymentUsageHistoryItemTypeEnum_MIGRATION_OPENING;

  static Serializer<PaymentUsageHistoryItemTypeEnum> get serializer => _$paymentUsageHistoryItemTypeEnumSerializer;

  const PaymentUsageHistoryItemTypeEnum._(String name): super(name);

  static BuiltSet<PaymentUsageHistoryItemTypeEnum> get values => _$paymentUsageHistoryItemTypeEnumValues;
  static PaymentUsageHistoryItemTypeEnum valueOf(String name) => _$paymentUsageHistoryItemTypeEnumValueOf(name);
}

