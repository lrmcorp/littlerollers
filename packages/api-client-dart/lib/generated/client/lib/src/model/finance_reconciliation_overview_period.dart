//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'finance_reconciliation_overview_period.g.dart';

/// FinanceReconciliationOverviewPeriod
///
/// Properties:
/// * [from] 
/// * [until] 
@BuiltValue()
abstract class FinanceReconciliationOverviewPeriod implements Built<FinanceReconciliationOverviewPeriod, FinanceReconciliationOverviewPeriodBuilder> {
  @BuiltValueField(wireName: r'from')
  DateTime get from;

  @BuiltValueField(wireName: r'until')
  DateTime get until;

  FinanceReconciliationOverviewPeriod._();

  factory FinanceReconciliationOverviewPeriod([void updates(FinanceReconciliationOverviewPeriodBuilder b)]) = _$FinanceReconciliationOverviewPeriod;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FinanceReconciliationOverviewPeriodBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FinanceReconciliationOverviewPeriod> get serializer => _$FinanceReconciliationOverviewPeriodSerializer();
}

class _$FinanceReconciliationOverviewPeriodSerializer implements PrimitiveSerializer<FinanceReconciliationOverviewPeriod> {
  @override
  final Iterable<Type> types = const [FinanceReconciliationOverviewPeriod, _$FinanceReconciliationOverviewPeriod];

  @override
  final String wireName = r'FinanceReconciliationOverviewPeriod';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FinanceReconciliationOverviewPeriod object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'from';
    yield serializers.serialize(
      object.from,
      specifiedType: const FullType(DateTime),
    );
    yield r'until';
    yield serializers.serialize(
      object.until,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    FinanceReconciliationOverviewPeriod object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FinanceReconciliationOverviewPeriodBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'from':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.from = valueDes;
          break;
        case r'until':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.until = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FinanceReconciliationOverviewPeriod deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FinanceReconciliationOverviewPeriodBuilder();
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

