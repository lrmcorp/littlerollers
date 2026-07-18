//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/error_envelope_error_details_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'error_envelope_error.g.dart';

/// ErrorEnvelopeError
///
/// Properties:
/// * [code] 
/// * [message] 
/// * [correlationId] 
/// * [details] 
/// * [retryable] 
@BuiltValue()
abstract class ErrorEnvelopeError implements Built<ErrorEnvelopeError, ErrorEnvelopeErrorBuilder> {
  @BuiltValueField(wireName: r'code')
  String get code;

  @BuiltValueField(wireName: r'message')
  String get message;

  @BuiltValueField(wireName: r'correlationId')
  String get correlationId;

  @BuiltValueField(wireName: r'details')
  BuiltList<ErrorEnvelopeErrorDetailsInner> get details;

  @BuiltValueField(wireName: r'retryable')
  bool? get retryable;

  ErrorEnvelopeError._();

  factory ErrorEnvelopeError([void updates(ErrorEnvelopeErrorBuilder b)]) = _$ErrorEnvelopeError;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ErrorEnvelopeErrorBuilder b) => b
      ..retryable = false;

  @BuiltValueSerializer(custom: true)
  static Serializer<ErrorEnvelopeError> get serializer => _$ErrorEnvelopeErrorSerializer();
}

class _$ErrorEnvelopeErrorSerializer implements PrimitiveSerializer<ErrorEnvelopeError> {
  @override
  final Iterable<Type> types = const [ErrorEnvelopeError, _$ErrorEnvelopeError];

  @override
  final String wireName = r'ErrorEnvelopeError';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ErrorEnvelopeError object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
    yield r'message';
    yield serializers.serialize(
      object.message,
      specifiedType: const FullType(String),
    );
    yield r'correlationId';
    yield serializers.serialize(
      object.correlationId,
      specifiedType: const FullType(String),
    );
    yield r'details';
    yield serializers.serialize(
      object.details,
      specifiedType: const FullType(BuiltList, [FullType(ErrorEnvelopeErrorDetailsInner)]),
    );
    if (object.retryable != null) {
      yield r'retryable';
      yield serializers.serialize(
        object.retryable,
        specifiedType: const FullType(bool),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    ErrorEnvelopeError object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ErrorEnvelopeErrorBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
        case r'message':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.message = valueDes;
          break;
        case r'correlationId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.correlationId = valueDes;
          break;
        case r'details':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(ErrorEnvelopeErrorDetailsInner)]),
          ) as BuiltList<ErrorEnvelopeErrorDetailsInner>;
          result.details.replace(valueDes);
          break;
        case r'retryable':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.retryable = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ErrorEnvelopeError deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ErrorEnvelopeErrorBuilder();
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

