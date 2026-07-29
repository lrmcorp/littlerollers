//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'package_promotion_command.g.dart';

/// PackagePromotionCommand
///
/// Properties:
/// * [name] 
/// * [label] 
/// * [discountType] 
/// * [discountValue] 
/// * [activeFrom] 
/// * [activeUntil] 
/// * [reason] 
@BuiltValue(instantiable: false)
abstract class PackagePromotionCommand  {
  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'label')
  String get label;

  @BuiltValueField(wireName: r'discountType')
  PackagePromotionCommandDiscountTypeEnum get discountType;
  // enum discountTypeEnum {  PERCENTAGE,  FIXED_AMOUNT,  };

  @BuiltValueField(wireName: r'discountValue')
  int get discountValue;

  @BuiltValueField(wireName: r'activeFrom')
  DateTime get activeFrom;

  @BuiltValueField(wireName: r'activeUntil')
  DateTime get activeUntil;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  @BuiltValueSerializer(custom: true)
  static Serializer<PackagePromotionCommand> get serializer => _$PackagePromotionCommandSerializer();
}

class _$PackagePromotionCommandSerializer implements PrimitiveSerializer<PackagePromotionCommand> {
  @override
  final Iterable<Type> types = const [PackagePromotionCommand];

  @override
  final String wireName = r'PackagePromotionCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PackagePromotionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
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
      specifiedType: const FullType(PackagePromotionCommandDiscountTypeEnum),
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
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PackagePromotionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  @override
  PackagePromotionCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.deserialize(serialized, specifiedType: FullType($PackagePromotionCommand)) as $PackagePromotionCommand;
  }
}

/// a concrete implementation of [PackagePromotionCommand], since [PackagePromotionCommand] is not instantiable
@BuiltValue(instantiable: true)
abstract class $PackagePromotionCommand implements PackagePromotionCommand, Built<$PackagePromotionCommand, $PackagePromotionCommandBuilder> {
  $PackagePromotionCommand._();

  factory $PackagePromotionCommand([void Function($PackagePromotionCommandBuilder)? updates]) = _$$PackagePromotionCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults($PackagePromotionCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<$PackagePromotionCommand> get serializer => _$$PackagePromotionCommandSerializer();
}

class _$$PackagePromotionCommandSerializer implements PrimitiveSerializer<$PackagePromotionCommand> {
  @override
  final Iterable<Type> types = const [$PackagePromotionCommand, _$$PackagePromotionCommand];

  @override
  final String wireName = r'$PackagePromotionCommand';

  @override
  Object serialize(
    Serializers serializers,
    $PackagePromotionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.serialize(object, specifiedType: FullType(PackagePromotionCommand))!;
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PackagePromotionCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
            specifiedType: const FullType(PackagePromotionCommandDiscountTypeEnum),
          ) as PackagePromotionCommandDiscountTypeEnum;
          result.discountType = valueDes;
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
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  $PackagePromotionCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = $PackagePromotionCommandBuilder();
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

class PackagePromotionCommandDiscountTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PERCENTAGE')
  static const PackagePromotionCommandDiscountTypeEnum PERCENTAGE = _$packagePromotionCommandDiscountTypeEnum_PERCENTAGE;
  @BuiltValueEnumConst(wireName: r'FIXED_AMOUNT')
  static const PackagePromotionCommandDiscountTypeEnum FIXED_AMOUNT = _$packagePromotionCommandDiscountTypeEnum_FIXED_AMOUNT;

  static Serializer<PackagePromotionCommandDiscountTypeEnum> get serializer => _$packagePromotionCommandDiscountTypeEnumSerializer;

  const PackagePromotionCommandDiscountTypeEnum._(String name): super(name);

  static BuiltSet<PackagePromotionCommandDiscountTypeEnum> get values => _$packagePromotionCommandDiscountTypeEnumValues;
  static PackagePromotionCommandDiscountTypeEnum valueOf(String name) => _$packagePromotionCommandDiscountTypeEnumValueOf(name);
}

