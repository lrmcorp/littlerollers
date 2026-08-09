//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'dashboard_financial_summary.g.dart';

/// DashboardFinancialSummary
///
/// Properties:
/// * [grossSalesRp] 
/// * [packagePromotionDiscountRp] 
/// * [voucherDiscountRp] 
/// * [revenueRp] 
/// * [projectionRp] 
/// * [instructorRealtimeRp] 
/// * [otherCostRp] 
/// * [correctionRp] 
/// * [profitRp] 
/// * [completeness] 
/// * [anomalyCount] 
/// * [sourceCutoffAt] 
/// * [controlHash] 
@BuiltValue()
abstract class DashboardFinancialSummary implements Built<DashboardFinancialSummary, DashboardFinancialSummaryBuilder> {
  @BuiltValueField(wireName: r'grossSalesRp')
  int get grossSalesRp;

  @BuiltValueField(wireName: r'packagePromotionDiscountRp')
  int get packagePromotionDiscountRp;

  @BuiltValueField(wireName: r'voucherDiscountRp')
  int get voucherDiscountRp;

  @BuiltValueField(wireName: r'revenueRp')
  int get revenueRp;

  @BuiltValueField(wireName: r'projectionRp')
  int get projectionRp;

  @BuiltValueField(wireName: r'instructorRealtimeRp')
  int get instructorRealtimeRp;

  @BuiltValueField(wireName: r'otherCostRp')
  int get otherCostRp;

  @BuiltValueField(wireName: r'correctionRp')
  int get correctionRp;

  @BuiltValueField(wireName: r'profitRp')
  int get profitRp;

  @BuiltValueField(wireName: r'completeness')
  DashboardFinancialSummaryCompletenessEnum get completeness;
  // enum completenessEnum {  COMPLETE,  INCOMPLETE,  };

  @BuiltValueField(wireName: r'anomalyCount')
  int get anomalyCount;

  @BuiltValueField(wireName: r'sourceCutoffAt')
  DateTime get sourceCutoffAt;

  @BuiltValueField(wireName: r'controlHash')
  String get controlHash;

  DashboardFinancialSummary._();

  factory DashboardFinancialSummary([void updates(DashboardFinancialSummaryBuilder b)]) = _$DashboardFinancialSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DashboardFinancialSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DashboardFinancialSummary> get serializer => _$DashboardFinancialSummarySerializer();
}

class _$DashboardFinancialSummarySerializer implements PrimitiveSerializer<DashboardFinancialSummary> {
  @override
  final Iterable<Type> types = const [DashboardFinancialSummary, _$DashboardFinancialSummary];

  @override
  final String wireName = r'DashboardFinancialSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DashboardFinancialSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
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
    yield r'revenueRp';
    yield serializers.serialize(
      object.revenueRp,
      specifiedType: const FullType(int),
    );
    yield r'projectionRp';
    yield serializers.serialize(
      object.projectionRp,
      specifiedType: const FullType(int),
    );
    yield r'instructorRealtimeRp';
    yield serializers.serialize(
      object.instructorRealtimeRp,
      specifiedType: const FullType(int),
    );
    yield r'otherCostRp';
    yield serializers.serialize(
      object.otherCostRp,
      specifiedType: const FullType(int),
    );
    yield r'correctionRp';
    yield serializers.serialize(
      object.correctionRp,
      specifiedType: const FullType(int),
    );
    yield r'profitRp';
    yield serializers.serialize(
      object.profitRp,
      specifiedType: const FullType(int),
    );
    yield r'completeness';
    yield serializers.serialize(
      object.completeness,
      specifiedType: const FullType(DashboardFinancialSummaryCompletenessEnum),
    );
    yield r'anomalyCount';
    yield serializers.serialize(
      object.anomalyCount,
      specifiedType: const FullType(int),
    );
    yield r'sourceCutoffAt';
    yield serializers.serialize(
      object.sourceCutoffAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'controlHash';
    yield serializers.serialize(
      object.controlHash,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    DashboardFinancialSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DashboardFinancialSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
        case r'revenueRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.revenueRp = valueDes;
          break;
        case r'projectionRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.projectionRp = valueDes;
          break;
        case r'instructorRealtimeRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.instructorRealtimeRp = valueDes;
          break;
        case r'otherCostRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.otherCostRp = valueDes;
          break;
        case r'correctionRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.correctionRp = valueDes;
          break;
        case r'profitRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.profitRp = valueDes;
          break;
        case r'completeness':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DashboardFinancialSummaryCompletenessEnum),
          ) as DashboardFinancialSummaryCompletenessEnum;
          result.completeness = valueDes;
          break;
        case r'anomalyCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.anomalyCount = valueDes;
          break;
        case r'sourceCutoffAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.sourceCutoffAt = valueDes;
          break;
        case r'controlHash':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.controlHash = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  DashboardFinancialSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DashboardFinancialSummaryBuilder();
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

class DashboardFinancialSummaryCompletenessEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'COMPLETE')
  static const DashboardFinancialSummaryCompletenessEnum COMPLETE = _$dashboardFinancialSummaryCompletenessEnum_COMPLETE;
  @BuiltValueEnumConst(wireName: r'INCOMPLETE')
  static const DashboardFinancialSummaryCompletenessEnum INCOMPLETE = _$dashboardFinancialSummaryCompletenessEnum_INCOMPLETE;

  static Serializer<DashboardFinancialSummaryCompletenessEnum> get serializer => _$dashboardFinancialSummaryCompletenessEnumSerializer;

  const DashboardFinancialSummaryCompletenessEnum._(String name): super(name);

  static BuiltSet<DashboardFinancialSummaryCompletenessEnum> get values => _$dashboardFinancialSummaryCompletenessEnumValues;
  static DashboardFinancialSummaryCompletenessEnum valueOf(String name) => _$dashboardFinancialSummaryCompletenessEnumValueOf(name);
}

