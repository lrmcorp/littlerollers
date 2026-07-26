//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'attach_order_proof_command.g.dart';

/// AttachOrderProofCommand
///
/// Properties:
/// * [paymentProofId] 
/// * [expectedVersion] 
@BuiltValue()
abstract class AttachOrderProofCommand implements Built<AttachOrderProofCommand, AttachOrderProofCommandBuilder> {
  @BuiltValueField(wireName: r'paymentProofId')
  String get paymentProofId;

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  AttachOrderProofCommand._();

  factory AttachOrderProofCommand([void updates(AttachOrderProofCommandBuilder b)]) = _$AttachOrderProofCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AttachOrderProofCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AttachOrderProofCommand> get serializer => _$AttachOrderProofCommandSerializer();
}

class _$AttachOrderProofCommandSerializer implements PrimitiveSerializer<AttachOrderProofCommand> {
  @override
  final Iterable<Type> types = const [AttachOrderProofCommand, _$AttachOrderProofCommand];

  @override
  final String wireName = r'AttachOrderProofCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AttachOrderProofCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'paymentProofId';
    yield serializers.serialize(
      object.paymentProofId,
      specifiedType: const FullType(String),
    );
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AttachOrderProofCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AttachOrderProofCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'paymentProofId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.paymentProofId = valueDes;
          break;
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AttachOrderProofCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AttachOrderProofCommandBuilder();
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

