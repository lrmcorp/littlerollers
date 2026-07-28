//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/access_reason.dart';
import 'package:openapi/src/model/access_reason_code.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'replace_role_capabilities_command.g.dart';

/// ReplaceRoleCapabilitiesCommand
///
/// Properties:
/// * [reasonCode] 
/// * [note] 
/// * [capabilityKeys] 
/// * [expectedVersion] 
@BuiltValue()
abstract class ReplaceRoleCapabilitiesCommand implements AccessReason, Built<ReplaceRoleCapabilitiesCommand, ReplaceRoleCapabilitiesCommandBuilder> {
  @BuiltValueField(wireName: r'capabilityKeys')
  BuiltSet<String> get capabilityKeys;

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  ReplaceRoleCapabilitiesCommand._();

  factory ReplaceRoleCapabilitiesCommand([void updates(ReplaceRoleCapabilitiesCommandBuilder b)]) = _$ReplaceRoleCapabilitiesCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ReplaceRoleCapabilitiesCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ReplaceRoleCapabilitiesCommand> get serializer => _$ReplaceRoleCapabilitiesCommandSerializer();
}

class _$ReplaceRoleCapabilitiesCommandSerializer implements PrimitiveSerializer<ReplaceRoleCapabilitiesCommand> {
  @override
  final Iterable<Type> types = const [ReplaceRoleCapabilitiesCommand, _$ReplaceRoleCapabilitiesCommand];

  @override
  final String wireName = r'ReplaceRoleCapabilitiesCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ReplaceRoleCapabilitiesCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'capabilityKeys';
    yield serializers.serialize(
      object.capabilityKeys,
      specifiedType: const FullType(BuiltSet, [FullType(String)]),
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
  }

  @override
  Object serialize(
    Serializers serializers,
    ReplaceRoleCapabilitiesCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ReplaceRoleCapabilitiesCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'capabilityKeys':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltSet, [FullType(String)]),
          ) as BuiltSet<String>;
          result.capabilityKeys.replace(valueDes);
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ReplaceRoleCapabilitiesCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ReplaceRoleCapabilitiesCommandBuilder();
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

