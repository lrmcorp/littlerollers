//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'payment_review_summary.g.dart';

/// PaymentReviewSummary
///
/// Properties:
/// * [pending] 
/// * [actionRequired] 
/// * [approved] 
/// * [rejected] 
/// * [expired] 
/// * [totalAmountRp] 
/// * [agingOver24Hours] 
@BuiltValue()
abstract class PaymentReviewSummary implements Built<PaymentReviewSummary, PaymentReviewSummaryBuilder> {
  @BuiltValueField(wireName: r'pending')
  int get pending;

  @BuiltValueField(wireName: r'actionRequired')
  int get actionRequired;

  @BuiltValueField(wireName: r'approved')
  int get approved;

  @BuiltValueField(wireName: r'rejected')
  int get rejected;

  @BuiltValueField(wireName: r'expired')
  int get expired;

  @BuiltValueField(wireName: r'totalAmountRp')
  int get totalAmountRp;

  @BuiltValueField(wireName: r'agingOver24Hours')
  int get agingOver24Hours;

  PaymentReviewSummary._();

  factory PaymentReviewSummary([void updates(PaymentReviewSummaryBuilder b)]) = _$PaymentReviewSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PaymentReviewSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PaymentReviewSummary> get serializer => _$PaymentReviewSummarySerializer();
}

class _$PaymentReviewSummarySerializer implements PrimitiveSerializer<PaymentReviewSummary> {
  @override
  final Iterable<Type> types = const [PaymentReviewSummary, _$PaymentReviewSummary];

  @override
  final String wireName = r'PaymentReviewSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PaymentReviewSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'pending';
    yield serializers.serialize(
      object.pending,
      specifiedType: const FullType(int),
    );
    yield r'actionRequired';
    yield serializers.serialize(
      object.actionRequired,
      specifiedType: const FullType(int),
    );
    yield r'approved';
    yield serializers.serialize(
      object.approved,
      specifiedType: const FullType(int),
    );
    yield r'rejected';
    yield serializers.serialize(
      object.rejected,
      specifiedType: const FullType(int),
    );
    yield r'expired';
    yield serializers.serialize(
      object.expired,
      specifiedType: const FullType(int),
    );
    yield r'totalAmountRp';
    yield serializers.serialize(
      object.totalAmountRp,
      specifiedType: const FullType(int),
    );
    yield r'agingOver24Hours';
    yield serializers.serialize(
      object.agingOver24Hours,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PaymentReviewSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PaymentReviewSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'pending':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.pending = valueDes;
          break;
        case r'actionRequired':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.actionRequired = valueDes;
          break;
        case r'approved':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.approved = valueDes;
          break;
        case r'rejected':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.rejected = valueDes;
          break;
        case r'expired':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expired = valueDes;
          break;
        case r'totalAmountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.totalAmountRp = valueDes;
          break;
        case r'agingOver24Hours':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.agingOver24Hours = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PaymentReviewSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PaymentReviewSummaryBuilder();
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

