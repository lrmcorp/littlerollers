//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/booking.dart';
import 'package:openapi/src/model/reschedule.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'reschedule_decision_result.g.dart';

/// RescheduleDecisionResult
///
/// Properties:
/// * [reschedule] 
/// * [booking] 
/// * [idempotentReplay] 
@BuiltValue()
abstract class RescheduleDecisionResult implements Built<RescheduleDecisionResult, RescheduleDecisionResultBuilder> {
  @BuiltValueField(wireName: r'reschedule')
  Reschedule get reschedule;

  @BuiltValueField(wireName: r'booking')
  Booking get booking;

  @BuiltValueField(wireName: r'idempotentReplay')
  bool get idempotentReplay;

  RescheduleDecisionResult._();

  factory RescheduleDecisionResult([void updates(RescheduleDecisionResultBuilder b)]) = _$RescheduleDecisionResult;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RescheduleDecisionResultBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RescheduleDecisionResult> get serializer => _$RescheduleDecisionResultSerializer();
}

class _$RescheduleDecisionResultSerializer implements PrimitiveSerializer<RescheduleDecisionResult> {
  @override
  final Iterable<Type> types = const [RescheduleDecisionResult, _$RescheduleDecisionResult];

  @override
  final String wireName = r'RescheduleDecisionResult';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RescheduleDecisionResult object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'reschedule';
    yield serializers.serialize(
      object.reschedule,
      specifiedType: const FullType(Reschedule),
    );
    yield r'booking';
    yield serializers.serialize(
      object.booking,
      specifiedType: const FullType(Booking),
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
    RescheduleDecisionResult object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RescheduleDecisionResultBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'reschedule':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Reschedule),
          ) as Reschedule;
          result.reschedule.replace(valueDes);
          break;
        case r'booking':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Booking),
          ) as Booking;
          result.booking.replace(valueDes);
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
  RescheduleDecisionResult deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RescheduleDecisionResultBuilder();
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

