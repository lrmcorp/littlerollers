//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'add_support_case_internal_note_request.g.dart';

/// AddSupportCaseInternalNoteRequest
///
/// Properties:
/// * [body] 
@BuiltValue()
abstract class AddSupportCaseInternalNoteRequest implements Built<AddSupportCaseInternalNoteRequest, AddSupportCaseInternalNoteRequestBuilder> {
  @BuiltValueField(wireName: r'body')
  String get body;

  AddSupportCaseInternalNoteRequest._();

  factory AddSupportCaseInternalNoteRequest([void updates(AddSupportCaseInternalNoteRequestBuilder b)]) = _$AddSupportCaseInternalNoteRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AddSupportCaseInternalNoteRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AddSupportCaseInternalNoteRequest> get serializer => _$AddSupportCaseInternalNoteRequestSerializer();
}

class _$AddSupportCaseInternalNoteRequestSerializer implements PrimitiveSerializer<AddSupportCaseInternalNoteRequest> {
  @override
  final Iterable<Type> types = const [AddSupportCaseInternalNoteRequest, _$AddSupportCaseInternalNoteRequest];

  @override
  final String wireName = r'AddSupportCaseInternalNoteRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AddSupportCaseInternalNoteRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'body';
    yield serializers.serialize(
      object.body,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AddSupportCaseInternalNoteRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AddSupportCaseInternalNoteRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'body':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.body = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AddSupportCaseInternalNoteRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AddSupportCaseInternalNoteRequestBuilder();
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

