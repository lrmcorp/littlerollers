//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/user_role_input.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'update_user_roles_command.g.dart';

/// UpdateUserRolesCommand
///
/// Properties:
/// * [roles] 
/// * [expectedVersion] 
/// * [reason] 
@BuiltValue()
abstract class UpdateUserRolesCommand implements Built<UpdateUserRolesCommand, UpdateUserRolesCommandBuilder> {
  @BuiltValueField(wireName: r'roles')
  BuiltList<UserRoleInput> get roles;

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  UpdateUserRolesCommand._();

  factory UpdateUserRolesCommand([void updates(UpdateUserRolesCommandBuilder b)]) = _$UpdateUserRolesCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UpdateUserRolesCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UpdateUserRolesCommand> get serializer => _$UpdateUserRolesCommandSerializer();
}

class _$UpdateUserRolesCommandSerializer implements PrimitiveSerializer<UpdateUserRolesCommand> {
  @override
  final Iterable<Type> types = const [UpdateUserRolesCommand, _$UpdateUserRolesCommand];

  @override
  final String wireName = r'UpdateUserRolesCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UpdateUserRolesCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'roles';
    yield serializers.serialize(
      object.roles,
      specifiedType: const FullType(BuiltList, [FullType(UserRoleInput)]),
    );
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    UpdateUserRolesCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UpdateUserRolesCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'roles':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(UserRoleInput)]),
          ) as BuiltList<UserRoleInput>;
          result.roles.replace(valueDes);
          break;
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
          break;
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UpdateUserRolesCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UpdateUserRolesCommandBuilder();
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

