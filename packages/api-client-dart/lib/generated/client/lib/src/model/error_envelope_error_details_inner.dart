//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'error_envelope_error_details_inner.g.dart';

/// ErrorEnvelopeErrorDetailsInner
///
/// Properties:
/// * [field] 
/// * [code] 
/// * [message] 
@BuiltValue()
abstract class ErrorEnvelopeErrorDetailsInner implements Built<ErrorEnvelopeErrorDetailsInner, ErrorEnvelopeErrorDetailsInnerBuilder> {
  @BuiltValueField(wireName: r'field')
  String? get field;

  @BuiltValueField(wireName: r'code')
  String? get code;

  @BuiltValueField(wireName: r'message')
  String? get message;

  ErrorEnvelopeErrorDetailsInner._();

  factory ErrorEnvelopeErrorDetailsInner([void updates(ErrorEnvelopeErrorDetailsInnerBuilder b)]) = _$ErrorEnvelopeErrorDetailsInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ErrorEnvelopeErrorDetailsInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ErrorEnvelopeErrorDetailsInner> get serializer => _$ErrorEnvelopeErrorDetailsInnerSerializer();
}

class _$ErrorEnvelopeErrorDetailsInnerSerializer implements PrimitiveSerializer<ErrorEnvelopeErrorDetailsInner> {
  @override
  final Iterable<Type> types = const [ErrorEnvelopeErrorDetailsInner, _$ErrorEnvelopeErrorDetailsInner];

  @override
  final String wireName = r'ErrorEnvelopeErrorDetailsInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ErrorEnvelopeErrorDetailsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.field != null) {
      yield r'field';
      yield serializers.serialize(
        object.field,
        specifiedType: const FullType(String),
      );
    }
    if (object.code != null) {
      yield r'code';
      yield serializers.serialize(
        object.code,
        specifiedType: const FullType(String),
      );
    }
    if (object.message != null) {
      yield r'message';
      yield serializers.serialize(
        object.message,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    ErrorEnvelopeErrorDetailsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ErrorEnvelopeErrorDetailsInnerBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'field':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.field = valueDes;
          break;
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ErrorEnvelopeErrorDetailsInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ErrorEnvelopeErrorDetailsInnerBuilder();
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

