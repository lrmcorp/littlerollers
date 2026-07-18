//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/recovery_verify_command_new_verified_identity.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'recovery_verify_command.g.dart';

/// RecoveryVerifyCommand
///
/// Properties:
/// * [verificationReference] 
/// * [proof] 
/// * [newVerifiedIdentity] 
@BuiltValue()
abstract class RecoveryVerifyCommand implements Built<RecoveryVerifyCommand, RecoveryVerifyCommandBuilder> {
  @BuiltValueField(wireName: r'verificationReference')
  String get verificationReference;

  @BuiltValueField(wireName: r'proof')
  String get proof;

  @BuiltValueField(wireName: r'newVerifiedIdentity')
  RecoveryVerifyCommandNewVerifiedIdentity? get newVerifiedIdentity;

  RecoveryVerifyCommand._();

  factory RecoveryVerifyCommand([void updates(RecoveryVerifyCommandBuilder b)]) = _$RecoveryVerifyCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RecoveryVerifyCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RecoveryVerifyCommand> get serializer => _$RecoveryVerifyCommandSerializer();
}

class _$RecoveryVerifyCommandSerializer implements PrimitiveSerializer<RecoveryVerifyCommand> {
  @override
  final Iterable<Type> types = const [RecoveryVerifyCommand, _$RecoveryVerifyCommand];

  @override
  final String wireName = r'RecoveryVerifyCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RecoveryVerifyCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'verificationReference';
    yield serializers.serialize(
      object.verificationReference,
      specifiedType: const FullType(String),
    );
    yield r'proof';
    yield serializers.serialize(
      object.proof,
      specifiedType: const FullType(String),
    );
    if (object.newVerifiedIdentity != null) {
      yield r'newVerifiedIdentity';
      yield serializers.serialize(
        object.newVerifiedIdentity,
        specifiedType: const FullType(RecoveryVerifyCommandNewVerifiedIdentity),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    RecoveryVerifyCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RecoveryVerifyCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'verificationReference':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.verificationReference = valueDes;
          break;
        case r'proof':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.proof = valueDes;
          break;
        case r'newVerifiedIdentity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(RecoveryVerifyCommandNewVerifiedIdentity),
          ) as RecoveryVerifyCommandNewVerifiedIdentity;
          result.newVerifiedIdentity.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  RecoveryVerifyCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RecoveryVerifyCommandBuilder();
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

