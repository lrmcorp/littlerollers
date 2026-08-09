//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'financial_branch_profit_row.g.dart';

/// FinancialBranchProfitRow
///
/// Properties:
/// * [branchId] 
/// * [branchCode] 
/// * [branchName] 
/// * [grossSalesRp] 
/// * [packagePromotionDiscountRp] 
/// * [voucherDiscountRp] 
/// * [revenueRp] 
/// * [projectionRp] 
/// * [instructorRealtimeRp] 
/// * [otherCostRp] 
/// * [correctionRp] 
/// * [profitRp] 
@BuiltValue()
abstract class FinancialBranchProfitRow implements Built<FinancialBranchProfitRow, FinancialBranchProfitRowBuilder> {
  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'branchCode')
  String get branchCode;

  @BuiltValueField(wireName: r'branchName')
  String get branchName;

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

  FinancialBranchProfitRow._();

  factory FinancialBranchProfitRow([void updates(FinancialBranchProfitRowBuilder b)]) = _$FinancialBranchProfitRow;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FinancialBranchProfitRowBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FinancialBranchProfitRow> get serializer => _$FinancialBranchProfitRowSerializer();
}

class _$FinancialBranchProfitRowSerializer implements PrimitiveSerializer<FinancialBranchProfitRow> {
  @override
  final Iterable<Type> types = const [FinancialBranchProfitRow, _$FinancialBranchProfitRow];

  @override
  final String wireName = r'FinancialBranchProfitRow';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FinancialBranchProfitRow object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'branchCode';
    yield serializers.serialize(
      object.branchCode,
      specifiedType: const FullType(String),
    );
    yield r'branchName';
    yield serializers.serialize(
      object.branchName,
      specifiedType: const FullType(String),
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
  }

  @override
  Object serialize(
    Serializers serializers,
    FinancialBranchProfitRow object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FinancialBranchProfitRowBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'branchCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchCode = valueDes;
          break;
        case r'branchName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchName = valueDes;
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FinancialBranchProfitRow deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FinancialBranchProfitRowBuilder();
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

