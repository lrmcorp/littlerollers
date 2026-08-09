//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'finance_close_snapshot.g.dart';

/// FinanceCloseSnapshot
///
/// Properties:
/// * [id] 
/// * [financePeriodId] 
/// * [branchId] 
/// * [period] 
/// * [grossSalesRp] 
/// * [packagePromotionDiscountRp] 
/// * [voucherDiscountRp] 
/// * [revenueRp] 
/// * [projectionRp] 
/// * [instructorRealtimeRp] 
/// * [otherCostRp] 
/// * [correctionRp] 
/// * [profitRp] 
/// * [sourceCutoffAt] 
/// * [sourceVersion] 
/// * [controlHash] 
/// * [createdAt] 
@BuiltValue()
abstract class FinanceCloseSnapshot implements Built<FinanceCloseSnapshot, FinanceCloseSnapshotBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'financePeriodId')
  String get financePeriodId;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'period')
  String get period;

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

  @BuiltValueField(wireName: r'sourceCutoffAt')
  DateTime get sourceCutoffAt;

  @BuiltValueField(wireName: r'sourceVersion')
  String get sourceVersion;

  @BuiltValueField(wireName: r'controlHash')
  String get controlHash;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  FinanceCloseSnapshot._();

  factory FinanceCloseSnapshot([void updates(FinanceCloseSnapshotBuilder b)]) = _$FinanceCloseSnapshot;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FinanceCloseSnapshotBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FinanceCloseSnapshot> get serializer => _$FinanceCloseSnapshotSerializer();
}

class _$FinanceCloseSnapshotSerializer implements PrimitiveSerializer<FinanceCloseSnapshot> {
  @override
  final Iterable<Type> types = const [FinanceCloseSnapshot, _$FinanceCloseSnapshot];

  @override
  final String wireName = r'FinanceCloseSnapshot';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FinanceCloseSnapshot object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'financePeriodId';
    yield serializers.serialize(
      object.financePeriodId,
      specifiedType: const FullType(String),
    );
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'period';
    yield serializers.serialize(
      object.period,
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
    yield r'sourceCutoffAt';
    yield serializers.serialize(
      object.sourceCutoffAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'sourceVersion';
    yield serializers.serialize(
      object.sourceVersion,
      specifiedType: const FullType(String),
    );
    yield r'controlHash';
    yield serializers.serialize(
      object.controlHash,
      specifiedType: const FullType(String),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    FinanceCloseSnapshot object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FinanceCloseSnapshotBuilder result,
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
        case r'financePeriodId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.financePeriodId = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'period':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.period = valueDes;
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
        case r'sourceCutoffAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.sourceCutoffAt = valueDes;
          break;
        case r'sourceVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sourceVersion = valueDes;
          break;
        case r'controlHash':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.controlHash = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FinanceCloseSnapshot deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FinanceCloseSnapshotBuilder();
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

