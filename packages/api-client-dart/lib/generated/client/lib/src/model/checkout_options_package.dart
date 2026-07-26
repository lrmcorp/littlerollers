//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'checkout_options_package.g.dart';

/// CheckoutOptionsPackage
///
/// Properties:
/// * [id] 
/// * [name] 
/// * [priceRp] 
/// * [sessionCount] 
/// * [durationDays] 
/// * [branchId] 
/// * [branchName] 
/// * [classTypeId] 
/// * [classTypeName] 
@BuiltValue()
abstract class CheckoutOptionsPackage implements Built<CheckoutOptionsPackage, CheckoutOptionsPackageBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'priceRp')
  int get priceRp;

  @BuiltValueField(wireName: r'sessionCount')
  int get sessionCount;

  @BuiltValueField(wireName: r'durationDays')
  int get durationDays;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'branchName')
  String get branchName;

  @BuiltValueField(wireName: r'classTypeId')
  String get classTypeId;

  @BuiltValueField(wireName: r'classTypeName')
  String get classTypeName;

  CheckoutOptionsPackage._();

  factory CheckoutOptionsPackage([void updates(CheckoutOptionsPackageBuilder b)]) = _$CheckoutOptionsPackage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CheckoutOptionsPackageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CheckoutOptionsPackage> get serializer => _$CheckoutOptionsPackageSerializer();
}

class _$CheckoutOptionsPackageSerializer implements PrimitiveSerializer<CheckoutOptionsPackage> {
  @override
  final Iterable<Type> types = const [CheckoutOptionsPackage, _$CheckoutOptionsPackage];

  @override
  final String wireName = r'CheckoutOptionsPackage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CheckoutOptionsPackage object, {
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
    yield r'priceRp';
    yield serializers.serialize(
      object.priceRp,
      specifiedType: const FullType(int),
    );
    yield r'sessionCount';
    yield serializers.serialize(
      object.sessionCount,
      specifiedType: const FullType(int),
    );
    yield r'durationDays';
    yield serializers.serialize(
      object.durationDays,
      specifiedType: const FullType(int),
    );
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'branchName';
    yield serializers.serialize(
      object.branchName,
      specifiedType: const FullType(String),
    );
    yield r'classTypeId';
    yield serializers.serialize(
      object.classTypeId,
      specifiedType: const FullType(String),
    );
    yield r'classTypeName';
    yield serializers.serialize(
      object.classTypeName,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CheckoutOptionsPackage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CheckoutOptionsPackageBuilder result,
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
        case r'priceRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.priceRp = valueDes;
          break;
        case r'sessionCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sessionCount = valueDes;
          break;
        case r'durationDays':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.durationDays = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'branchName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchName = valueDes;
          break;
        case r'classTypeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classTypeId = valueDes;
          break;
        case r'classTypeName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classTypeName = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CheckoutOptionsPackage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CheckoutOptionsPackageBuilder();
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

