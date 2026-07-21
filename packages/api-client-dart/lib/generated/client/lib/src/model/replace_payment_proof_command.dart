//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'replace_payment_proof_command.g.dart';

/// ReplacePaymentProofCommand
///
/// Properties:
/// * [newPaymentProofUploadId] 
/// * [expectedVersion] 
/// * [reason] 
@BuiltValue()
abstract class ReplacePaymentProofCommand implements Built<ReplacePaymentProofCommand, ReplacePaymentProofCommandBuilder> {
  @BuiltValueField(wireName: r'newPaymentProofUploadId')
  String get newPaymentProofUploadId;

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  ReplacePaymentProofCommand._();

  factory ReplacePaymentProofCommand([void updates(ReplacePaymentProofCommandBuilder b)]) = _$ReplacePaymentProofCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ReplacePaymentProofCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ReplacePaymentProofCommand> get serializer => _$ReplacePaymentProofCommandSerializer();
}

class _$ReplacePaymentProofCommandSerializer implements PrimitiveSerializer<ReplacePaymentProofCommand> {
  @override
  final Iterable<Type> types = const [ReplacePaymentProofCommand, _$ReplacePaymentProofCommand];

  @override
  final String wireName = r'ReplacePaymentProofCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ReplacePaymentProofCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'newPaymentProofUploadId';
    yield serializers.serialize(
      object.newPaymentProofUploadId,
      specifiedType: const FullType(String),
    );
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
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
    ReplacePaymentProofCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ReplacePaymentProofCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'newPaymentProofUploadId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.newPaymentProofUploadId = valueDes;
          break;
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
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
  ReplacePaymentProofCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ReplacePaymentProofCommandBuilder();
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

