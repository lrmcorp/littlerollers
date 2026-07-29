//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'finance_reconciliation_metric.g.dart';

/// FinanceReconciliationMetric
///
/// Properties:
/// * [expectedRp] 
/// * [receivedRp] 
/// * [approvedRp] 
/// * [pendingRp] 
/// * [rejectedRp] 
/// * [identificationAmountRp] - Three-digit transfer identification amount reported separately from package revenue.
/// * [grossSalesRp] 
/// * [packagePromotionDiscountRp] 
/// * [voucherDiscountRp] 
/// * [netSalesRp] 
/// * [voucherRedemptionCount] 
/// * [ledgerDeltaRp] 
/// * [unreconciledCount] 
@BuiltValue()
abstract class FinanceReconciliationMetric implements Built<FinanceReconciliationMetric, FinanceReconciliationMetricBuilder> {
  @BuiltValueField(wireName: r'expectedRp')
  int get expectedRp;

  @BuiltValueField(wireName: r'receivedRp')
  int get receivedRp;

  @BuiltValueField(wireName: r'approvedRp')
  int get approvedRp;

  @BuiltValueField(wireName: r'pendingRp')
  int get pendingRp;

  @BuiltValueField(wireName: r'rejectedRp')
  int get rejectedRp;

  /// Three-digit transfer identification amount reported separately from package revenue.
  @BuiltValueField(wireName: r'identificationAmountRp')
  int get identificationAmountRp;

  @BuiltValueField(wireName: r'grossSalesRp')
  int get grossSalesRp;

  @BuiltValueField(wireName: r'packagePromotionDiscountRp')
  int get packagePromotionDiscountRp;

  @BuiltValueField(wireName: r'voucherDiscountRp')
  int get voucherDiscountRp;

  @BuiltValueField(wireName: r'netSalesRp')
  int get netSalesRp;

  @BuiltValueField(wireName: r'voucherRedemptionCount')
  int get voucherRedemptionCount;

  @BuiltValueField(wireName: r'ledgerDeltaRp')
  int get ledgerDeltaRp;

  @BuiltValueField(wireName: r'unreconciledCount')
  int get unreconciledCount;

  FinanceReconciliationMetric._();

  factory FinanceReconciliationMetric([void updates(FinanceReconciliationMetricBuilder b)]) = _$FinanceReconciliationMetric;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FinanceReconciliationMetricBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FinanceReconciliationMetric> get serializer => _$FinanceReconciliationMetricSerializer();
}

class _$FinanceReconciliationMetricSerializer implements PrimitiveSerializer<FinanceReconciliationMetric> {
  @override
  final Iterable<Type> types = const [FinanceReconciliationMetric, _$FinanceReconciliationMetric];

  @override
  final String wireName = r'FinanceReconciliationMetric';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FinanceReconciliationMetric object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'expectedRp';
    yield serializers.serialize(
      object.expectedRp,
      specifiedType: const FullType(int),
    );
    yield r'receivedRp';
    yield serializers.serialize(
      object.receivedRp,
      specifiedType: const FullType(int),
    );
    yield r'approvedRp';
    yield serializers.serialize(
      object.approvedRp,
      specifiedType: const FullType(int),
    );
    yield r'pendingRp';
    yield serializers.serialize(
      object.pendingRp,
      specifiedType: const FullType(int),
    );
    yield r'rejectedRp';
    yield serializers.serialize(
      object.rejectedRp,
      specifiedType: const FullType(int),
    );
    yield r'identificationAmountRp';
    yield serializers.serialize(
      object.identificationAmountRp,
      specifiedType: const FullType(int),
    );
    yield r'grossSalesRp';
    yield serializers.serialize(
      object.grossSalesRp,
      specifiedType: const FullType(int),
    );
    yield r'packagePromotionDiscountRp';
    yield serializers.serialize(
      object.packagePromotionDiscountRp,
      specifiedType: const FullType(int),
    );
    yield r'voucherDiscountRp';
    yield serializers.serialize(
      object.voucherDiscountRp,
      specifiedType: const FullType(int),
    );
    yield r'netSalesRp';
    yield serializers.serialize(
      object.netSalesRp,
      specifiedType: const FullType(int),
    );
    yield r'voucherRedemptionCount';
    yield serializers.serialize(
      object.voucherRedemptionCount,
      specifiedType: const FullType(int),
    );
    yield r'ledgerDeltaRp';
    yield serializers.serialize(
      object.ledgerDeltaRp,
      specifiedType: const FullType(int),
    );
    yield r'unreconciledCount';
    yield serializers.serialize(
      object.unreconciledCount,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    FinanceReconciliationMetric object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FinanceReconciliationMetricBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'expectedRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedRp = valueDes;
          break;
        case r'receivedRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.receivedRp = valueDes;
          break;
        case r'approvedRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.approvedRp = valueDes;
          break;
        case r'pendingRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.pendingRp = valueDes;
          break;
        case r'rejectedRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.rejectedRp = valueDes;
          break;
        case r'identificationAmountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.identificationAmountRp = valueDes;
          break;
        case r'grossSalesRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.grossSalesRp = valueDes;
          break;
        case r'packagePromotionDiscountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.packagePromotionDiscountRp = valueDes;
          break;
        case r'voucherDiscountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.voucherDiscountRp = valueDes;
          break;
        case r'netSalesRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.netSalesRp = valueDes;
          break;
        case r'voucherRedemptionCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.voucherRedemptionCount = valueDes;
          break;
        case r'ledgerDeltaRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.ledgerDeltaRp = valueDes;
          break;
        case r'unreconciledCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.unreconciledCount = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FinanceReconciliationMetric deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FinanceReconciliationMetricBuilder();
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

