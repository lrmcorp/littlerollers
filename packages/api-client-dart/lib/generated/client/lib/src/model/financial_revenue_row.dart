//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'financial_revenue_row.g.dart';

/// FinancialRevenueRow
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
@BuiltValue()
abstract class FinancialRevenueRow implements Built<FinancialRevenueRow, FinancialRevenueRowBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'decidedAt')
  DateTime get decidedAt;

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

  FinancialRevenueRow._();

  factory FinancialRevenueRow([void updates(FinancialRevenueRowBuilder b)]) = _$FinancialRevenueRow;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FinancialRevenueRowBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FinancialRevenueRow> get serializer => _$FinancialRevenueRowSerializer();
}

class _$FinancialRevenueRowSerializer implements PrimitiveSerializer<FinancialRevenueRow> {
  @override
  final Iterable<Type> types = const [FinancialRevenueRow, _$FinancialRevenueRow];

  @override
  final String wireName = r'FinancialRevenueRow';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FinancialRevenueRow object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'decidedAt';
    yield serializers.serialize(
      object.decidedAt,
      specifiedType: const FullType(DateTime),
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
  }

  @override
  Object serialize(
    Serializers serializers,
    FinancialRevenueRow object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FinancialRevenueRowBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'decidedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.decidedAt = valueDes;
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FinancialRevenueRow deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FinancialRevenueRowBuilder();
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

