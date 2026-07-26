//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/role.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'user_role_input.g.dart';

/// UserRoleInput
///
/// Properties:
/// * [role] 
/// * [branchId] 
@BuiltValue()
abstract class UserRoleInput implements Built<UserRoleInput, UserRoleInputBuilder> {
  @BuiltValueField(wireName: r'role')
  Role get role;
  // enum roleEnum {  CUSTOMER,  INSTRUCTOR,  ADMIN,  MANAGER,  OWNER,  SUPER_OWNER,  FINANCE,  OPS,  };

  @BuiltValueField(wireName: r'branchId')
  String? get branchId;

  UserRoleInput._();

  factory UserRoleInput([void updates(UserRoleInputBuilder b)]) = _$UserRoleInput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UserRoleInputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UserRoleInput> get serializer => _$UserRoleInputSerializer();
}

class _$UserRoleInputSerializer implements PrimitiveSerializer<UserRoleInput> {
  @override
  final Iterable<Type> types = const [UserRoleInput, _$UserRoleInput];

  @override
  final String wireName = r'UserRoleInput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UserRoleInput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'role';
    yield serializers.serialize(
      object.role,
      specifiedType: const FullType(Role),
    );
    if (object.branchId != null) {
      yield r'branchId';
      yield serializers.serialize(
        object.branchId,
        specifiedType: const FullType.nullable(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    UserRoleInput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UserRoleInputBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'role':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Role),
          ) as Role;
          result.role = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.branchId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UserRoleInput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UserRoleInputBuilder();
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

