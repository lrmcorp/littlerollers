//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'package_promotion.g.dart';

/// PackagePromotion
///
/// Properties:
/// * [id] 
/// * [packageId] 
/// * [name] 
/// * [label] 
/// * [status] 
/// * [effectiveState] 
/// * [discountType] 
/// * [discountValue] 
/// * [discountRp] 
/// * [promotionalPriceRp] 
/// * [activeFrom] 
/// * [activeUntil] 
/// * [version] 
/// * [usageCount] 
@BuiltValue()
abstract class PackagePromotion implements Built<PackagePromotion, PackagePromotionBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'packageId')
  String get packageId;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'label')
  String get label;

  @BuiltValueField(wireName: r'status')
  PackagePromotionStatusEnum get status;
  // enum statusEnum {  DRAFT,  ACTIVE,  PAUSED,  ARCHIVED,  };

  @BuiltValueField(wireName: r'effectiveState')
  PackagePromotionEffectiveStateEnum get effectiveState;
  // enum effectiveStateEnum {  SCHEDULED,  LIVE,  EXPIRED,  DRAFT,  PAUSED,  ARCHIVED,  };

  @BuiltValueField(wireName: r'discountType')
  PackagePromotionDiscountTypeEnum get discountType;
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

  @BuiltValueField(wireName: r'usageCount')
  int? get usageCount;

  PackagePromotion._();

  factory PackagePromotion([void updates(PackagePromotionBuilder b)]) = _$PackagePromotion;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PackagePromotionBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PackagePromotion> get serializer => _$PackagePromotionSerializer();
}

class _$PackagePromotionSerializer implements PrimitiveSerializer<PackagePromotion> {
  @override
  final Iterable<Type> types = const [PackagePromotion, _$PackagePromotion];

  @override
  final String wireName = r'PackagePromotion';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PackagePromotion object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'packageId';
    yield serializers.serialize(
      object.packageId,
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
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(PackagePromotionStatusEnum),
    );
    yield r'effectiveState';
    yield serializers.serialize(
      object.effectiveState,
      specifiedType: const FullType(PackagePromotionEffectiveStateEnum),
    );
    yield r'discountType';
    yield serializers.serialize(
      object.discountType,
      specifiedType: const FullType(PackagePromotionDiscountTypeEnum),
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
    if (object.usageCount != null) {
      yield r'usageCount';
      yield serializers.serialize(
        object.usageCount,
        specifiedType: const FullType(int),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    PackagePromotion object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PackagePromotionBuilder result,
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
        case r'packageId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.packageId = valueDes;
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
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PackagePromotionStatusEnum),
          ) as PackagePromotionStatusEnum;
          result.status = valueDes;
          break;
        case r'effectiveState':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PackagePromotionEffectiveStateEnum),
          ) as PackagePromotionEffectiveStateEnum;
          result.effectiveState = valueDes;
          break;
        case r'discountType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PackagePromotionDiscountTypeEnum),
          ) as PackagePromotionDiscountTypeEnum;
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
        case r'usageCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.usageCount = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PackagePromotion deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PackagePromotionBuilder();
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

class PackagePromotionStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'DRAFT')
  static const PackagePromotionStatusEnum DRAFT = _$packagePromotionStatusEnum_DRAFT;
  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const PackagePromotionStatusEnum ACTIVE = _$packagePromotionStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'PAUSED')
  static const PackagePromotionStatusEnum PAUSED = _$packagePromotionStatusEnum_PAUSED;
  @BuiltValueEnumConst(wireName: r'ARCHIVED')
  static const PackagePromotionStatusEnum ARCHIVED = _$packagePromotionStatusEnum_ARCHIVED;

  static Serializer<PackagePromotionStatusEnum> get serializer => _$packagePromotionStatusEnumSerializer;

  const PackagePromotionStatusEnum._(String name): super(name);

  static BuiltSet<PackagePromotionStatusEnum> get values => _$packagePromotionStatusEnumValues;
  static PackagePromotionStatusEnum valueOf(String name) => _$packagePromotionStatusEnumValueOf(name);
}

class PackagePromotionEffectiveStateEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'SCHEDULED')
  static const PackagePromotionEffectiveStateEnum SCHEDULED = _$packagePromotionEffectiveStateEnum_SCHEDULED;
  @BuiltValueEnumConst(wireName: r'LIVE')
  static const PackagePromotionEffectiveStateEnum LIVE = _$packagePromotionEffectiveStateEnum_LIVE;
  @BuiltValueEnumConst(wireName: r'EXPIRED')
  static const PackagePromotionEffectiveStateEnum EXPIRED = _$packagePromotionEffectiveStateEnum_EXPIRED;
  @BuiltValueEnumConst(wireName: r'DRAFT')
  static const PackagePromotionEffectiveStateEnum DRAFT = _$packagePromotionEffectiveStateEnum_DRAFT;
  @BuiltValueEnumConst(wireName: r'PAUSED')
  static const PackagePromotionEffectiveStateEnum PAUSED = _$packagePromotionEffectiveStateEnum_PAUSED;
  @BuiltValueEnumConst(wireName: r'ARCHIVED')
  static const PackagePromotionEffectiveStateEnum ARCHIVED = _$packagePromotionEffectiveStateEnum_ARCHIVED;

  static Serializer<PackagePromotionEffectiveStateEnum> get serializer => _$packagePromotionEffectiveStateEnumSerializer;

  const PackagePromotionEffectiveStateEnum._(String name): super(name);

  static BuiltSet<PackagePromotionEffectiveStateEnum> get values => _$packagePromotionEffectiveStateEnumValues;
  static PackagePromotionEffectiveStateEnum valueOf(String name) => _$packagePromotionEffectiveStateEnumValueOf(name);
}

class PackagePromotionDiscountTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PERCENTAGE')
  static const PackagePromotionDiscountTypeEnum PERCENTAGE = _$packagePromotionDiscountTypeEnum_PERCENTAGE;
  @BuiltValueEnumConst(wireName: r'FIXED_AMOUNT')
  static const PackagePromotionDiscountTypeEnum FIXED_AMOUNT = _$packagePromotionDiscountTypeEnum_FIXED_AMOUNT;

  static Serializer<PackagePromotionDiscountTypeEnum> get serializer => _$packagePromotionDiscountTypeEnumSerializer;

  const PackagePromotionDiscountTypeEnum._(String name): super(name);

  static BuiltSet<PackagePromotionDiscountTypeEnum> get values => _$packagePromotionDiscountTypeEnumValues;
  static PackagePromotionDiscountTypeEnum valueOf(String name) => _$packagePromotionDiscountTypeEnumValueOf(name);
}

