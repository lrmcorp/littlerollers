//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/user_permission_override.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/user_access_role_assignment.dart';
import 'package:openapi/src/model/user_access_user.dart';
import 'package:openapi/src/model/user_access_effective.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'user_access.g.dart';

/// UserAccess
///
/// Properties:
/// * [user] 
/// * [roleAssignments] 
/// * [overrides] 
/// * [effective] 
@BuiltValue()
abstract class UserAccess implements Built<UserAccess, UserAccessBuilder> {
  @BuiltValueField(wireName: r'user')
  UserAccessUser get user;

  @BuiltValueField(wireName: r'roleAssignments')
  BuiltList<UserAccessRoleAssignment> get roleAssignments;

  @BuiltValueField(wireName: r'overrides')
  BuiltList<UserPermissionOverride> get overrides;

  @BuiltValueField(wireName: r'effective')
  UserAccessEffective get effective;

  UserAccess._();

  factory UserAccess([void updates(UserAccessBuilder b)]) = _$UserAccess;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UserAccessBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UserAccess> get serializer => _$UserAccessSerializer();
}

class _$UserAccessSerializer implements PrimitiveSerializer<UserAccess> {
  @override
  final Iterable<Type> types = const [UserAccess, _$UserAccess];

  @override
  final String wireName = r'UserAccess';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UserAccess object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'user';
    yield serializers.serialize(
      object.user,
      specifiedType: const FullType(UserAccessUser),
    );
    yield r'roleAssignments';
    yield serializers.serialize(
      object.roleAssignments,
      specifiedType: const FullType(BuiltList, [FullType(UserAccessRoleAssignment)]),
    );
    yield r'overrides';
    yield serializers.serialize(
      object.overrides,
      specifiedType: const FullType(BuiltList, [FullType(UserPermissionOverride)]),
    );
    yield r'effective';
    yield serializers.serialize(
      object.effective,
      specifiedType: const FullType(UserAccessEffective),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    UserAccess object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UserAccessBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'user':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(UserAccessUser),
          ) as UserAccessUser;
          result.user.replace(valueDes);
          break;
        case r'roleAssignments':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(UserAccessRoleAssignment)]),
          ) as BuiltList<UserAccessRoleAssignment>;
          result.roleAssignments.replace(valueDes);
          break;
        case r'overrides':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(UserPermissionOverride)]),
          ) as BuiltList<UserPermissionOverride>;
          result.overrides.replace(valueDes);
          break;
        case r'effective':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(UserAccessEffective),
          ) as UserAccessEffective;
          result.effective.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UserAccess deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UserAccessBuilder();
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

