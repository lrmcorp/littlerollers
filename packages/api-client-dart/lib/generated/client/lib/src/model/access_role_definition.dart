//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/role.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/access_role_scope.dart';
import 'package:openapi/src/model/access_role_capability.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'access_role_definition.g.dart';

/// AccessRoleDefinition
///
/// Properties:
/// * [id] 
/// * [code] 
/// * [displayName] 
/// * [description] 
/// * [scope] 
/// * [systemRole] 
/// * [system] 
/// * [protected] 
/// * [active] 
/// * [version] 
/// * [affectedUsers] 
/// * [capabilities] 
/// * [createdAt] 
/// * [updatedAt] 
@BuiltValue()
abstract class AccessRoleDefinition implements Built<AccessRoleDefinition, AccessRoleDefinitionBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'code')
  String get code;

  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  @BuiltValueField(wireName: r'description')
  String get description;

  @BuiltValueField(wireName: r'scope')
  AccessRoleScope get scope;
  // enum scopeEnum {  GLOBAL,  BRANCH,  };

  @BuiltValueField(wireName: r'systemRole')
  Role? get systemRole;
  // enum systemRoleEnum {  CUSTOMER,  INSTRUCTOR,  ADMIN,  MANAGER,  OWNER,  SUPER_OWNER,  FINANCE,  OPS,  };

  @BuiltValueField(wireName: r'system')
  bool get system;

  @BuiltValueField(wireName: r'protected')
  bool get protected;

  @BuiltValueField(wireName: r'active')
  bool get active;

  @BuiltValueField(wireName: r'version')
  int get version;

  @BuiltValueField(wireName: r'affectedUsers')
  int get affectedUsers;

  @BuiltValueField(wireName: r'capabilities')
  BuiltList<AccessRoleCapability> get capabilities;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'updatedAt')
  DateTime get updatedAt;

  AccessRoleDefinition._();

  factory AccessRoleDefinition([void updates(AccessRoleDefinitionBuilder b)]) = _$AccessRoleDefinition;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AccessRoleDefinitionBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AccessRoleDefinition> get serializer => _$AccessRoleDefinitionSerializer();
}

class _$AccessRoleDefinitionSerializer implements PrimitiveSerializer<AccessRoleDefinition> {
  @override
  final Iterable<Type> types = const [AccessRoleDefinition, _$AccessRoleDefinition];

  @override
  final String wireName = r'AccessRoleDefinition';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AccessRoleDefinition object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
    yield r'displayName';
    yield serializers.serialize(
      object.displayName,
      specifiedType: const FullType(String),
    );
    yield r'description';
    yield serializers.serialize(
      object.description,
      specifiedType: const FullType(String),
    );
    yield r'scope';
    yield serializers.serialize(
      object.scope,
      specifiedType: const FullType(AccessRoleScope),
    );
    if (object.systemRole != null) {
      yield r'systemRole';
      yield serializers.serialize(
        object.systemRole,
        specifiedType: const FullType.nullable(Role),
      );
    }
    yield r'system';
    yield serializers.serialize(
      object.system,
      specifiedType: const FullType(bool),
    );
    yield r'protected';
    yield serializers.serialize(
      object.protected,
      specifiedType: const FullType(bool),
    );
    yield r'active';
    yield serializers.serialize(
      object.active,
      specifiedType: const FullType(bool),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
    yield r'affectedUsers';
    yield serializers.serialize(
      object.affectedUsers,
      specifiedType: const FullType(int),
    );
    yield r'capabilities';
    yield serializers.serialize(
      object.capabilities,
      specifiedType: const FullType(BuiltList, [FullType(AccessRoleCapability)]),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'updatedAt';
    yield serializers.serialize(
      object.updatedAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AccessRoleDefinition object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AccessRoleDefinitionBuilder result,
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
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
        case r'displayName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.displayName = valueDes;
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.description = valueDes;
          break;
        case r'scope':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AccessRoleScope),
          ) as AccessRoleScope;
          result.scope = valueDes;
          break;
        case r'systemRole':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(Role),
          ) as Role?;
          if (valueDes == null) continue;
          result.systemRole = valueDes;
          break;
        case r'system':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.system = valueDes;
          break;
        case r'protected':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.protected = valueDes;
          break;
        case r'active':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.active = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        case r'affectedUsers':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.affectedUsers = valueDes;
          break;
        case r'capabilities':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(AccessRoleCapability)]),
          ) as BuiltList<AccessRoleCapability>;
          result.capabilities.replace(valueDes);
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        case r'updatedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.updatedAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AccessRoleDefinition deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AccessRoleDefinitionBuilder();
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

