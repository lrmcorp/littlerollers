//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'authorize_identity_verification_view200_response.g.dart';

/// AuthorizeIdentityVerificationView200Response
///
/// Properties:
/// * [url] 
/// * [expiresAt] 
@BuiltValue()
abstract class AuthorizeIdentityVerificationView200Response implements Built<AuthorizeIdentityVerificationView200Response, AuthorizeIdentityVerificationView200ResponseBuilder> {
  @BuiltValueField(wireName: r'url')
  String get url;

  @BuiltValueField(wireName: r'expiresAt')
  DateTime get expiresAt;

  AuthorizeIdentityVerificationView200Response._();

  factory AuthorizeIdentityVerificationView200Response([void updates(AuthorizeIdentityVerificationView200ResponseBuilder b)]) = _$AuthorizeIdentityVerificationView200Response;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AuthorizeIdentityVerificationView200ResponseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AuthorizeIdentityVerificationView200Response> get serializer => _$AuthorizeIdentityVerificationView200ResponseSerializer();
}

class _$AuthorizeIdentityVerificationView200ResponseSerializer implements PrimitiveSerializer<AuthorizeIdentityVerificationView200Response> {
  @override
  final Iterable<Type> types = const [AuthorizeIdentityVerificationView200Response, _$AuthorizeIdentityVerificationView200Response];

  @override
  final String wireName = r'AuthorizeIdentityVerificationView200Response';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AuthorizeIdentityVerificationView200Response object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'url';
    yield serializers.serialize(
      object.url,
      specifiedType: const FullType(String),
    );
    yield r'expiresAt';
    yield serializers.serialize(
      object.expiresAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AuthorizeIdentityVerificationView200Response object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AuthorizeIdentityVerificationView200ResponseBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'url':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.url = valueDes;
          break;
        case r'expiresAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.expiresAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AuthorizeIdentityVerificationView200Response deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AuthorizeIdentityVerificationView200ResponseBuilder();
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

