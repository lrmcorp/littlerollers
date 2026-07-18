//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'token_check_in_command.g.dart';

/// TokenCheckInCommand
///
/// Properties:
/// * [token] 
@BuiltValue()
abstract class TokenCheckInCommand implements Built<TokenCheckInCommand, TokenCheckInCommandBuilder> {
  @BuiltValueField(wireName: r'token')
  String get token;

  TokenCheckInCommand._();

  factory TokenCheckInCommand([void updates(TokenCheckInCommandBuilder b)]) = _$TokenCheckInCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(TokenCheckInCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<TokenCheckInCommand> get serializer => _$TokenCheckInCommandSerializer();
}

class _$TokenCheckInCommandSerializer implements PrimitiveSerializer<TokenCheckInCommand> {
  @override
  final Iterable<Type> types = const [TokenCheckInCommand, _$TokenCheckInCommand];

  @override
  final String wireName = r'TokenCheckInCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    TokenCheckInCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'token';
    yield serializers.serialize(
      object.token,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    TokenCheckInCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required TokenCheckInCommandBuilder result,
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  TokenCheckInCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = TokenCheckInCommandBuilder();
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

