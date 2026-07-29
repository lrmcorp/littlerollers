//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_package_promotion.g.dart';

/// PublicPackagePromotion
///
/// Properties:
/// * [id] 
/// * [name] 
/// * [label] 
/// * [discountType] 
/// * [discountValue] 
/// * [discountRp] 
/// * [promotionalPriceRp] 
/// * [activeFrom] 
/// * [activeUntil] 
/// * [version] 
@BuiltValue()
abstract class PublicPackagePromotion implements Built<PublicPackagePromotion, PublicPackagePromotionBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'label')
  String get label;

  @BuiltValueField(wireName: r'discountType')
  PublicPackagePromotionDiscountTypeEnum get discountType;
  // enum discountTypeEnum {  PERCENTAGE,  FIXED_AMOUNT,  };

  @BuiltValueField(wireName: r'discountValue')
  int get discountValue;

  @BuiltValueField(wireName: r'discountRp')
  int get discountRp;

  @BuiltValueField(wireName: r'promotionalPriceRp')
  int get promotionalPriceRp;

  @BuiltValueField(wireName: r'activeFrom')
  DateTime get activeFrom;

  @BuiltValueField(wireName: r'activeUntil')
  DateTime get activeUntil;

  @BuiltValueField(wireName: r'version')
  int get version;

  PublicPackagePromotion._();

  factory PublicPackagePromotion([void updates(PublicPackagePromotionBuilder b)]) = _$PublicPackagePromotion;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PublicPackagePromotionBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicPackagePromotion> get serializer => _$PublicPackagePromotionSerializer();
}

class _$PublicPackagePromotionSerializer implements PrimitiveSerializer<PublicPackagePromotion> {
  @override
  final Iterable<Type> types = const [PublicPackagePromotion, _$PublicPackagePromotion];

  @override
  final String wireName = r'PublicPackagePromotion';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicPackagePromotion object, {
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
    yield r'label';
    yield serializers.serialize(
      object.label,
      specifiedType: const FullType(String),
    );
    yield r'discountType';
    yield serializers.serialize(
      object.discountType,
      specifiedType: const FullType(PublicPackagePromotionDiscountTypeEnum),
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
    yield r'promotionalPriceRp';
    yield serializers.serialize(
      object.promotionalPriceRp,
      specifiedType: const FullType(int),
    );
    yield r'activeFrom';
    yield serializers.serialize(
      object.activeFrom,
      specifiedType: const FullType(DateTime),
    );
    yield r'activeUntil';
    yield serializers.serialize(
      object.activeUntil,
      specifiedType: const FullType(DateTime),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicPackagePromotion object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicPackagePromotionBuilder result,
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
        case r'label':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.label = valueDes;
          break;
        case r'discountType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PublicPackagePromotionDiscountTypeEnum),
          ) as PublicPackagePromotionDiscountTypeEnum;
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
        case r'promotionalPriceRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.promotionalPriceRp = valueDes;
          break;
        case r'activeFrom':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.activeFrom = valueDes;
          break;
        case r'activeUntil':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.activeUntil = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PublicPackagePromotion deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PublicPackagePromotionBuilder();
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

class PublicPackagePromotionDiscountTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PERCENTAGE')
  static const PublicPackagePromotionDiscountTypeEnum PERCENTAGE = _$publicPackagePromotionDiscountTypeEnum_PERCENTAGE;
  @BuiltValueEnumConst(wireName: r'FIXED_AMOUNT')
  static const PublicPackagePromotionDiscountTypeEnum FIXED_AMOUNT = _$publicPackagePromotionDiscountTypeEnum_FIXED_AMOUNT;

  static Serializer<PublicPackagePromotionDiscountTypeEnum> get serializer => _$publicPackagePromotionDiscountTypeEnumSerializer;

  const PublicPackagePromotionDiscountTypeEnum._(String name): super(name);

  static BuiltSet<PublicPackagePromotionDiscountTypeEnum> get values => _$publicPackagePromotionDiscountTypeEnumValues;
  static PublicPackagePromotionDiscountTypeEnum valueOf(String name) => _$publicPackagePromotionDiscountTypeEnumValueOf(name);
}

