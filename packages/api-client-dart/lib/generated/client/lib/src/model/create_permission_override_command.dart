//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/access_reason.dart';
import 'package:openapi/src/model/access_reason_code.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'create_permission_override_command.g.dart';

/// CreatePermissionOverrideCommand
///
/// Properties:
/// * [reasonCode] 
/// * [note] 
/// * [capabilityKey] 
/// * [branchId] 
/// * [effect] 
@BuiltValue()
abstract class CreatePermissionOverrideCommand implements AccessReason, Built<CreatePermissionOverrideCommand, CreatePermissionOverrideCommandBuilder> {
  @BuiltValueField(wireName: r'branchId')
  String? get branchId;

  @BuiltValueField(wireName: r'capabilityKey')
  String get capabilityKey;

  @BuiltValueField(wireName: r'effect')
  CreatePermissionOverrideCommandEffectEnum get effect;
  // enum effectEnum {  GRANT,  DENY,  };

  CreatePermissionOverrideCommand._();

  factory CreatePermissionOverrideCommand([void updates(CreatePermissionOverrideCommandBuilder b)]) = _$CreatePermissionOverrideCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CreatePermissionOverrideCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CreatePermissionOverrideCommand> get serializer => _$CreatePermissionOverrideCommandSerializer();
}

class _$CreatePermissionOverrideCommandSerializer implements PrimitiveSerializer<CreatePermissionOverrideCommand> {
  @override
  final Iterable<Type> types = const [CreatePermissionOverrideCommand, _$CreatePermissionOverrideCommand];

  @override
  final String wireName = r'CreatePermissionOverrideCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CreatePermissionOverrideCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.branchId != null) {
      yield r'branchId';
      yield serializers.serialize(
        object.branchId,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.note != null) {
      yield r'note';
      yield serializers.serialize(
        object.note,
        specifiedType: const FullType(String),
      );
    }
    yield r'reasonCode';
    yield serializers.serialize(
      object.reasonCode,
      specifiedType: const FullType(AccessReasonCode),
    );
    yield r'capabilityKey';
    yield serializers.serialize(
      object.capabilityKey,
      specifiedType: const FullType(String),
    );
    yield r'effect';
    yield serializers.serialize(
      object.effect,
      specifiedType: const FullType(CreatePermissionOverrideCommandEffectEnum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CreatePermissionOverrideCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CreatePermissionOverrideCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.branchId = valueDes;
          break;
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.note = valueDes;
          break;
        case r'reasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AccessReasonCode),
          ) as AccessReasonCode;
          result.reasonCode = valueDes;
          break;
        case r'capabilityKey':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.capabilityKey = valueDes;
          break;
        case r'effect':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CreatePermissionOverrideCommandEffectEnum),
          ) as CreatePermissionOverrideCommandEffectEnum;
          result.effect = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CreatePermissionOverrideCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CreatePermissionOverrideCommandBuilder();
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

class CreatePermissionOverrideCommandEffectEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'GRANT')
  static const CreatePermissionOverrideCommandEffectEnum GRANT = _$createPermissionOverrideCommandEffectEnum_GRANT;
  @BuiltValueEnumConst(wireName: r'DENY')
  static const CreatePermissionOverrideCommandEffectEnum DENY = _$createPermissionOverrideCommandEffectEnum_DENY;

  static Serializer<CreatePermissionOverrideCommandEffectEnum> get serializer => _$createPermissionOverrideCommandEffectEnumSerializer;

  const CreatePermissionOverrideCommandEffectEnum._(String name): super(name);

  static BuiltSet<CreatePermissionOverrideCommandEffectEnum> get values => _$createPermissionOverrideCommandEffectEnumValues;
  static CreatePermissionOverrideCommandEffectEnum valueOf(String name) => _$createPermissionOverrideCommandEffectEnumValueOf(name);
}

