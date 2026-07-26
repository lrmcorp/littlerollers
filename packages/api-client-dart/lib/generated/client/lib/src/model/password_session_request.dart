//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'password_session_request.g.dart';

/// PasswordSessionRequest
///
/// Properties:
/// * [email] 
/// * [password] 
/// * [channel] 
@BuiltValue()
abstract class PasswordSessionRequest implements Built<PasswordSessionRequest, PasswordSessionRequestBuilder> {
  @BuiltValueField(wireName: r'email')
  String get email;

  @BuiltValueField(wireName: r'password')
  String get password;

  @BuiltValueField(wireName: r'channel')
  PasswordSessionRequestChannelEnum get channel;
  // enum channelEnum {  WEB,  MOBILE,  };

  PasswordSessionRequest._();

  factory PasswordSessionRequest([void updates(PasswordSessionRequestBuilder b)]) = _$PasswordSessionRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PasswordSessionRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PasswordSessionRequest> get serializer => _$PasswordSessionRequestSerializer();
}

class _$PasswordSessionRequestSerializer implements PrimitiveSerializer<PasswordSessionRequest> {
  @override
  final Iterable<Type> types = const [PasswordSessionRequest, _$PasswordSessionRequest];

  @override
  final String wireName = r'PasswordSessionRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PasswordSessionRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'email';
    yield serializers.serialize(
      object.email,
      specifiedType: const FullType(String),
    );
    yield r'password';
    yield serializers.serialize(
      object.password,
      specifiedType: const FullType(String),
    );
    yield r'channel';
    yield serializers.serialize(
      object.channel,
      specifiedType: const FullType(PasswordSessionRequestChannelEnum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PasswordSessionRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PasswordSessionRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'email':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.email = valueDes;
          break;
        case r'password':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.password = valueDes;
          break;
        case r'channel':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PasswordSessionRequestChannelEnum),
          ) as PasswordSessionRequestChannelEnum;
          result.channel = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PasswordSessionRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PasswordSessionRequestBuilder();
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

class PasswordSessionRequestChannelEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'WEB')
  static const PasswordSessionRequestChannelEnum WEB = _$passwordSessionRequestChannelEnum_WEB;
  @BuiltValueEnumConst(wireName: r'MOBILE')
  static const PasswordSessionRequestChannelEnum MOBILE = _$passwordSessionRequestChannelEnum_MOBILE;

  static Serializer<PasswordSessionRequestChannelEnum> get serializer => _$passwordSessionRequestChannelEnumSerializer;

  const PasswordSessionRequestChannelEnum._(String name): super(name);

  static BuiltSet<PasswordSessionRequestChannelEnum> get values => _$passwordSessionRequestChannelEnumValues;
  static PasswordSessionRequestChannelEnum valueOf(String name) => _$passwordSessionRequestChannelEnumValueOf(name);
}

