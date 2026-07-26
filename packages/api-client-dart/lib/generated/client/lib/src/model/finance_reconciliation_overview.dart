//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/finance_reconciliation_overview_period.dart';
import 'package:openapi/src/model/finance_branch_reconciliation.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/finance_reconciliation_metric.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'finance_reconciliation_overview.g.dart';

/// FinanceReconciliationOverview
///
/// Properties:
/// * [generatedAt] 
/// * [period] 
/// * [metrics] 
/// * [branches] 
@BuiltValue()
abstract class FinanceReconciliationOverview implements Built<FinanceReconciliationOverview, FinanceReconciliationOverviewBuilder> {
  @BuiltValueField(wireName: r'generatedAt')
  DateTime get generatedAt;

  @BuiltValueField(wireName: r'period')
  FinanceReconciliationOverviewPeriod get period;

  @BuiltValueField(wireName: r'metrics')
  FinanceReconciliationMetric get metrics;

  @BuiltValueField(wireName: r'branches')
  BuiltList<FinanceBranchReconciliation> get branches;

  FinanceReconciliationOverview._();

  factory FinanceReconciliationOverview([void updates(FinanceReconciliationOverviewBuilder b)]) = _$FinanceReconciliationOverview;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FinanceReconciliationOverviewBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FinanceReconciliationOverview> get serializer => _$FinanceReconciliationOverviewSerializer();
}

class _$FinanceReconciliationOverviewSerializer implements PrimitiveSerializer<FinanceReconciliationOverview> {
  @override
  final Iterable<Type> types = const [FinanceReconciliationOverview, _$FinanceReconciliationOverview];

  @override
  final String wireName = r'FinanceReconciliationOverview';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FinanceReconciliationOverview object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'generatedAt';
    yield serializers.serialize(
      object.generatedAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'period';
    yield serializers.serialize(
      object.period,
      specifiedType: const FullType(FinanceReconciliationOverviewPeriod),
    );
    yield r'metrics';
    yield serializers.serialize(
      object.metrics,
      specifiedType: const FullType(FinanceReconciliationMetric),
    );
    yield r'branches';
    yield serializers.serialize(
      object.branches,
      specifiedType: const FullType(BuiltList, [FullType(FinanceBranchReconciliation)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    FinanceReconciliationOverview object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FinanceReconciliationOverviewBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'generatedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.generatedAt = valueDes;
          break;
        case r'period':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(FinanceReconciliationOverviewPeriod),
          ) as FinanceReconciliationOverviewPeriod;
          result.period.replace(valueDes);
          break;
        case r'metrics':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(FinanceReconciliationMetric),
          ) as FinanceReconciliationMetric;
          result.metrics.replace(valueDes);
          break;
        case r'branches':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(FinanceBranchReconciliation)]),
          ) as BuiltList<FinanceBranchReconciliation>;
          result.branches.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FinanceReconciliationOverview deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FinanceReconciliationOverviewBuilder();
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

