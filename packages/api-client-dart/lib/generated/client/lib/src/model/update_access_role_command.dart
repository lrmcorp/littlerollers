//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/access_reason.dart';
import 'package:openapi/src/model/access_reason_code.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'update_access_role_command.g.dart';

/// UpdateAccessRoleCommand
///
/// Properties:
/// * [reasonCode] 
/// * [note] 
/// * [displayName] 
/// * [description] 
/// * [expectedVersion] 
@BuiltValue()
abstract class UpdateAccessRoleCommand implements AccessReason, Built<UpdateAccessRoleCommand, UpdateAccessRoleCommandBuilder> {
  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  @BuiltValueField(wireName: r'description')
  String get description;

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  UpdateAccessRoleCommand._();

  factory UpdateAccessRoleCommand([void updates(UpdateAccessRoleCommandBuilder b)]) = _$UpdateAccessRoleCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UpdateAccessRoleCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UpdateAccessRoleCommand> get serializer => _$UpdateAccessRoleCommandSerializer();
}

class _$UpdateAccessRoleCommandSerializer implements PrimitiveSerializer<UpdateAccessRoleCommand> {
  @override
  final Iterable<Type> types = const [UpdateAccessRoleCommand, _$UpdateAccessRoleCommand];

  @override
  final String wireName = r'UpdateAccessRoleCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UpdateAccessRoleCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'description';
    yield serializers.serialize(
      object.description,
      specifiedType: const FullType(String),
    );
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
    yield r'displayName';
    yield serializers.serialize(
      object.displayName,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    UpdateAccessRoleCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UpdateAccessRoleCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.description = valueDes;
          break;
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
        case r'displayName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.displayName = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UpdateAccessRoleCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UpdateAccessRoleCommandBuilder();
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

