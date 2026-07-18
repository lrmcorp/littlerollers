//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'deactivate_user_request.g.dart';

/// DeactivateUserRequest
///
/// Properties:
/// * [reason] 
@BuiltValue()
abstract class DeactivateUserRequest implements Built<DeactivateUserRequest, DeactivateUserRequestBuilder> {
  @BuiltValueField(wireName: r'reason')
  String get reason;

  DeactivateUserRequest._();

  factory DeactivateUserRequest([void updates(DeactivateUserRequestBuilder b)]) = _$DeactivateUserRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DeactivateUserRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DeactivateUserRequest> get serializer => _$DeactivateUserRequestSerializer();
}

class _$DeactivateUserRequestSerializer implements PrimitiveSerializer<DeactivateUserRequest> {
  @override
  final Iterable<Type> types = const [DeactivateUserRequest, _$DeactivateUserRequest];

  @override
  final String wireName = r'DeactivateUserRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DeactivateUserRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    DeactivateUserRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DeactivateUserRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
  DeactivateUserRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DeactivateUserRequestBuilder();
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

