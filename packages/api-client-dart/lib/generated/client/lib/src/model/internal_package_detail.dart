//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/package.dart';
import 'package:openapi/src/model/package_branch_scope.dart';
import 'package:openapi/src/model/package_promotion.dart';
import 'package:openapi/src/model/safe_audit_activity.dart';
import 'package:openapi/src/model/date.dart';
import 'package:openapi/src/model/package_class_type_scope.dart';
import 'package:openapi/src/model/package_revision.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'internal_package_detail.g.dart';

/// InternalPackageDetail
///
/// Properties:
/// * [id] 
/// * [branchScopes] 
/// * [classTypeScopes] 
/// * [revisions] 
/// * [businessKey] 
/// * [name] 
/// * [sessionCount] 
/// * [durationDays] 
/// * [priceRp] 
/// * [status] 
/// * [effectiveState] 
/// * [livePromotion] 
/// * [effectiveFrom] 
/// * [effectiveUntil] 
/// * [version] 
/// * [promotions] 
/// * [auditActivity] 
@BuiltValue()
abstract class InternalPackageDetail implements Package, Built<InternalPackageDetail, InternalPackageDetailBuilder> {
  @BuiltValueField(wireName: r'promotions')
  BuiltList<PackagePromotion> get promotions;

  @BuiltValueField(wireName: r'auditActivity')
  BuiltList<SafeAuditActivity> get auditActivity;

  InternalPackageDetail._();

  factory InternalPackageDetail([void updates(InternalPackageDetailBuilder b)]) = _$InternalPackageDetail;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(InternalPackageDetailBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<InternalPackageDetail> get serializer => _$InternalPackageDetailSerializer();
}

class _$InternalPackageDetailSerializer implements PrimitiveSerializer<InternalPackageDetail> {
  @override
  final Iterable<Type> types = const [InternalPackageDetail, _$InternalPackageDetail];

  @override
  final String wireName = r'InternalPackageDetail';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    InternalPackageDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.livePromotion != null) {
      yield r'livePromotion';
      yield serializers.serialize(
        object.livePromotion,
        specifiedType: const FullType(bool),
      );
    }
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
    yield r'durationDays';
    yield serializers.serialize(
      object.durationDays,
      specifiedType: const FullType(int),
    );
    yield r'promotions';
    yield serializers.serialize(
      object.promotions,
      specifiedType: const FullType(BuiltList, [FullType(PackagePromotion)]),
    );
    yield r'sessionCount';
    yield serializers.serialize(
      object.sessionCount,
      specifiedType: const FullType(int),
    );
    if (object.effectiveState != null) {
      yield r'effectiveState';
      yield serializers.serialize(
        object.effectiveState,
        specifiedType: const FullType(PackageEffectiveStateEnum),
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
    yield r'auditActivity';
    yield serializers.serialize(
      object.auditActivity,
      specifiedType: const FullType(BuiltList, [FullType(SafeAuditActivity)]),
    );
    if (object.revisions != null) {
      yield r'revisions';
      yield serializers.serialize(
        object.revisions,
        specifiedType: const FullType(BuiltList, [FullType(PackageRevision)]),
      );
    }
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
    yield r'effectiveFrom';
    yield serializers.serialize(
      object.effectiveFrom,
      specifiedType: const FullType(Date),
    );
    if (object.classTypeScopes != null) {
      yield r'classTypeScopes';
      yield serializers.serialize(
        object.classTypeScopes,
        specifiedType: const FullType(BuiltList, [FullType(PackageClassTypeScope)]),
      );
    }
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
  }

  @override
  Object serialize(
    Serializers serializers,
    InternalPackageDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required InternalPackageDetailBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'livePromotion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.livePromotion = valueDes;
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
        case r'durationDays':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.durationDays = valueDes;
          break;
        case r'promotions':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PackagePromotion)]),
          ) as BuiltList<PackagePromotion>;
          result.promotions.replace(valueDes);
          break;
        case r'sessionCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sessionCount = valueDes;
          break;
        case r'effectiveState':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PackageEffectiveStateEnum),
          ) as PackageEffectiveStateEnum;
          result.effectiveState = valueDes;
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
        case r'auditActivity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(SafeAuditActivity)]),
          ) as BuiltList<SafeAuditActivity>;
          result.auditActivity.replace(valueDes);
          break;
        case r'revisions':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PackageRevision)]),
          ) as BuiltList<PackageRevision>;
          result.revisions.replace(valueDes);
          break;
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
        case r'effectiveFrom':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.effectiveFrom = valueDes;
          break;
        case r'classTypeScopes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PackageClassTypeScope)]),
          ) as BuiltList<PackageClassTypeScope>;
          result.classTypeScopes.replace(valueDes);
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  InternalPackageDetail deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = InternalPackageDetailBuilder();
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

class InternalPackageDetailStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const InternalPackageDetailStatusEnum ACTIVE = _$internalPackageDetailStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const InternalPackageDetailStatusEnum INACTIVE = _$internalPackageDetailStatusEnum_INACTIVE;

  static Serializer<InternalPackageDetailStatusEnum> get serializer => _$internalPackageDetailStatusEnumSerializer;

  const InternalPackageDetailStatusEnum._(String name): super(name);

  static BuiltSet<InternalPackageDetailStatusEnum> get values => _$internalPackageDetailStatusEnumValues;
  static InternalPackageDetailStatusEnum valueOf(String name) => _$internalPackageDetailStatusEnumValueOf(name);
}

class InternalPackageDetailEffectiveStateEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const InternalPackageDetailEffectiveStateEnum ACTIVE = _$internalPackageDetailEffectiveStateEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'SCHEDULED')
  static const InternalPackageDetailEffectiveStateEnum SCHEDULED = _$internalPackageDetailEffectiveStateEnum_SCHEDULED;
  @BuiltValueEnumConst(wireName: r'EXPIRED')
  static const InternalPackageDetailEffectiveStateEnum EXPIRED = _$internalPackageDetailEffectiveStateEnum_EXPIRED;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const InternalPackageDetailEffectiveStateEnum INACTIVE = _$internalPackageDetailEffectiveStateEnum_INACTIVE;

  static Serializer<InternalPackageDetailEffectiveStateEnum> get serializer => _$internalPackageDetailEffectiveStateEnumSerializer;

  const InternalPackageDetailEffectiveStateEnum._(String name): super(name);

  static BuiltSet<InternalPackageDetailEffectiveStateEnum> get values => _$internalPackageDetailEffectiveStateEnumValues;
  static InternalPackageDetailEffectiveStateEnum valueOf(String name) => _$internalPackageDetailEffectiveStateEnumValueOf(name);
}

