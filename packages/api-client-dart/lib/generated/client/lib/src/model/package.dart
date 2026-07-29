//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/date.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'package.g.dart';

/// Immutable commercial key and effective half-open interval [effectiveFrom,effectiveUntil).
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [classTypeId] 
/// * [businessKey] 
/// * [name] 
/// * [sessionCount] 
/// * [durationDays] 
/// * [priceRp] 
/// * [status] 
/// * [effectiveFrom] 
/// * [effectiveUntil] 
/// * [version] 
@BuiltValue(instantiable: false)
abstract class Package  {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'classTypeId')
  String get classTypeId;

  @BuiltValueField(wireName: r'businessKey')
  String get businessKey;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'sessionCount')
  int get sessionCount;

  @BuiltValueField(wireName: r'durationDays')
  int get durationDays;

  @BuiltValueField(wireName: r'priceRp')
  int get priceRp;

  @BuiltValueField(wireName: r'status')
  PackageStatusEnum get status;
  // enum statusEnum {  ACTIVE,  INACTIVE,  };

  @BuiltValueField(wireName: r'effectiveFrom')
  Date get effectiveFrom;

  @BuiltValueField(wireName: r'effectiveUntil')
  Date? get effectiveUntil;

  @BuiltValueField(wireName: r'version')
  int get version;

  @BuiltValueSerializer(custom: true)
  static Serializer<Package> get serializer => _$PackageSerializer();
}

class _$PackageSerializer implements PrimitiveSerializer<Package> {
  @override
  final Iterable<Type> types = const [Package];

  @override
  final String wireName = r'Package';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Package object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'classTypeId';
    yield serializers.serialize(
      object.classTypeId,
      specifiedType: const FullType(String),
    );
    yield r'businessKey';
    yield serializers.serialize(
      object.businessKey,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
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
    yield r'priceRp';
    yield serializers.serialize(
      object.priceRp,
      specifiedType: const FullType(int),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(PackageStatusEnum),
    );
    yield r'effectiveFrom';
    yield serializers.serialize(
      object.effectiveFrom,
      specifiedType: const FullType(Date),
    );
    if (object.effectiveUntil != null) {
      yield r'effectiveUntil';
      yield serializers.serialize(
        object.effectiveUntil,
        specifiedType: const FullType.nullable(Date),
      );
    }
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    Package object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  @override
  Package deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.deserialize(serialized, specifiedType: FullType($Package)) as $Package;
  }
}

/// a concrete implementation of [Package], since [Package] is not instantiable
@BuiltValue(instantiable: true)
abstract class $Package implements Package, Built<$Package, $PackageBuilder> {
  $Package._();

  factory $Package([void Function($PackageBuilder)? updates]) = _$$Package;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults($PackageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<$Package> get serializer => _$$PackageSerializer();
}

class _$$PackageSerializer implements PrimitiveSerializer<$Package> {
  @override
  final Iterable<Type> types = const [$Package, _$$Package];

  @override
  final String wireName = r'$Package';

  @override
  Object serialize(
    Serializers serializers,
    $Package object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.serialize(object, specifiedType: FullType(Package))!;
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PackageBuilder result,
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
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'classTypeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classTypeId = valueDes;
          break;
        case r'businessKey':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.businessKey = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
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
        case r'priceRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.priceRp = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PackageStatusEnum),
          ) as PackageStatusEnum;
          result.status = valueDes;
          break;
        case r'effectiveFrom':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.effectiveFrom = valueDes;
          break;
        case r'effectiveUntil':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(Date),
          ) as Date?;
          if (valueDes == null) continue;
          result.effectiveUntil = valueDes;
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
  $Package deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = $PackageBuilder();
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

class PackageStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const PackageStatusEnum ACTIVE = _$packageStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const PackageStatusEnum INACTIVE = _$packageStatusEnum_INACTIVE;

  static Serializer<PackageStatusEnum> get serializer => _$packageStatusEnumSerializer;

  const PackageStatusEnum._(String name): super(name);

  static BuiltSet<PackageStatusEnum> get values => _$packageStatusEnumValues;
  static PackageStatusEnum valueOf(String name) => _$packageStatusEnumValueOf(name);
}

