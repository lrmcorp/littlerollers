//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/money.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'financial_report.g.dart';

/// FinancialReport
///
/// Properties:
/// * [reportType] 
/// * [branchId] 
/// * [period] 
/// * [generatedAt] 
/// * [controlHash] 
/// * [totals] 
/// * [sourceVersion] 
@BuiltValue()
abstract class FinancialReport implements Built<FinancialReport, FinancialReportBuilder> {
  @BuiltValueField(wireName: r'reportType')
  FinancialReportReportTypeEnum get reportType;
  // enum reportTypeEnum {  REVENUE,  INSTRUCTOR_REALTIME,  PROJECTION,  OTHER_COST,  PROFIT,  };

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'period')
  String get period;

  @BuiltValueField(wireName: r'generatedAt')
  DateTime get generatedAt;

  @BuiltValueField(wireName: r'controlHash')
  String get controlHash;

  @BuiltValueField(wireName: r'totals')
  BuiltMap<String, Money> get totals;

  @BuiltValueField(wireName: r'sourceVersion')
  String? get sourceVersion;

  FinancialReport._();

  factory FinancialReport([void updates(FinancialReportBuilder b)]) = _$FinancialReport;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FinancialReportBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FinancialReport> get serializer => _$FinancialReportSerializer();
}

class _$FinancialReportSerializer implements PrimitiveSerializer<FinancialReport> {
  @override
  final Iterable<Type> types = const [FinancialReport, _$FinancialReport];

  @override
  final String wireName = r'FinancialReport';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FinancialReport object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'reportType';
    yield serializers.serialize(
      object.reportType,
      specifiedType: const FullType(FinancialReportReportTypeEnum),
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
    yield r'generatedAt';
    yield serializers.serialize(
      object.generatedAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'controlHash';
    yield serializers.serialize(
      object.controlHash,
      specifiedType: const FullType(String),
    );
    yield r'totals';
    yield serializers.serialize(
      object.totals,
      specifiedType: const FullType(BuiltMap, [FullType(String), FullType(Money)]),
    );
    if (object.sourceVersion != null) {
      yield r'sourceVersion';
      yield serializers.serialize(
        object.sourceVersion,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    FinancialReport object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FinancialReportBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'reportType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(FinancialReportReportTypeEnum),
          ) as FinancialReportReportTypeEnum;
          result.reportType = valueDes;
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
        case r'generatedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.generatedAt = valueDes;
          break;
        case r'controlHash':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.controlHash = valueDes;
          break;
        case r'totals':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltMap, [FullType(String), FullType(Money)]),
          ) as BuiltMap<String, Money>;
          result.totals.replace(valueDes);
          break;
        case r'sourceVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sourceVersion = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FinancialReport deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FinancialReportBuilder();
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

class FinancialReportReportTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'REVENUE')
  static const FinancialReportReportTypeEnum REVENUE = _$financialReportReportTypeEnum_REVENUE;
  @BuiltValueEnumConst(wireName: r'INSTRUCTOR_REALTIME')
  static const FinancialReportReportTypeEnum INSTRUCTOR_REALTIME = _$financialReportReportTypeEnum_INSTRUCTOR_REALTIME;
  @BuiltValueEnumConst(wireName: r'PROJECTION')
  static const FinancialReportReportTypeEnum PROJECTION = _$financialReportReportTypeEnum_PROJECTION;
  @BuiltValueEnumConst(wireName: r'OTHER_COST')
  static const FinancialReportReportTypeEnum OTHER_COST = _$financialReportReportTypeEnum_OTHER_COST;
  @BuiltValueEnumConst(wireName: r'PROFIT')
  static const FinancialReportReportTypeEnum PROFIT = _$financialReportReportTypeEnum_PROFIT;

  static Serializer<FinancialReportReportTypeEnum> get serializer => _$financialReportReportTypeEnumSerializer;

  const FinancialReportReportTypeEnum._(String name): super(name);

  static BuiltSet<FinancialReportReportTypeEnum> get values => _$financialReportReportTypeEnumValues;
  static FinancialReportReportTypeEnum valueOf(String name) => _$financialReportReportTypeEnumValueOf(name);
}

