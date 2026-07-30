//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/audit_branch_projection.dart';
import 'package:openapi/src/model/audit_target_projection.dart';
import 'package:openapi/src/model/audit_actor_projection.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'audit_log.g.dart';

/// AuditLog
///
/// Properties:
/// * [id] 
/// * [occurredAt] 
/// * [actorType] 
/// * [actorId] 
/// * [branchId] 
/// * [targetUserId] 
/// * [actor] 
/// * [target] 
/// * [branch] 
/// * [action] 
/// * [objectType] 
/// * [objectId] 
/// * [beforeMasked] 
/// * [afterMasked] 
/// * [correlationId] 
@BuiltValue()
abstract class AuditLog implements Built<AuditLog, AuditLogBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'occurredAt')
  DateTime get occurredAt;

  @BuiltValueField(wireName: r'actorType')
  AuditLogActorTypeEnum get actorType;
  // enum actorTypeEnum {  USER,  SYSTEM,  MIGRATION,  };

  @BuiltValueField(wireName: r'actorId')
  String? get actorId;

  @BuiltValueField(wireName: r'branchId')
  String? get branchId;

  @BuiltValueField(wireName: r'targetUserId')
  String? get targetUserId;

  @BuiltValueField(wireName: r'actor')
  AuditActorProjection? get actor;

  @BuiltValueField(wireName: r'target')
  AuditTargetProjection? get target;

  @BuiltValueField(wireName: r'branch')
  AuditBranchProjection? get branch;

  @BuiltValueField(wireName: r'action')
  String get action;

  @BuiltValueField(wireName: r'objectType')
  String get objectType;

  @BuiltValueField(wireName: r'objectId')
  String get objectId;

  @BuiltValueField(wireName: r'beforeMasked')
  JsonObject? get beforeMasked;

  @BuiltValueField(wireName: r'afterMasked')
  JsonObject? get afterMasked;

  @BuiltValueField(wireName: r'correlationId')
  String get correlationId;

  AuditLog._();

  factory AuditLog([void updates(AuditLogBuilder b)]) = _$AuditLog;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AuditLogBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AuditLog> get serializer => _$AuditLogSerializer();
}

class _$AuditLogSerializer implements PrimitiveSerializer<AuditLog> {
  @override
  final Iterable<Type> types = const [AuditLog, _$AuditLog];

  @override
  final String wireName = r'AuditLog';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AuditLog object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'occurredAt';
    yield serializers.serialize(
      object.occurredAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'actorType';
    yield serializers.serialize(
      object.actorType,
      specifiedType: const FullType(AuditLogActorTypeEnum),
    );
    if (object.actorId != null) {
      yield r'actorId';
      yield serializers.serialize(
        object.actorId,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.branchId != null) {
      yield r'branchId';
      yield serializers.serialize(
        object.branchId,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.targetUserId != null) {
      yield r'targetUserId';
      yield serializers.serialize(
        object.targetUserId,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.actor != null) {
      yield r'actor';
      yield serializers.serialize(
        object.actor,
        specifiedType: const FullType.nullable(AuditActorProjection),
      );
    }
    if (object.target != null) {
      yield r'target';
      yield serializers.serialize(
        object.target,
        specifiedType: const FullType.nullable(AuditTargetProjection),
      );
    }
    if (object.branch != null) {
      yield r'branch';
      yield serializers.serialize(
        object.branch,
        specifiedType: const FullType.nullable(AuditBranchProjection),
      );
    }
    yield r'action';
    yield serializers.serialize(
      object.action,
      specifiedType: const FullType(String),
    );
    yield r'objectType';
    yield serializers.serialize(
      object.objectType,
      specifiedType: const FullType(String),
    );
    yield r'objectId';
    yield serializers.serialize(
      object.objectId,
      specifiedType: const FullType(String),
    );
    if (object.beforeMasked != null) {
      yield r'beforeMasked';
      yield serializers.serialize(
        object.beforeMasked,
        specifiedType: const FullType.nullable(JsonObject),
      );
    }
    if (object.afterMasked != null) {
      yield r'afterMasked';
      yield serializers.serialize(
        object.afterMasked,
        specifiedType: const FullType.nullable(JsonObject),
      );
    }
    yield r'correlationId';
    yield serializers.serialize(
      object.correlationId,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AuditLog object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AuditLogBuilder result,
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
        case r'occurredAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.occurredAt = valueDes;
          break;
        case r'actorType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AuditLogActorTypeEnum),
          ) as AuditLogActorTypeEnum;
          result.actorType = valueDes;
          break;
        case r'actorId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.actorId = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.branchId = valueDes;
          break;
        case r'targetUserId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.targetUserId = valueDes;
          break;
        case r'actor':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(AuditActorProjection),
          ) as AuditActorProjection?;
          if (valueDes == null) continue;
          result.actor.replace(valueDes);
          break;
        case r'target':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(AuditTargetProjection),
          ) as AuditTargetProjection?;
          if (valueDes == null) continue;
          result.target.replace(valueDes);
          break;
        case r'branch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(AuditBranchProjection),
          ) as AuditBranchProjection?;
          if (valueDes == null) continue;
          result.branch.replace(valueDes);
          break;
        case r'action':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.action = valueDes;
          break;
        case r'objectType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.objectType = valueDes;
          break;
        case r'objectId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.objectId = valueDes;
          break;
        case r'beforeMasked':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(JsonObject),
          ) as JsonObject?;
          if (valueDes == null) continue;
          result.beforeMasked = valueDes;
          break;
        case r'afterMasked':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(JsonObject),
          ) as JsonObject?;
          if (valueDes == null) continue;
          result.afterMasked = valueDes;
          break;
        case r'correlationId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.correlationId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AuditLog deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AuditLogBuilder();
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

class AuditLogActorTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'USER')
  static const AuditLogActorTypeEnum USER = _$auditLogActorTypeEnum_USER;
  @BuiltValueEnumConst(wireName: r'SYSTEM')
  static const AuditLogActorTypeEnum SYSTEM = _$auditLogActorTypeEnum_SYSTEM;
  @BuiltValueEnumConst(wireName: r'MIGRATION')
  static const AuditLogActorTypeEnum MIGRATION = _$auditLogActorTypeEnum_MIGRATION;

  static Serializer<AuditLogActorTypeEnum> get serializer => _$auditLogActorTypeEnumSerializer;

  const AuditLogActorTypeEnum._(String name): super(name);

  static BuiltSet<AuditLogActorTypeEnum> get values => _$auditLogActorTypeEnumValues;
  static AuditLogActorTypeEnum valueOf(String name) => _$auditLogActorTypeEnumValueOf(name);
}

