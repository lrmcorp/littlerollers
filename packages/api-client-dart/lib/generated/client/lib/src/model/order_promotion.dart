//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'order_promotion.g.dart';

/// OrderPromotion
///
/// Properties:
/// * [id] 
/// * [name] 
/// * [discountType] 
/// * [discountValue] 
/// * [discountRp] 
@BuiltValue()
abstract class OrderPromotion implements Built<OrderPromotion, OrderPromotionBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'discountType')
  OrderPromotionDiscountTypeEnum get discountType;
  // enum discountTypeEnum {  PERCENTAGE,  FIXED_AMOUNT,  };

  @BuiltValueField(wireName: r'discountValue')
  int get discountValue;

  @BuiltValueField(wireName: r'discountRp')
  int get discountRp;

  OrderPromotion._();

  factory OrderPromotion([void updates(OrderPromotionBuilder b)]) = _$OrderPromotion;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OrderPromotionBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OrderPromotion> get serializer => _$OrderPromotionSerializer();
}

class _$OrderPromotionSerializer implements PrimitiveSerializer<OrderPromotion> {
  @override
  final Iterable<Type> types = const [OrderPromotion, _$OrderPromotion];

  @override
  final String wireName = r'OrderPromotion';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OrderPromotion object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'discountType';
    yield serializers.serialize(
      object.discountType,
      specifiedType: const FullType(OrderPromotionDiscountTypeEnum),
    );
    yield r'discountValue';
    yield serializers.serialize(
      object.discountValue,
      specifiedType: const FullType(int),
    );
    yield r'discountRp';
    yield serializers.serialize(
      object.discountRp,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    OrderPromotion object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OrderPromotionBuilder result,
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
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'discountType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(OrderPromotionDiscountTypeEnum),
          ) as OrderPromotionDiscountTypeEnum;
          result.discountType = valueDes;
          break;
        case r'discountValue':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.discountValue = valueDes;
          break;
        case r'discountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.discountRp = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  OrderPromotion deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OrderPromotionBuilder();
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

class OrderPromotionDiscountTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PERCENTAGE')
  static const OrderPromotionDiscountTypeEnum PERCENTAGE = _$orderPromotionDiscountTypeEnum_PERCENTAGE;
  @BuiltValueEnumConst(wireName: r'FIXED_AMOUNT')
  static const OrderPromotionDiscountTypeEnum FIXED_AMOUNT = _$orderPromotionDiscountTypeEnum_FIXED_AMOUNT;

  static Serializer<OrderPromotionDiscountTypeEnum> get serializer => _$orderPromotionDiscountTypeEnumSerializer;

  const OrderPromotionDiscountTypeEnum._(String name): super(name);

  static BuiltSet<OrderPromotionDiscountTypeEnum> get values => _$orderPromotionDiscountTypeEnumValues;
  static OrderPromotionDiscountTypeEnum valueOf(String name) => _$orderPromotionDiscountTypeEnumValueOf(name);
}

