//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'google_auth_request.g.dart';

/// GoogleAuthRequest
///
/// Properties:
/// * [idToken] 
/// * [nonce] 
/// * [channel] 
@BuiltValue()
abstract class GoogleAuthRequest implements Built<GoogleAuthRequest, GoogleAuthRequestBuilder> {
  @BuiltValueField(wireName: r'idToken')
  String get idToken;

  @BuiltValueField(wireName: r'nonce')
  String get nonce;

  @BuiltValueField(wireName: r'channel')
  GoogleAuthRequestChannelEnum get channel;
  // enum channelEnum {  WEB,  MOBILE,  };

  GoogleAuthRequest._();

  factory GoogleAuthRequest([void updates(GoogleAuthRequestBuilder b)]) = _$GoogleAuthRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(GoogleAuthRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<GoogleAuthRequest> get serializer => _$GoogleAuthRequestSerializer();
}

class _$GoogleAuthRequestSerializer implements PrimitiveSerializer<GoogleAuthRequest> {
  @override
  final Iterable<Type> types = const [GoogleAuthRequest, _$GoogleAuthRequest];

  @override
  final String wireName = r'GoogleAuthRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    GoogleAuthRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'idToken';
    yield serializers.serialize(
      object.idToken,
      specifiedType: const FullType(String),
    );
    yield r'nonce';
    yield serializers.serialize(
      object.nonce,
      specifiedType: const FullType(String),
    );
    yield r'channel';
    yield serializers.serialize(
      object.channel,
      specifiedType: const FullType(GoogleAuthRequestChannelEnum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    GoogleAuthRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required GoogleAuthRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'idToken':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.idToken = valueDes;
          break;
        case r'nonce':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.nonce = valueDes;
          break;
        case r'channel':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(GoogleAuthRequestChannelEnum),
          ) as GoogleAuthRequestChannelEnum;
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
  GoogleAuthRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = GoogleAuthRequestBuilder();
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

class GoogleAuthRequestChannelEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'WEB')
  static const GoogleAuthRequestChannelEnum WEB = _$googleAuthRequestChannelEnum_WEB;
  @BuiltValueEnumConst(wireName: r'MOBILE')
  static const GoogleAuthRequestChannelEnum MOBILE = _$googleAuthRequestChannelEnum_MOBILE;

  static Serializer<GoogleAuthRequestChannelEnum> get serializer => _$googleAuthRequestChannelEnumSerializer;

  const GoogleAuthRequestChannelEnum._(String name): super(name);

  static BuiltSet<GoogleAuthRequestChannelEnum> get values => _$googleAuthRequestChannelEnumValues;
  static GoogleAuthRequestChannelEnum valueOf(String name) => _$googleAuthRequestChannelEnumValueOf(name);
}

