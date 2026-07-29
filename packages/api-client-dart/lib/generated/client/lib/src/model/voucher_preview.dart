//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'voucher_preview.g.dart';

/// VoucherPreview
///
/// Properties:
/// * [valid] 
/// * [voucherId] 
/// * [code] 
/// * [packagePriceRp] 
/// * [packagePromotionDiscountRp] 
/// * [promotionalPriceRp] 
/// * [baseAmountRp] 
/// * [discountRp] 
/// * [priceAfterDiscountRp] 
@BuiltValue()
abstract class VoucherPreview implements Built<VoucherPreview, VoucherPreviewBuilder> {
  @BuiltValueField(wireName: r'valid')
  VoucherPreviewValidEnum get valid;
  // enum validEnum {  true,  };

  @BuiltValueField(wireName: r'voucherId')
  String get voucherId;

  @BuiltValueField(wireName: r'code')
  String get code;

  @BuiltValueField(wireName: r'packagePriceRp')
  int get packagePriceRp;

  @BuiltValueField(wireName: r'packagePromotionDiscountRp')
  int get packagePromotionDiscountRp;

  @BuiltValueField(wireName: r'promotionalPriceRp')
  int get promotionalPriceRp;

  @BuiltValueField(wireName: r'baseAmountRp')
  int get baseAmountRp;

  @BuiltValueField(wireName: r'discountRp')
  int get discountRp;

  @BuiltValueField(wireName: r'priceAfterDiscountRp')
  int get priceAfterDiscountRp;

  VoucherPreview._();

  factory VoucherPreview([void updates(VoucherPreviewBuilder b)]) = _$VoucherPreview;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(VoucherPreviewBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<VoucherPreview> get serializer => _$VoucherPreviewSerializer();
}

class _$VoucherPreviewSerializer implements PrimitiveSerializer<VoucherPreview> {
  @override
  final Iterable<Type> types = const [VoucherPreview, _$VoucherPreview];

  @override
  final String wireName = r'VoucherPreview';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    VoucherPreview object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'valid';
    yield serializers.serialize(
      object.valid,
      specifiedType: const FullType(VoucherPreviewValidEnum),
    );
    yield r'voucherId';
    yield serializers.serialize(
      object.voucherId,
      specifiedType: const FullType(String),
    );
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
    yield r'packagePriceRp';
    yield serializers.serialize(
      object.packagePriceRp,
      specifiedType: const FullType(int),
    );
    yield r'packagePromotionDiscountRp';
    yield serializers.serialize(
      object.packagePromotionDiscountRp,
      specifiedType: const FullType(int),
    );
    yield r'promotionalPriceRp';
    yield serializers.serialize(
      object.promotionalPriceRp,
      specifiedType: const FullType(int),
    );
    yield r'baseAmountRp';
    yield serializers.serialize(
      object.baseAmountRp,
      specifiedType: const FullType(int),
    );
    yield r'discountRp';
    yield serializers.serialize(
      object.discountRp,
      specifiedType: const FullType(int),
    );
    yield r'priceAfterDiscountRp';
    yield serializers.serialize(
      object.priceAfterDiscountRp,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    VoucherPreview object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required VoucherPreviewBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'valid':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(VoucherPreviewValidEnum),
          ) as VoucherPreviewValidEnum;
          result.valid = valueDes;
          break;
        case r'voucherId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.voucherId = valueDes;
          break;
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
        case r'packagePriceRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.packagePriceRp = valueDes;
          break;
        case r'packagePromotionDiscountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.packagePromotionDiscountRp = valueDes;
          break;
        case r'promotionalPriceRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.promotionalPriceRp = valueDes;
          break;
        case r'baseAmountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.baseAmountRp = valueDes;
          break;
        case r'discountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.discountRp = valueDes;
          break;
        case r'priceAfterDiscountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.priceAfterDiscountRp = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  VoucherPreview deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = VoucherPreviewBuilder();
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

class VoucherPreviewValidEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'true')
  static const VoucherPreviewValidEnum true_ = _$voucherPreviewValidEnum_true_;

  static Serializer<VoucherPreviewValidEnum> get serializer => _$voucherPreviewValidEnumSerializer;

  const VoucherPreviewValidEnum._(String name): super(name);

  static BuiltSet<VoucherPreviewValidEnum> get values => _$voucherPreviewValidEnumValues;
  static VoucherPreviewValidEnum valueOf(String name) => _$voucherPreviewValidEnumValueOf(name);
}

