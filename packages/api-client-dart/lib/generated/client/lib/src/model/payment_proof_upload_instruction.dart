//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'payment_proof_upload_instruction.g.dart';

/// PaymentProofUploadInstruction
///
/// Properties:
/// * [id] 
/// * [status] 
/// * [scanStatus] 
/// * [uploadReference] - Opaque synthetic reference; never a provider credential or signed URL
@BuiltValue()
abstract class PaymentProofUploadInstruction implements Built<PaymentProofUploadInstruction, PaymentProofUploadInstructionBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'status')
  JsonObject? get status;

  @BuiltValueField(wireName: r'scanStatus')
  JsonObject? get scanStatus;

  /// Opaque synthetic reference; never a provider credential or signed URL
  @BuiltValueField(wireName: r'uploadReference')
  String get uploadReference;

  PaymentProofUploadInstruction._();

  factory PaymentProofUploadInstruction([void updates(PaymentProofUploadInstructionBuilder b)]) = _$PaymentProofUploadInstruction;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PaymentProofUploadInstructionBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PaymentProofUploadInstruction> get serializer => _$PaymentProofUploadInstructionSerializer();
}

class _$PaymentProofUploadInstructionSerializer implements PrimitiveSerializer<PaymentProofUploadInstruction> {
  @override
  final Iterable<Type> types = const [PaymentProofUploadInstruction, _$PaymentProofUploadInstruction];

  @override
  final String wireName = r'PaymentProofUploadInstruction';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PaymentProofUploadInstruction object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield object.status == null ? null : serializers.serialize(
      object.status,
      specifiedType: const FullType.nullable(JsonObject),
    );
    yield r'scanStatus';
    yield object.scanStatus == null ? null : serializers.serialize(
      object.scanStatus,
      specifiedType: const FullType.nullable(JsonObject),
    );
    yield r'uploadReference';
    yield serializers.serialize(
      object.uploadReference,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PaymentProofUploadInstruction object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PaymentProofUploadInstructionBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(JsonObject),
          ) as JsonObject?;
          if (valueDes == null) continue;
          result.status = valueDes;
          break;
        case r'scanStatus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(JsonObject),
          ) as JsonObject?;
          if (valueDes == null) continue;
          result.scanStatus = valueDes;
          break;
        case r'uploadReference':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.uploadReference = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PaymentProofUploadInstruction deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PaymentProofUploadInstructionBuilder();
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

