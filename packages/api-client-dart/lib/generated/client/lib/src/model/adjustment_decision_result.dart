//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/session_adjustment.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'adjustment_decision_result.g.dart';

/// AdjustmentDecisionResult
///
/// Properties:
/// * [adjustment] 
/// * [idempotentReplay] 
@BuiltValue()
abstract class AdjustmentDecisionResult implements Built<AdjustmentDecisionResult, AdjustmentDecisionResultBuilder> {
  @BuiltValueField(wireName: r'adjustment')
  SessionAdjustment get adjustment;

  @BuiltValueField(wireName: r'idempotentReplay')
  bool get idempotentReplay;

  AdjustmentDecisionResult._();

  factory AdjustmentDecisionResult([void updates(AdjustmentDecisionResultBuilder b)]) = _$AdjustmentDecisionResult;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AdjustmentDecisionResultBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AdjustmentDecisionResult> get serializer => _$AdjustmentDecisionResultSerializer();
}

class _$AdjustmentDecisionResultSerializer implements PrimitiveSerializer<AdjustmentDecisionResult> {
  @override
  final Iterable<Type> types = const [AdjustmentDecisionResult, _$AdjustmentDecisionResult];

  @override
  final String wireName = r'AdjustmentDecisionResult';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AdjustmentDecisionResult object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'adjustment';
    yield serializers.serialize(
      object.adjustment,
      specifiedType: const FullType(SessionAdjustment),
    );
    yield r'idempotentReplay';
    yield serializers.serialize(
      object.idempotentReplay,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AdjustmentDecisionResult object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AdjustmentDecisionResultBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'adjustment':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(SessionAdjustment),
          ) as SessionAdjustment;
          result.adjustment.replace(valueDes);
          break;
        case r'idempotentReplay':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.idempotentReplay = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AdjustmentDecisionResult deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AdjustmentDecisionResultBuilder();
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

