//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'quota_evaluation_command.g.dart';

/// QuotaEvaluationCommand
///
/// Properties:
/// * [expectedDueAt] 
/// * [expectedVersion] 
/// * [reason] 
@BuiltValue()
abstract class QuotaEvaluationCommand implements Built<QuotaEvaluationCommand, QuotaEvaluationCommandBuilder> {
  @BuiltValueField(wireName: r'expectedDueAt')
  DateTime get expectedDueAt;

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  @BuiltValueField(wireName: r'reason')
  String? get reason;

  QuotaEvaluationCommand._();

  factory QuotaEvaluationCommand([void updates(QuotaEvaluationCommandBuilder b)]) = _$QuotaEvaluationCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(QuotaEvaluationCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<QuotaEvaluationCommand> get serializer => _$QuotaEvaluationCommandSerializer();
}

class _$QuotaEvaluationCommandSerializer implements PrimitiveSerializer<QuotaEvaluationCommand> {
  @override
  final Iterable<Type> types = const [QuotaEvaluationCommand, _$QuotaEvaluationCommand];

  @override
  final String wireName = r'QuotaEvaluationCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    QuotaEvaluationCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'expectedDueAt';
    yield serializers.serialize(
      object.expectedDueAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
    if (object.reason != null) {
      yield r'reason';
      yield serializers.serialize(
        object.reason,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    QuotaEvaluationCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required QuotaEvaluationCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'expectedDueAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.expectedDueAt = valueDes;
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
  QuotaEvaluationCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = QuotaEvaluationCommandBuilder();
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

