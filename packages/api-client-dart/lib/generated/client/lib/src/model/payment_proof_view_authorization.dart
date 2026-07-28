//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'payment_proof_view_authorization.g.dart';

/// PaymentProofViewAuthorization
///
/// Properties:
/// * [url] - One-time viewer-bound URL; never log or send to analytics
/// * [expiresAt] 
@BuiltValue()
abstract class PaymentProofViewAuthorization implements Built<PaymentProofViewAuthorization, PaymentProofViewAuthorizationBuilder> {
  /// One-time viewer-bound URL; never log or send to analytics
  @BuiltValueField(wireName: r'url')
  String get url;

  @BuiltValueField(wireName: r'expiresAt')
  DateTime get expiresAt;

  PaymentProofViewAuthorization._();

  factory PaymentProofViewAuthorization([void updates(PaymentProofViewAuthorizationBuilder b)]) = _$PaymentProofViewAuthorization;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PaymentProofViewAuthorizationBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PaymentProofViewAuthorization> get serializer => _$PaymentProofViewAuthorizationSerializer();
}

class _$PaymentProofViewAuthorizationSerializer implements PrimitiveSerializer<PaymentProofViewAuthorization> {
  @override
  final Iterable<Type> types = const [PaymentProofViewAuthorization, _$PaymentProofViewAuthorization];

  @override
  final String wireName = r'PaymentProofViewAuthorization';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PaymentProofViewAuthorization object, {
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
    PaymentProofViewAuthorization object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PaymentProofViewAuthorizationBuilder result,
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
  PaymentProofViewAuthorization deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PaymentProofViewAuthorizationBuilder();
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

