//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/branch.dart';
import 'package:openapi/src/model/branch_audit_activity.dart';
import 'package:openapi/src/model/branch_public_profile_summary.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/branch_dependency_summary.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'branch_management_detail.g.dart';

/// BranchManagementDetail
///
/// Properties:
/// * [id] 
/// * [code] 
/// * [name] 
/// * [timezone] 
/// * [supportWhatsappE164] 
/// * [active] 
/// * [version] 
/// * [publicProfile] 
/// * [dependencies] 
/// * [auditActivity] 
@BuiltValue()
abstract class BranchManagementDetail implements Branch, Built<BranchManagementDetail, BranchManagementDetailBuilder> {
  @BuiltValueField(wireName: r'auditActivity')
  BuiltList<BranchAuditActivity> get auditActivity;

  @BuiltValueField(wireName: r'dependencies')
  BranchDependencySummary get dependencies;

  BranchManagementDetail._();

  factory BranchManagementDetail([void updates(BranchManagementDetailBuilder b)]) = _$BranchManagementDetail;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BranchManagementDetailBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BranchManagementDetail> get serializer => _$BranchManagementDetailSerializer();
}

class _$BranchManagementDetailSerializer implements PrimitiveSerializer<BranchManagementDetail> {
  @override
  final Iterable<Type> types = const [BranchManagementDetail, _$BranchManagementDetail];

  @override
  final String wireName = r'BranchManagementDetail';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BranchManagementDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.supportWhatsappE164 != null) {
      yield r'supportWhatsappE164';
      yield serializers.serialize(
        object.supportWhatsappE164,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
    yield r'timezone';
    yield serializers.serialize(
      object.timezone,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    if (object.publicProfile != null) {
      yield r'publicProfile';
      yield serializers.serialize(
        object.publicProfile,
        specifiedType: const FullType.nullable(BranchPublicProfileSummary),
      );
    }
    yield r'auditActivity';
    yield serializers.serialize(
      object.auditActivity,
      specifiedType: const FullType(BuiltList, [FullType(BranchAuditActivity)]),
    );
    yield r'active';
    yield serializers.serialize(
      object.active,
      specifiedType: const FullType(bool),
    );
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
    yield r'dependencies';
    yield serializers.serialize(
      object.dependencies,
      specifiedType: const FullType(BranchDependencySummary),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    BranchManagementDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BranchManagementDetailBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'supportWhatsappE164':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.supportWhatsappE164 = valueDes;
          break;
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
        case r'timezone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.timezone = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'publicProfile':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(BranchPublicProfileSummary),
          ) as BranchPublicProfileSummary?;
          if (valueDes == null) continue;
          result.publicProfile.replace(valueDes);
          break;
        case r'auditActivity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(BranchAuditActivity)]),
          ) as BuiltList<BranchAuditActivity>;
          result.auditActivity.replace(valueDes);
          break;
        case r'active':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.active = valueDes;
          break;
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        case r'dependencies':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BranchDependencySummary),
          ) as BranchDependencySummary;
          result.dependencies.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  BranchManagementDetail deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BranchManagementDetailBuilder();
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

