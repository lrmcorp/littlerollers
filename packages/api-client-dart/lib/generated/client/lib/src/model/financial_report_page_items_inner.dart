//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/money.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/financial_revenue_row.dart';
import 'package:openapi/src/model/financial_projection_row.dart';
import 'package:openapi/src/model/financial_branch_profit_row.dart';
import 'package:openapi/src/model/instructor_compensation_row.dart';
import 'package:openapi/src/model/date.dart';
import 'package:openapi/src/model/other_cost.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';
import 'package:one_of/any_of.dart';

part 'financial_report_page_items_inner.g.dart';

/// FinancialReportPageItemsInner
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [decidedAt] 
/// * [grossSalesRp] 
/// * [packagePromotionDiscountRp] 
/// * [voucherDiscountRp] 
/// * [revenueRp] 
/// * [projectionRp] 
/// * [instructorUserId] 
/// * [matchedClassCount] 
/// * [feeRpSnapshot] 
/// * [amountRp] 
/// * [period] 
/// * [occurredOn] 
/// * [categoryCode] 
/// * [description] 
/// * [reason] 
/// * [amount] 
/// * [evidenceUploadId] 
/// * [status] 
/// * [version] 
/// * [branchCode] 
/// * [branchName] 
/// * [instructorRealtimeRp] 
/// * [otherCostRp] 
/// * [correctionRp] 
/// * [profitRp] 
@BuiltValue()
abstract class FinancialReportPageItemsInner implements Built<FinancialReportPageItemsInner, FinancialReportPageItemsInnerBuilder> {
  /// Any Of [FinancialBranchProfitRow], [FinancialProjectionRow], [FinancialRevenueRow], [InstructorCompensationRow], [OtherCost]
  AnyOf get anyOf;

  FinancialReportPageItemsInner._();

  factory FinancialReportPageItemsInner([void updates(FinancialReportPageItemsInnerBuilder b)]) = _$FinancialReportPageItemsInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FinancialReportPageItemsInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FinancialReportPageItemsInner> get serializer => _$FinancialReportPageItemsInnerSerializer();
}

class _$FinancialReportPageItemsInnerSerializer implements PrimitiveSerializer<FinancialReportPageItemsInner> {
  @override
  final Iterable<Type> types = const [FinancialReportPageItemsInner, _$FinancialReportPageItemsInner];

  @override
  final String wireName = r'FinancialReportPageItemsInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FinancialReportPageItemsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
  }

  @override
  Object serialize(
    Serializers serializers,
    FinancialReportPageItemsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final anyOf = object.anyOf;
    return serializers.serialize(anyOf, specifiedType: FullType(AnyOf, anyOf.valueTypes.map((type) => FullType(type)).toList()))!;
  }

  @override
  FinancialReportPageItemsInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FinancialReportPageItemsInnerBuilder();
    Object? anyOfDataSrc;
    final targetType = const FullType(AnyOf, [FullType(FinancialRevenueRow), FullType(FinancialProjectionRow), FullType(InstructorCompensationRow), FullType(OtherCost), FullType(FinancialBranchProfitRow), ]);
    anyOfDataSrc = serialized;
    result.anyOf = serializers.deserialize(anyOfDataSrc, specifiedType: targetType) as AnyOf;
    return result.build();
  }
}

class FinancialReportPageItemsInnerStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const FinancialReportPageItemsInnerStatusEnum ACTIVE = _$financialReportPageItemsInnerStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'REVERSED')
  static const FinancialReportPageItemsInnerStatusEnum REVERSED = _$financialReportPageItemsInnerStatusEnum_REVERSED;

  static Serializer<FinancialReportPageItemsInnerStatusEnum> get serializer => _$financialReportPageItemsInnerStatusEnumSerializer;

  const FinancialReportPageItemsInnerStatusEnum._(String name): super(name);

  static BuiltSet<FinancialReportPageItemsInnerStatusEnum> get values => _$financialReportPageItemsInnerStatusEnumValues;
  static FinancialReportPageItemsInnerStatusEnum valueOf(String name) => _$financialReportPageItemsInnerStatusEnumValueOf(name);
}

