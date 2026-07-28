//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'access_role_assignment_input.g.dart';

/// AccessRoleAssignmentInput
///
/// Properties:
/// * [roleId] 
/// * [branchId] 
@BuiltValue()
abstract class AccessRoleAssignmentInput implements Built<AccessRoleAssignmentInput, AccessRoleAssignmentInputBuilder> {
  @BuiltValueField(wireName: r'roleId')
  String get roleId;

  @BuiltValueField(wireName: r'branchId')
  String? get branchId;

  AccessRoleAssignmentInput._();

  factory AccessRoleAssignmentInput([void updates(AccessRoleAssignmentInputBuilder b)]) = _$AccessRoleAssignmentInput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AccessRoleAssignmentInputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AccessRoleAssignmentInput> get serializer => _$AccessRoleAssignmentInputSerializer();
}

class _$AccessRoleAssignmentInputSerializer implements PrimitiveSerializer<AccessRoleAssignmentInput> {
  @override
  final Iterable<Type> types = const [AccessRoleAssignmentInput, _$AccessRoleAssignmentInput];

  @override
  final String wireName = r'AccessRoleAssignmentInput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AccessRoleAssignmentInput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'roleId';
    yield serializers.serialize(
      object.roleId,
      specifiedType: const FullType(String),
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
    AccessRoleAssignmentInput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AccessRoleAssignmentInputBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'roleId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.roleId = valueDes;
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
  AccessRoleAssignmentInput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AccessRoleAssignmentInputBuilder();
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

