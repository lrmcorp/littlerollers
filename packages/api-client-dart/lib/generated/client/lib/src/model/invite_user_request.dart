//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/role.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/user_role_input.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'invite_user_request.g.dart';

/// InviteUserRequest
///
/// Properties:
/// * [email] 
/// * [displayName] 
/// * [roleAssignments] 
/// * [roles] 
/// * [branchIds] 
@BuiltValue()
abstract class InviteUserRequest implements Built<InviteUserRequest, InviteUserRequestBuilder> {
  @BuiltValueField(wireName: r'email')
  String get email;

  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  @BuiltValueField(wireName: r'roleAssignments')
  BuiltList<UserRoleInput> get roleAssignments;

  @BuiltValueField(wireName: r'roles')
  BuiltList<Role>? get roles;

  @BuiltValueField(wireName: r'branchIds')
  BuiltList<String>? get branchIds;

  InviteUserRequest._();

  factory InviteUserRequest([void updates(InviteUserRequestBuilder b)]) = _$InviteUserRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(InviteUserRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<InviteUserRequest> get serializer => _$InviteUserRequestSerializer();
}

class _$InviteUserRequestSerializer implements PrimitiveSerializer<InviteUserRequest> {
  @override
  final Iterable<Type> types = const [InviteUserRequest, _$InviteUserRequest];

  @override
  final String wireName = r'InviteUserRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    InviteUserRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'email';
    yield serializers.serialize(
      object.email,
      specifiedType: const FullType(String),
    );
    yield r'displayName';
    yield serializers.serialize(
      object.displayName,
      specifiedType: const FullType(String),
    );
    yield r'roleAssignments';
    yield serializers.serialize(
      object.roleAssignments,
      specifiedType: const FullType(BuiltList, [FullType(UserRoleInput)]),
    );
    if (object.roles != null) {
      yield r'roles';
      yield serializers.serialize(
        object.roles,
        specifiedType: const FullType(BuiltList, [FullType(Role)]),
      );
    }
    if (object.branchIds != null) {
      yield r'branchIds';
      yield serializers.serialize(
        object.branchIds,
        specifiedType: const FullType(BuiltList, [FullType(String)]),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    InviteUserRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required InviteUserRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'email':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.email = valueDes;
          break;
        case r'displayName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.displayName = valueDes;
          break;
        case r'roleAssignments':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(UserRoleInput)]),
          ) as BuiltList<UserRoleInput>;
          result.roleAssignments.replace(valueDes);
          break;
        case r'roles':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(Role)]),
          ) as BuiltList<Role>;
          result.roles.replace(valueDes);
          break;
        case r'branchIds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.branchIds.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  InviteUserRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = InviteUserRequestBuilder();
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

