//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'mfa_verify_command.g.dart';

/// MfaVerifyCommand
///
/// Properties:
/// * [challengeId] 
/// * [proof] 
@BuiltValue()
abstract class MfaVerifyCommand implements Built<MfaVerifyCommand, MfaVerifyCommandBuilder> {
  @BuiltValueField(wireName: r'challengeId')
  String get challengeId;

  @BuiltValueField(wireName: r'proof')
  String get proof;

  MfaVerifyCommand._();

  factory MfaVerifyCommand([void updates(MfaVerifyCommandBuilder b)]) = _$MfaVerifyCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(MfaVerifyCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<MfaVerifyCommand> get serializer => _$MfaVerifyCommandSerializer();
}

class _$MfaVerifyCommandSerializer implements PrimitiveSerializer<MfaVerifyCommand> {
  @override
  final Iterable<Type> types = const [MfaVerifyCommand, _$MfaVerifyCommand];

  @override
  final String wireName = r'MfaVerifyCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    MfaVerifyCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'challengeId';
    yield serializers.serialize(
      object.challengeId,
      specifiedType: const FullType(String),
    );
    yield r'proof';
    yield serializers.serialize(
      object.proof,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    MfaVerifyCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required MfaVerifyCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'challengeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.challengeId = valueDes;
          break;
        case r'proof':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.proof = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  MfaVerifyCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = MfaVerifyCommandBuilder();
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

