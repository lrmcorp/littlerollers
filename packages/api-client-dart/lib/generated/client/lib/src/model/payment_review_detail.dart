//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/payment_review_timeline.dart';
import 'package:openapi/src/model/payment_usage_history_page.dart';
import 'package:openapi/src/model/payment_activation_summary.dart';
import 'package:openapi/src/model/payment_activation_result.dart';
import 'package:openapi/src/model/payment_review_item.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'payment_review_detail.g.dart';

/// PaymentReviewDetail
///
/// Properties:
/// * [purchase] 
/// * [timeline] 
/// * [decisionActorMasked] 
/// * [activation] 
/// * [balance] 
/// * [usageHistory] 
@BuiltValue()
abstract class PaymentReviewDetail implements Built<PaymentReviewDetail, PaymentReviewDetailBuilder> {
  @BuiltValueField(wireName: r'purchase')
  PaymentReviewItem get purchase;

  @BuiltValueField(wireName: r'timeline')
  PaymentReviewTimeline get timeline;

  @BuiltValueField(wireName: r'decisionActorMasked')
  String? get decisionActorMasked;

  @BuiltValueField(wireName: r'activation')
  PaymentActivationResult? get activation;

  @BuiltValueField(wireName: r'balance')
  PaymentActivationSummary? get balance;

  @BuiltValueField(wireName: r'usageHistory')
  PaymentUsageHistoryPage get usageHistory;

  PaymentReviewDetail._();

  factory PaymentReviewDetail([void updates(PaymentReviewDetailBuilder b)]) = _$PaymentReviewDetail;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PaymentReviewDetailBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PaymentReviewDetail> get serializer => _$PaymentReviewDetailSerializer();
}

class _$PaymentReviewDetailSerializer implements PrimitiveSerializer<PaymentReviewDetail> {
  @override
  final Iterable<Type> types = const [PaymentReviewDetail, _$PaymentReviewDetail];

  @override
  final String wireName = r'PaymentReviewDetail';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PaymentReviewDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'purchase';
    yield serializers.serialize(
      object.purchase,
      specifiedType: const FullType(PaymentReviewItem),
    );
    yield r'timeline';
    yield serializers.serialize(
      object.timeline,
      specifiedType: const FullType(PaymentReviewTimeline),
    );
    yield r'decisionActorMasked';
    yield object.decisionActorMasked == null ? null : serializers.serialize(
      object.decisionActorMasked,
      specifiedType: const FullType.nullable(String),
    );
    yield r'activation';
    yield object.activation == null ? null : serializers.serialize(
      object.activation,
      specifiedType: const FullType.nullable(PaymentActivationResult),
    );
    yield r'balance';
    yield object.balance == null ? null : serializers.serialize(
      object.balance,
      specifiedType: const FullType.nullable(PaymentActivationSummary),
    );
    yield r'usageHistory';
    yield serializers.serialize(
      object.usageHistory,
      specifiedType: const FullType(PaymentUsageHistoryPage),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PaymentReviewDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PaymentReviewDetailBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'purchase':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PaymentReviewItem),
          ) as PaymentReviewItem;
          result.purchase.replace(valueDes);
          break;
        case r'timeline':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PaymentReviewTimeline),
          ) as PaymentReviewTimeline;
          result.timeline.replace(valueDes);
          break;
        case r'decisionActorMasked':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.decisionActorMasked = valueDes;
          break;
        case r'activation':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(PaymentActivationResult),
          ) as PaymentActivationResult?;
          if (valueDes == null) continue;
          result.activation.replace(valueDes);
          break;
        case r'balance':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(PaymentActivationSummary),
          ) as PaymentActivationSummary?;
          if (valueDes == null) continue;
          result.balance.replace(valueDes);
          break;
        case r'usageHistory':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PaymentUsageHistoryPage),
          ) as PaymentUsageHistoryPage;
          result.usageHistory.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PaymentReviewDetail deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PaymentReviewDetailBuilder();
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

