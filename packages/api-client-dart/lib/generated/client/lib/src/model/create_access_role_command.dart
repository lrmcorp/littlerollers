//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/access_reason.dart';
import 'package:openapi/src/model/access_role_scope.dart';
import 'package:openapi/src/model/access_reason_code.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'create_access_role_command.g.dart';

/// CreateAccessRoleCommand
///
/// Properties:
/// * [reasonCode] 
/// * [note] 
/// * [code] 
/// * [displayName] 
/// * [description] 
/// * [scope] 
/// * [capabilityKeys] 
@BuiltValue()
abstract class CreateAccessRoleCommand implements AccessReason, Built<CreateAccessRoleCommand, CreateAccessRoleCommandBuilder> {
  @BuiltValueField(wireName: r'code')
  String get code;

  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  @BuiltValueField(wireName: r'scope')
  AccessRoleScope get scope;
  // enum scopeEnum {  GLOBAL,  BRANCH,  };

  @BuiltValueField(wireName: r'description')
  String get description;

  @BuiltValueField(wireName: r'capabilityKeys')
  BuiltSet<String> get capabilityKeys;

  CreateAccessRoleCommand._();

  factory CreateAccessRoleCommand([void updates(CreateAccessRoleCommandBuilder b)]) = _$CreateAccessRoleCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CreateAccessRoleCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CreateAccessRoleCommand> get serializer => _$CreateAccessRoleCommandSerializer();
}

class _$CreateAccessRoleCommandSerializer implements PrimitiveSerializer<CreateAccessRoleCommand> {
  @override
  final Iterable<Type> types = const [CreateAccessRoleCommand, _$CreateAccessRoleCommand];

  @override
  final String wireName = r'CreateAccessRoleCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CreateAccessRoleCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.note != null) {
      yield r'note';
      yield serializers.serialize(
        object.note,
        specifiedType: const FullType(String),
      );
    }
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
    yield r'scope';
    yield serializers.serialize(
      object.scope,
      specifiedType: const FullType(AccessRoleScope),
    );
    yield r'description';
    yield serializers.serialize(
      object.description,
      specifiedType: const FullType(String),
    );
    yield r'capabilityKeys';
    yield serializers.serialize(
      object.capabilityKeys,
      specifiedType: const FullType(BuiltSet, [FullType(String)]),
    );
    yield r'reasonCode';
    yield serializers.serialize(
      object.reasonCode,
      specifiedType: const FullType(AccessReasonCode),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CreateAccessRoleCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CreateAccessRoleCommandBuilder result,
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
        case r'scope':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AccessRoleScope),
          ) as AccessRoleScope;
          result.scope = valueDes;
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.description = valueDes;
          break;
        case r'capabilityKeys':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltSet, [FullType(String)]),
          ) as BuiltSet<String>;
          result.capabilityKeys.replace(valueDes);
          break;
        case r'reasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AccessReasonCode),
          ) as AccessReasonCode;
          result.reasonCode = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CreateAccessRoleCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CreateAccessRoleCommandBuilder();
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

