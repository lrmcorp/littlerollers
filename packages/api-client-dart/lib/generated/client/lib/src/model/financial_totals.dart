//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/money.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'financial_totals.g.dart';

/// FinancialTotals
///
/// Properties:
/// * [grossSales] 
/// * [packagePromotionDiscount] 
/// * [voucherDiscount] 
/// * [revenue] 
/// * [projection] 
/// * [instructorRealtime] 
/// * [otherCost] 
/// * [correction] 
/// * [profit] 
@BuiltValue()
abstract class FinancialTotals implements Built<FinancialTotals, FinancialTotalsBuilder> {
  @BuiltValueField(wireName: r'grossSales')
  Money get grossSales;

  @BuiltValueField(wireName: r'packagePromotionDiscount')
  Money get packagePromotionDiscount;

  @BuiltValueField(wireName: r'voucherDiscount')
  Money get voucherDiscount;

  @BuiltValueField(wireName: r'revenue')
  Money get revenue;

  @BuiltValueField(wireName: r'projection')
  Money get projection;

  @BuiltValueField(wireName: r'instructorRealtime')
  Money get instructorRealtime;

  @BuiltValueField(wireName: r'otherCost')
  Money get otherCost;

  @BuiltValueField(wireName: r'correction')
  Money get correction;

  @BuiltValueField(wireName: r'profit')
  Money get profit;

  FinancialTotals._();

  factory FinancialTotals([void updates(FinancialTotalsBuilder b)]) = _$FinancialTotals;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FinancialTotalsBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FinancialTotals> get serializer => _$FinancialTotalsSerializer();
}

class _$FinancialTotalsSerializer implements PrimitiveSerializer<FinancialTotals> {
  @override
  final Iterable<Type> types = const [FinancialTotals, _$FinancialTotals];

  @override
  final String wireName = r'FinancialTotals';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FinancialTotals object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'grossSales';
    yield serializers.serialize(
      object.grossSales,
      specifiedType: const FullType(Money),
    );
    yield r'packagePromotionDiscount';
    yield serializers.serialize(
      object.packagePromotionDiscount,
      specifiedType: const FullType(Money),
    );
    yield r'voucherDiscount';
    yield serializers.serialize(
      object.voucherDiscount,
      specifiedType: const FullType(Money),
    );
    yield r'revenue';
    yield serializers.serialize(
      object.revenue,
      specifiedType: const FullType(Money),
    );
    yield r'projection';
    yield serializers.serialize(
      object.projection,
      specifiedType: const FullType(Money),
    );
    yield r'instructorRealtime';
    yield serializers.serialize(
      object.instructorRealtime,
      specifiedType: const FullType(Money),
    );
    yield r'otherCost';
    yield serializers.serialize(
      object.otherCost,
      specifiedType: const FullType(Money),
    );
    yield r'correction';
    yield serializers.serialize(
      object.correction,
      specifiedType: const FullType(Money),
    );
    yield r'profit';
    yield serializers.serialize(
      object.profit,
      specifiedType: const FullType(Money),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    FinancialTotals object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FinancialTotalsBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'grossSales':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Money),
          ) as Money;
          result.grossSales.replace(valueDes);
          break;
        case r'packagePromotionDiscount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Money),
          ) as Money;
          result.packagePromotionDiscount.replace(valueDes);
          break;
        case r'voucherDiscount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Money),
          ) as Money;
          result.voucherDiscount.replace(valueDes);
          break;
        case r'revenue':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Money),
          ) as Money;
          result.revenue.replace(valueDes);
          break;
        case r'projection':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Money),
          ) as Money;
          result.projection.replace(valueDes);
          break;
        case r'instructorRealtime':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Money),
          ) as Money;
          result.instructorRealtime.replace(valueDes);
          break;
        case r'otherCost':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Money),
          ) as Money;
          result.otherCost.replace(valueDes);
          break;
        case r'correction':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Money),
          ) as Money;
          result.correction.replace(valueDes);
          break;
        case r'profit':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Money),
          ) as Money;
          result.profit.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FinancialTotals deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FinancialTotalsBuilder();
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

