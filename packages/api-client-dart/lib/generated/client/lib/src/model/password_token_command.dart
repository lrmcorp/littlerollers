//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'password_token_command.g.dart';

/// PasswordTokenCommand
///
/// Properties:
/// * [token] 
/// * [password] 
@BuiltValue()
abstract class PasswordTokenCommand implements Built<PasswordTokenCommand, PasswordTokenCommandBuilder> {
  @BuiltValueField(wireName: r'token')
  String get token;

  @BuiltValueField(wireName: r'password')
  String get password;

  PasswordTokenCommand._();

  factory PasswordTokenCommand([void updates(PasswordTokenCommandBuilder b)]) = _$PasswordTokenCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PasswordTokenCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PasswordTokenCommand> get serializer => _$PasswordTokenCommandSerializer();
}

class _$PasswordTokenCommandSerializer implements PrimitiveSerializer<PasswordTokenCommand> {
  @override
  final Iterable<Type> types = const [PasswordTokenCommand, _$PasswordTokenCommand];

  @override
  final String wireName = r'PasswordTokenCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PasswordTokenCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'token';
    yield serializers.serialize(
      object.token,
      specifiedType: const FullType(String),
    );
    yield r'password';
    yield serializers.serialize(
      object.password,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PasswordTokenCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PasswordTokenCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'token':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.token = valueDes;
          break;
        case r'password':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.password = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PasswordTokenCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PasswordTokenCommandBuilder();
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

