//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'user_access_role_assignment_branch.g.dart';

/// UserAccessRoleAssignmentBranch
///
/// Properties:
/// * [id] 
/// * [code] 
/// * [name] 
@BuiltValue()
abstract class UserAccessRoleAssignmentBranch implements Built<UserAccessRoleAssignmentBranch, UserAccessRoleAssignmentBranchBuilder> {
  @BuiltValueField(wireName: r'id')
  String? get id;

  @BuiltValueField(wireName: r'code')
  String? get code;

  @BuiltValueField(wireName: r'name')
  String? get name;

  UserAccessRoleAssignmentBranch._();

  factory UserAccessRoleAssignmentBranch([void updates(UserAccessRoleAssignmentBranchBuilder b)]) = _$UserAccessRoleAssignmentBranch;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UserAccessRoleAssignmentBranchBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UserAccessRoleAssignmentBranch> get serializer => _$UserAccessRoleAssignmentBranchSerializer();
}

class _$UserAccessRoleAssignmentBranchSerializer implements PrimitiveSerializer<UserAccessRoleAssignmentBranch> {
  @override
  final Iterable<Type> types = const [UserAccessRoleAssignmentBranch, _$UserAccessRoleAssignmentBranch];

  @override
  final String wireName = r'UserAccessRoleAssignmentBranch';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UserAccessRoleAssignmentBranch object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.id != null) {
      yield r'id';
      yield serializers.serialize(
        object.id,
        specifiedType: const FullType(String),
      );
    }
    if (object.code != null) {
      yield r'code';
      yield serializers.serialize(
        object.code,
        specifiedType: const FullType(String),
      );
    }
    if (object.name != null) {
      yield r'name';
      yield serializers.serialize(
        object.name,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    UserAccessRoleAssignmentBranch object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UserAccessRoleAssignmentBranchBuilder result,
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
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UserAccessRoleAssignmentBranch deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UserAccessRoleAssignmentBranchBuilder();
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

