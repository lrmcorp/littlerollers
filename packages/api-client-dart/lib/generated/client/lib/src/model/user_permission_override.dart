//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/access_reason_code.dart';
import 'package:openapi/src/model/user_access_role_assignment_branch.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'user_permission_override.g.dart';

/// UserPermissionOverride
///
/// Properties:
/// * [id] 
/// * [capabilityKey] 
/// * [capabilityLabel] 
/// * [effect] 
/// * [branchId] 
/// * [branch] 
/// * [reasonCode] 
/// * [version] 
/// * [createdAt] 
@BuiltValue()
abstract class UserPermissionOverride implements Built<UserPermissionOverride, UserPermissionOverrideBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'capabilityKey')
  String get capabilityKey;

  @BuiltValueField(wireName: r'capabilityLabel')
  String get capabilityLabel;

  @BuiltValueField(wireName: r'effect')
  UserPermissionOverrideEffectEnum get effect;
  // enum effectEnum {  GRANT,  DENY,  };

  @BuiltValueField(wireName: r'branchId')
  String? get branchId;

  @BuiltValueField(wireName: r'branch')
  UserAccessRoleAssignmentBranch? get branch;

  @BuiltValueField(wireName: r'reasonCode')
  AccessReasonCode get reasonCode;
  // enum reasonCodeEnum {  POLICY_UPDATE,  DUTY_CHANGE,  SECURITY_HARDENING,  ACCESS_CORRECTION,  TEMPORARY_DUTY,  ACCESS_EXCEPTION,  SECURITY_RESTRICTION,  ROLE_REPLACEMENT,  };

  @BuiltValueField(wireName: r'version')
  int get version;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  UserPermissionOverride._();

  factory UserPermissionOverride([void updates(UserPermissionOverrideBuilder b)]) = _$UserPermissionOverride;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UserPermissionOverrideBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UserPermissionOverride> get serializer => _$UserPermissionOverrideSerializer();
}

class _$UserPermissionOverrideSerializer implements PrimitiveSerializer<UserPermissionOverride> {
  @override
  final Iterable<Type> types = const [UserPermissionOverride, _$UserPermissionOverride];

  @override
  final String wireName = r'UserPermissionOverride';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UserPermissionOverride object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'capabilityKey';
    yield serializers.serialize(
      object.capabilityKey,
      specifiedType: const FullType(String),
    );
    yield r'capabilityLabel';
    yield serializers.serialize(
      object.capabilityLabel,
      specifiedType: const FullType(String),
    );
    yield r'effect';
    yield serializers.serialize(
      object.effect,
      specifiedType: const FullType(UserPermissionOverrideEffectEnum),
    );
    yield r'branchId';
    yield object.branchId == null ? null : serializers.serialize(
      object.branchId,
      specifiedType: const FullType.nullable(String),
    );
    if (object.branch != null) {
      yield r'branch';
      yield serializers.serialize(
        object.branch,
        specifiedType: const FullType(UserAccessRoleAssignmentBranch),
      );
    }
    yield r'reasonCode';
    yield serializers.serialize(
      object.reasonCode,
      specifiedType: const FullType(AccessReasonCode),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    UserPermissionOverride object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UserPermissionOverrideBuilder result,
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
        case r'capabilityKey':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.capabilityKey = valueDes;
          break;
        case r'capabilityLabel':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.capabilityLabel = valueDes;
          break;
        case r'effect':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(UserPermissionOverrideEffectEnum),
          ) as UserPermissionOverrideEffectEnum;
          result.effect = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.branchId = valueDes;
          break;
        case r'branch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(UserAccessRoleAssignmentBranch),
          ) as UserAccessRoleAssignmentBranch;
          result.branch.replace(valueDes);
          break;
        case r'reasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AccessReasonCode),
          ) as AccessReasonCode;
          result.reasonCode = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UserPermissionOverride deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UserPermissionOverrideBuilder();
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

class UserPermissionOverrideEffectEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'GRANT')
  static const UserPermissionOverrideEffectEnum GRANT = _$userPermissionOverrideEffectEnum_GRANT;
  @BuiltValueEnumConst(wireName: r'DENY')
  static const UserPermissionOverrideEffectEnum DENY = _$userPermissionOverrideEffectEnum_DENY;

  static Serializer<UserPermissionOverrideEffectEnum> get serializer => _$userPermissionOverrideEffectEnumSerializer;

  const UserPermissionOverrideEffectEnum._(String name): super(name);

  static BuiltSet<UserPermissionOverrideEffectEnum> get values => _$userPermissionOverrideEffectEnumValues;
  static UserPermissionOverrideEffectEnum valueOf(String name) => _$userPermissionOverrideEffectEnumValueOf(name);
}

