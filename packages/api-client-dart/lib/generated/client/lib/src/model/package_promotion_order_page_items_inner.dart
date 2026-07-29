//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'package_promotion_order_page_items_inner.g.dart';

/// PackagePromotionOrderPageItemsInner
///
/// Properties:
/// * [id] 
/// * [status] 
/// * [packagePromotionDiscountRpSnapshot] 
/// * [promotionalPriceRpSnapshot] 
/// * [voucherDiscountRpSnapshot] 
/// * [priceAfterDiscountRpSnapshot] 
/// * [submittedAt] 
@BuiltValue()
abstract class PackagePromotionOrderPageItemsInner implements Built<PackagePromotionOrderPageItemsInner, PackagePromotionOrderPageItemsInnerBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'status')
  String get status;

  @BuiltValueField(wireName: r'packagePromotionDiscountRpSnapshot')
  int? get packagePromotionDiscountRpSnapshot;

  @BuiltValueField(wireName: r'promotionalPriceRpSnapshot')
  int? get promotionalPriceRpSnapshot;

  @BuiltValueField(wireName: r'voucherDiscountRpSnapshot')
  int? get voucherDiscountRpSnapshot;

  @BuiltValueField(wireName: r'priceAfterDiscountRpSnapshot')
  int? get priceAfterDiscountRpSnapshot;

  @BuiltValueField(wireName: r'submittedAt')
  DateTime get submittedAt;

  PackagePromotionOrderPageItemsInner._();

  factory PackagePromotionOrderPageItemsInner([void updates(PackagePromotionOrderPageItemsInnerBuilder b)]) = _$PackagePromotionOrderPageItemsInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PackagePromotionOrderPageItemsInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PackagePromotionOrderPageItemsInner> get serializer => _$PackagePromotionOrderPageItemsInnerSerializer();
}

class _$PackagePromotionOrderPageItemsInnerSerializer implements PrimitiveSerializer<PackagePromotionOrderPageItemsInner> {
  @override
  final Iterable<Type> types = const [PackagePromotionOrderPageItemsInner, _$PackagePromotionOrderPageItemsInner];

  @override
  final String wireName = r'PackagePromotionOrderPageItemsInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PackagePromotionOrderPageItemsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(String),
    );
    if (object.packagePromotionDiscountRpSnapshot != null) {
      yield r'packagePromotionDiscountRpSnapshot';
      yield serializers.serialize(
        object.packagePromotionDiscountRpSnapshot,
        specifiedType: const FullType.nullable(int),
      );
    }
    if (object.promotionalPriceRpSnapshot != null) {
      yield r'promotionalPriceRpSnapshot';
      yield serializers.serialize(
        object.promotionalPriceRpSnapshot,
        specifiedType: const FullType.nullable(int),
      );
    }
    if (object.voucherDiscountRpSnapshot != null) {
      yield r'voucherDiscountRpSnapshot';
      yield serializers.serialize(
        object.voucherDiscountRpSnapshot,
        specifiedType: const FullType.nullable(int),
      );
    }
    if (object.priceAfterDiscountRpSnapshot != null) {
      yield r'priceAfterDiscountRpSnapshot';
      yield serializers.serialize(
        object.priceAfterDiscountRpSnapshot,
        specifiedType: const FullType.nullable(int),
      );
    }
    yield r'submittedAt';
    yield serializers.serialize(
      object.submittedAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PackagePromotionOrderPageItemsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PackagePromotionOrderPageItemsInnerBuilder result,
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
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.status = valueDes;
          break;
        case r'packagePromotionDiscountRpSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.packagePromotionDiscountRpSnapshot = valueDes;
          break;
        case r'promotionalPriceRpSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.promotionalPriceRpSnapshot = valueDes;
          break;
        case r'voucherDiscountRpSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.voucherDiscountRpSnapshot = valueDes;
          break;
        case r'priceAfterDiscountRpSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.priceAfterDiscountRpSnapshot = valueDes;
          break;
        case r'submittedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.submittedAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PackagePromotionOrderPageItemsInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PackagePromotionOrderPageItemsInnerBuilder();
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

