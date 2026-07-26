//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'finance_anomaly.g.dart';

/// FinanceAnomaly
///
/// Properties:
/// * [purchaseId] 
/// * [branchId] 
/// * [branchCode] 
/// * [amountRp] 
/// * [submittedAt] 
/// * [code] 
/// * [severity] 
/// * [href] 
@BuiltValue()
abstract class FinanceAnomaly implements Built<FinanceAnomaly, FinanceAnomalyBuilder> {
  @BuiltValueField(wireName: r'purchaseId')
  String get purchaseId;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'branchCode')
  String get branchCode;

  @BuiltValueField(wireName: r'amountRp')
  int get amountRp;

  @BuiltValueField(wireName: r'submittedAt')
  DateTime get submittedAt;

  @BuiltValueField(wireName: r'code')
  FinanceAnomalyCodeEnum get code;
  // enum codeEnum {  APPROVED_WITHOUT_LEDGER,  STALE_PENDING_PAYMENT,  PROOF_NOT_READY,  };

  @BuiltValueField(wireName: r'severity')
  FinanceAnomalySeverityEnum get severity;
  // enum severityEnum {  WARNING,  CRITICAL,  };

  @BuiltValueField(wireName: r'href')
  String get href;

  FinanceAnomaly._();

  factory FinanceAnomaly([void updates(FinanceAnomalyBuilder b)]) = _$FinanceAnomaly;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FinanceAnomalyBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FinanceAnomaly> get serializer => _$FinanceAnomalySerializer();
}

class _$FinanceAnomalySerializer implements PrimitiveSerializer<FinanceAnomaly> {
  @override
  final Iterable<Type> types = const [FinanceAnomaly, _$FinanceAnomaly];

  @override
  final String wireName = r'FinanceAnomaly';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FinanceAnomaly object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'purchaseId';
    yield serializers.serialize(
      object.purchaseId,
      specifiedType: const FullType(String),
    );
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
    yield r'amountRp';
    yield serializers.serialize(
      object.amountRp,
      specifiedType: const FullType(int),
    );
    yield r'submittedAt';
    yield serializers.serialize(
      object.submittedAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(FinanceAnomalyCodeEnum),
    );
    yield r'severity';
    yield serializers.serialize(
      object.severity,
      specifiedType: const FullType(FinanceAnomalySeverityEnum),
    );
    yield r'href';
    yield serializers.serialize(
      object.href,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    FinanceAnomaly object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FinanceAnomalyBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'purchaseId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.purchaseId = valueDes;
          break;
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
        case r'amountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.amountRp = valueDes;
          break;
        case r'submittedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.submittedAt = valueDes;
          break;
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(FinanceAnomalyCodeEnum),
          ) as FinanceAnomalyCodeEnum;
          result.code = valueDes;
          break;
        case r'severity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(FinanceAnomalySeverityEnum),
          ) as FinanceAnomalySeverityEnum;
          result.severity = valueDes;
          break;
        case r'href':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.href = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FinanceAnomaly deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FinanceAnomalyBuilder();
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

class FinanceAnomalyCodeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'APPROVED_WITHOUT_LEDGER')
  static const FinanceAnomalyCodeEnum APPROVED_WITHOUT_LEDGER = _$financeAnomalyCodeEnum_APPROVED_WITHOUT_LEDGER;
  @BuiltValueEnumConst(wireName: r'STALE_PENDING_PAYMENT')
  static const FinanceAnomalyCodeEnum STALE_PENDING_PAYMENT = _$financeAnomalyCodeEnum_STALE_PENDING_PAYMENT;
  @BuiltValueEnumConst(wireName: r'PROOF_NOT_READY')
  static const FinanceAnomalyCodeEnum PROOF_NOT_READY = _$financeAnomalyCodeEnum_PROOF_NOT_READY;

  static Serializer<FinanceAnomalyCodeEnum> get serializer => _$financeAnomalyCodeEnumSerializer;

  const FinanceAnomalyCodeEnum._(String name): super(name);

  static BuiltSet<FinanceAnomalyCodeEnum> get values => _$financeAnomalyCodeEnumValues;
  static FinanceAnomalyCodeEnum valueOf(String name) => _$financeAnomalyCodeEnumValueOf(name);
}

class FinanceAnomalySeverityEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'WARNING')
  static const FinanceAnomalySeverityEnum WARNING = _$financeAnomalySeverityEnum_WARNING;
  @BuiltValueEnumConst(wireName: r'CRITICAL')
  static const FinanceAnomalySeverityEnum CRITICAL = _$financeAnomalySeverityEnum_CRITICAL;

  static Serializer<FinanceAnomalySeverityEnum> get serializer => _$financeAnomalySeverityEnumSerializer;

  const FinanceAnomalySeverityEnum._(String name): super(name);

  static BuiltSet<FinanceAnomalySeverityEnum> get values => _$financeAnomalySeverityEnumValues;
  static FinanceAnomalySeverityEnum valueOf(String name) => _$financeAnomalySeverityEnumValueOf(name);
}

