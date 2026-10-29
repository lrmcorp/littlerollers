//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/package_branch_scope.dart';
import 'package:openapi/src/model/session_duration_minutes.dart';
import 'package:openapi/src/model/package_revision.dart';
import 'package:openapi/src/model/date.dart';
import 'package:openapi/src/model/package_class_type_scope.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'package.g.dart';

/// Global package identity. Availability and eligibility are authoritative in branchScopes and classTypeScopes.
///
/// Properties:
/// * [id] 
/// * [branchScopes] 
/// * [classTypeScopes] 
/// * [revisions] 
/// * [businessKey] 
/// * [name] 
/// * [sessionCount] 
/// * [sessionDurationMinutes] 
/// * [durationDays] 
/// * [priceRp] 
/// * [status] 
/// * [effectiveState] 
/// * [livePromotion] 
/// * [effectiveFrom] 
/// * [effectiveUntil] 
/// * [version] 
@BuiltValue(instantiable: false)
abstract class Package  {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchScopes')
  BuiltList<PackageBranchScope>? get branchScopes;

  @BuiltValueField(wireName: r'classTypeScopes')
  BuiltList<PackageClassTypeScope>? get classTypeScopes;

  @BuiltValueField(wireName: r'revisions')
  BuiltList<PackageRevision>? get revisions;

  @BuiltValueField(wireName: r'businessKey')
  String get businessKey;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'sessionCount')
  int get sessionCount;

  @BuiltValueField(wireName: r'sessionDurationMinutes')
  SessionDurationMinutes? get sessionDurationMinutes;
  // enum sessionDurationMinutesEnum {  60,  120,  };

  @BuiltValueField(wireName: r'durationDays')
  int get durationDays;

  @BuiltValueField(wireName: r'priceRp')
  int get priceRp;

  @BuiltValueField(wireName: r'status')
  PackageStatusEnum get status;
  // enum statusEnum {  ACTIVE,  INACTIVE,  };

  @BuiltValueField(wireName: r'effectiveState')
  PackageEffectiveStateEnum? get effectiveState;
  // enum effectiveStateEnum {  ACTIVE,  SCHEDULED,  EXPIRED,  INACTIVE,  };

  @BuiltValueField(wireName: r'livePromotion')
  bool? get livePromotion;

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
    if (object.branchScopes != null) {
      yield r'branchScopes';
      yield serializers.serialize(
        object.branchScopes,
        specifiedType: const FullType(BuiltList, [FullType(PackageBranchScope)]),
      );
    }
    if (object.classTypeScopes != null) {
      yield r'classTypeScopes';
      yield serializers.serialize(
        object.classTypeScopes,
        specifiedType: const FullType(BuiltList, [FullType(PackageClassTypeScope)]),
      );
    }
    if (object.revisions != null) {
      yield r'revisions';
      yield serializers.serialize(
        object.revisions,
        specifiedType: const FullType(BuiltList, [FullType(PackageRevision)]),
      );
    }
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
    if (object.sessionDurationMinutes != null) {
      yield r'sessionDurationMinutes';
      yield serializers.serialize(
        object.sessionDurationMinutes,
        specifiedType: const FullType(SessionDurationMinutes),
      );
    }
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
    if (object.effectiveState != null) {
      yield r'effectiveState';
      yield serializers.serialize(
        object.effectiveState,
        specifiedType: const FullType(PackageEffectiveStateEnum),
      );
    }
    if (object.livePromotion != null) {
      yield r'livePromotion';
      yield serializers.serialize(
        object.livePromotion,
        specifiedType: const FullType(bool),
      );
    }
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
        case r'branchScopes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PackageBranchScope)]),
          ) as BuiltList<PackageBranchScope>;
          result.branchScopes.replace(valueDes);
          break;
        case r'classTypeScopes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PackageClassTypeScope)]),
          ) as BuiltList<PackageClassTypeScope>;
          result.classTypeScopes.replace(valueDes);
          break;
        case r'revisions':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PackageRevision)]),
          ) as BuiltList<PackageRevision>;
          result.revisions.replace(valueDes);
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
        case r'sessionDurationMinutes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(SessionDurationMinutes),
          ) as SessionDurationMinutes;
          result.sessionDurationMinutes = valueDes;
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
        case r'effectiveState':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PackageEffectiveStateEnum),
          ) as PackageEffectiveStateEnum;
          result.effectiveState = valueDes;
          break;
        case r'livePromotion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.livePromotion = valueDes;
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

class PackageEffectiveStateEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const PackageEffectiveStateEnum ACTIVE = _$packageEffectiveStateEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'SCHEDULED')
  static const PackageEffectiveStateEnum SCHEDULED = _$packageEffectiveStateEnum_SCHEDULED;
  @BuiltValueEnumConst(wireName: r'EXPIRED')
  static const PackageEffectiveStateEnum EXPIRED = _$packageEffectiveStateEnum_EXPIRED;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const PackageEffectiveStateEnum INACTIVE = _$packageEffectiveStateEnum_INACTIVE;

  static Serializer<PackageEffectiveStateEnum> get serializer => _$packageEffectiveStateEnumSerializer;

  const PackageEffectiveStateEnum._(String name): super(name);

  static BuiltSet<PackageEffectiveStateEnum> get values => _$packageEffectiveStateEnumValues;
  static PackageEffectiveStateEnum valueOf(String name) => _$packageEffectiveStateEnumValueOf(name);
}

