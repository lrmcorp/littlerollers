//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'payment_review_timeline.g.dart';

/// PaymentReviewTimeline
///
/// Properties:
/// * [submittedAt] 
/// * [proofFinalizedAt] 
/// * [decidedAt] 
@BuiltValue()
abstract class PaymentReviewTimeline implements Built<PaymentReviewTimeline, PaymentReviewTimelineBuilder> {
  @BuiltValueField(wireName: r'submittedAt')
  DateTime get submittedAt;

  @BuiltValueField(wireName: r'proofFinalizedAt')
  DateTime? get proofFinalizedAt;

  @BuiltValueField(wireName: r'decidedAt')
  DateTime? get decidedAt;

  PaymentReviewTimeline._();

  factory PaymentReviewTimeline([void updates(PaymentReviewTimelineBuilder b)]) = _$PaymentReviewTimeline;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PaymentReviewTimelineBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PaymentReviewTimeline> get serializer => _$PaymentReviewTimelineSerializer();
}

class _$PaymentReviewTimelineSerializer implements PrimitiveSerializer<PaymentReviewTimeline> {
  @override
  final Iterable<Type> types = const [PaymentReviewTimeline, _$PaymentReviewTimeline];

  @override
  final String wireName = r'PaymentReviewTimeline';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PaymentReviewTimeline object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'submittedAt';
    yield serializers.serialize(
      object.submittedAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'proofFinalizedAt';
    yield object.proofFinalizedAt == null ? null : serializers.serialize(
      object.proofFinalizedAt,
      specifiedType: const FullType.nullable(DateTime),
    );
    yield r'decidedAt';
    yield object.decidedAt == null ? null : serializers.serialize(
      object.decidedAt,
      specifiedType: const FullType.nullable(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PaymentReviewTimeline object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PaymentReviewTimelineBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'submittedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.submittedAt = valueDes;
          break;
        case r'proofFinalizedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.proofFinalizedAt = valueDes;
          break;
        case r'decidedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.decidedAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PaymentReviewTimeline deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PaymentReviewTimelineBuilder();
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

