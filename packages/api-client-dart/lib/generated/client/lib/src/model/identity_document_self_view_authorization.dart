//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'identity_document_self_view_authorization.g.dart';

/// IdentityDocumentSelfViewAuthorization
///
/// Properties:
/// * [url] 
/// * [expiresAt] 
@BuiltValue()
abstract class IdentityDocumentSelfViewAuthorization implements Built<IdentityDocumentSelfViewAuthorization, IdentityDocumentSelfViewAuthorizationBuilder> {
  @BuiltValueField(wireName: r'url')
  String get url;

  @BuiltValueField(wireName: r'expiresAt')
  DateTime get expiresAt;

  IdentityDocumentSelfViewAuthorization._();

  factory IdentityDocumentSelfViewAuthorization([void updates(IdentityDocumentSelfViewAuthorizationBuilder b)]) = _$IdentityDocumentSelfViewAuthorization;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(IdentityDocumentSelfViewAuthorizationBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<IdentityDocumentSelfViewAuthorization> get serializer => _$IdentityDocumentSelfViewAuthorizationSerializer();
}

class _$IdentityDocumentSelfViewAuthorizationSerializer implements PrimitiveSerializer<IdentityDocumentSelfViewAuthorization> {
  @override
  final Iterable<Type> types = const [IdentityDocumentSelfViewAuthorization, _$IdentityDocumentSelfViewAuthorization];

  @override
  final String wireName = r'IdentityDocumentSelfViewAuthorization';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    IdentityDocumentSelfViewAuthorization object, {
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
    IdentityDocumentSelfViewAuthorization object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required IdentityDocumentSelfViewAuthorizationBuilder result,
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
  IdentityDocumentSelfViewAuthorization deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = IdentityDocumentSelfViewAuthorizationBuilder();
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

