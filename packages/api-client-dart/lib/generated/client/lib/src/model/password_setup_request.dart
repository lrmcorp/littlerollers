//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'password_setup_request.g.dart';

/// PasswordSetupRequest
///
/// Properties:
/// * [email] 
/// * [reason] 
@BuiltValue()
abstract class PasswordSetupRequest implements Built<PasswordSetupRequest, PasswordSetupRequestBuilder> {
  @BuiltValueField(wireName: r'email')
  String get email;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  PasswordSetupRequest._();

  factory PasswordSetupRequest([void updates(PasswordSetupRequestBuilder b)]) = _$PasswordSetupRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PasswordSetupRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PasswordSetupRequest> get serializer => _$PasswordSetupRequestSerializer();
}

class _$PasswordSetupRequestSerializer implements PrimitiveSerializer<PasswordSetupRequest> {
  @override
  final Iterable<Type> types = const [PasswordSetupRequest, _$PasswordSetupRequest];

  @override
  final String wireName = r'PasswordSetupRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PasswordSetupRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'email';
    yield serializers.serialize(
      object.email,
      specifiedType: const FullType(String),
    );
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PasswordSetupRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PasswordSetupRequestBuilder result,
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
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PasswordSetupRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PasswordSetupRequestBuilder();
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

