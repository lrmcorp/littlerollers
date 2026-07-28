//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/access_reason.dart';
import 'package:openapi/src/model/access_reason_code.dart';
import 'package:openapi/src/model/access_role_assignment_input.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'replace_user_access_roles_command.g.dart';

/// ReplaceUserAccessRolesCommand
///
/// Properties:
/// * [reasonCode] 
/// * [note] 
/// * [roles] 
/// * [expectedVersion] 
@BuiltValue()
abstract class ReplaceUserAccessRolesCommand implements AccessReason, Built<ReplaceUserAccessRolesCommand, ReplaceUserAccessRolesCommandBuilder> {
  @BuiltValueField(wireName: r'roles')
  BuiltSet<AccessRoleAssignmentInput> get roles;

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  ReplaceUserAccessRolesCommand._();

  factory ReplaceUserAccessRolesCommand([void updates(ReplaceUserAccessRolesCommandBuilder b)]) = _$ReplaceUserAccessRolesCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ReplaceUserAccessRolesCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ReplaceUserAccessRolesCommand> get serializer => _$ReplaceUserAccessRolesCommandSerializer();
}

class _$ReplaceUserAccessRolesCommandSerializer implements PrimitiveSerializer<ReplaceUserAccessRolesCommand> {
  @override
  final Iterable<Type> types = const [ReplaceUserAccessRolesCommand, _$ReplaceUserAccessRolesCommand];

  @override
  final String wireName = r'ReplaceUserAccessRolesCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ReplaceUserAccessRolesCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.note != null) {
      yield r'note';
      yield serializers.serialize(
        object.note,
        specifiedType: const FullType(String),
      );
    }
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
    yield r'reasonCode';
    yield serializers.serialize(
      object.reasonCode,
      specifiedType: const FullType(AccessReasonCode),
    );
    yield r'roles';
    yield serializers.serialize(
      object.roles,
      specifiedType: const FullType(BuiltSet, [FullType(AccessRoleAssignmentInput)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ReplaceUserAccessRolesCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ReplaceUserAccessRolesCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.note = valueDes;
          break;
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
          break;
        case r'reasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AccessReasonCode),
          ) as AccessReasonCode;
          result.reasonCode = valueDes;
          break;
        case r'roles':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltSet, [FullType(AccessRoleAssignmentInput)]),
          ) as BuiltSet<AccessRoleAssignmentInput>;
          result.roles.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ReplaceUserAccessRolesCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ReplaceUserAccessRolesCommandBuilder();
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

