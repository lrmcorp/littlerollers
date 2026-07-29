//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/package_promotion_command.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'package_promotion_update_command.g.dart';

/// PackagePromotionUpdateCommand
///
/// Properties:
/// * [name] 
/// * [label] 
/// * [discountType] 
/// * [discountValue] 
/// * [activeFrom] 
/// * [activeUntil] 
/// * [reason] 
/// * [expectedVersion] 
@BuiltValue()
abstract class PackagePromotionUpdateCommand implements PackagePromotionCommand, Built<PackagePromotionUpdateCommand, PackagePromotionUpdateCommandBuilder> {
  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  PackagePromotionUpdateCommand._();

  factory PackagePromotionUpdateCommand([void updates(PackagePromotionUpdateCommandBuilder b)]) = _$PackagePromotionUpdateCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PackagePromotionUpdateCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PackagePromotionUpdateCommand> get serializer => _$PackagePromotionUpdateCommandSerializer();
}

class _$PackagePromotionUpdateCommandSerializer implements PrimitiveSerializer<PackagePromotionUpdateCommand> {
  @override
  final Iterable<Type> types = const [PackagePromotionUpdateCommand, _$PackagePromotionUpdateCommand];

  @override
  final String wireName = r'PackagePromotionUpdateCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PackagePromotionUpdateCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'reason';
    yield serializers.serialize(
      object.reason,
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
      specifiedType: const FullType(PackagePromotionCommandDiscountTypeEnum),
    );
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
    yield r'label';
    yield serializers.serialize(
      object.label,
      specifiedType: const FullType(String),
    );
    yield r'discountValue';
    yield serializers.serialize(
      object.discountValue,
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
  }

  @override
  Object serialize(
    Serializers serializers,
    PackagePromotionUpdateCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PackagePromotionUpdateCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
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
            specifiedType: const FullType(PackagePromotionCommandDiscountTypeEnum),
          ) as PackagePromotionCommandDiscountTypeEnum;
          result.discountType = valueDes;
          break;
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
          break;
        case r'label':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.label = valueDes;
          break;
        case r'discountValue':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.discountValue = valueDes;
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PackagePromotionUpdateCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PackagePromotionUpdateCommandBuilder();
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

class PackagePromotionUpdateCommandDiscountTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PERCENTAGE')
  static const PackagePromotionUpdateCommandDiscountTypeEnum PERCENTAGE = _$packagePromotionUpdateCommandDiscountTypeEnum_PERCENTAGE;
  @BuiltValueEnumConst(wireName: r'FIXED_AMOUNT')
  static const PackagePromotionUpdateCommandDiscountTypeEnum FIXED_AMOUNT = _$packagePromotionUpdateCommandDiscountTypeEnum_FIXED_AMOUNT;

  static Serializer<PackagePromotionUpdateCommandDiscountTypeEnum> get serializer => _$packagePromotionUpdateCommandDiscountTypeEnumSerializer;

  const PackagePromotionUpdateCommandDiscountTypeEnum._(String name): super(name);

  static BuiltSet<PackagePromotionUpdateCommandDiscountTypeEnum> get values => _$packagePromotionUpdateCommandDiscountTypeEnumValues;
  static PackagePromotionUpdateCommandDiscountTypeEnum valueOf(String name) => _$packagePromotionUpdateCommandDiscountTypeEnumValueOf(name);
}

