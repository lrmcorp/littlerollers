//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'decide_correction_request.g.dart';

/// DecideCorrectionRequest
///
/// Properties:
/// * [reason] 
@BuiltValue()
abstract class DecideCorrectionRequest implements Built<DecideCorrectionRequest, DecideCorrectionRequestBuilder> {
  @BuiltValueField(wireName: r'reason')
  String get reason;

  DecideCorrectionRequest._();

  factory DecideCorrectionRequest([void updates(DecideCorrectionRequestBuilder b)]) = _$DecideCorrectionRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DecideCorrectionRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DecideCorrectionRequest> get serializer => _$DecideCorrectionRequestSerializer();
}

class _$DecideCorrectionRequestSerializer implements PrimitiveSerializer<DecideCorrectionRequest> {
  @override
  final Iterable<Type> types = const [DecideCorrectionRequest, _$DecideCorrectionRequest];

  @override
  final String wireName = r'DecideCorrectionRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DecideCorrectionRequest object, {
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
    DecideCorrectionRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DecideCorrectionRequestBuilder result,
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
  DecideCorrectionRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DecideCorrectionRequestBuilder();
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

