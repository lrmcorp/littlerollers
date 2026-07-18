//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'quota_evaluation_result.g.dart';

/// QuotaEvaluationResult
///
/// Properties:
/// * [classSlotId] 
/// * [previousStatus] 
/// * [status] 
/// * [bookingCount] 
/// * [minimumQuota] 
/// * [releasedReservationIds] 
/// * [outboxEventIds] 
/// * [evaluatedAt] 
/// * [idempotentReplay] 
@BuiltValue()
abstract class QuotaEvaluationResult implements Built<QuotaEvaluationResult, QuotaEvaluationResultBuilder> {
  @BuiltValueField(wireName: r'classSlotId')
  String get classSlotId;

  @BuiltValueField(wireName: r'previousStatus')
  String get previousStatus;

  @BuiltValueField(wireName: r'status')
  QuotaEvaluationResultStatusEnum get status;
  // enum statusEnum {  CONFIRMED,  AUTO_CANCELLED,  };

  @BuiltValueField(wireName: r'bookingCount')
  int get bookingCount;

  @BuiltValueField(wireName: r'minimumQuota')
  int get minimumQuota;

  @BuiltValueField(wireName: r'releasedReservationIds')
  BuiltList<String>? get releasedReservationIds;

  @BuiltValueField(wireName: r'outboxEventIds')
  BuiltList<String>? get outboxEventIds;

  @BuiltValueField(wireName: r'evaluatedAt')
  DateTime get evaluatedAt;

  @BuiltValueField(wireName: r'idempotentReplay')
  bool get idempotentReplay;

  QuotaEvaluationResult._();

  factory QuotaEvaluationResult([void updates(QuotaEvaluationResultBuilder b)]) = _$QuotaEvaluationResult;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(QuotaEvaluationResultBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<QuotaEvaluationResult> get serializer => _$QuotaEvaluationResultSerializer();
}

class _$QuotaEvaluationResultSerializer implements PrimitiveSerializer<QuotaEvaluationResult> {
  @override
  final Iterable<Type> types = const [QuotaEvaluationResult, _$QuotaEvaluationResult];

  @override
  final String wireName = r'QuotaEvaluationResult';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    QuotaEvaluationResult object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'classSlotId';
    yield serializers.serialize(
      object.classSlotId,
      specifiedType: const FullType(String),
    );
    yield r'previousStatus';
    yield serializers.serialize(
      object.previousStatus,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(QuotaEvaluationResultStatusEnum),
    );
    yield r'bookingCount';
    yield serializers.serialize(
      object.bookingCount,
      specifiedType: const FullType(int),
    );
    yield r'minimumQuota';
    yield serializers.serialize(
      object.minimumQuota,
      specifiedType: const FullType(int),
    );
    if (object.releasedReservationIds != null) {
      yield r'releasedReservationIds';
      yield serializers.serialize(
        object.releasedReservationIds,
        specifiedType: const FullType(BuiltList, [FullType(String)]),
      );
    }
    if (object.outboxEventIds != null) {
      yield r'outboxEventIds';
      yield serializers.serialize(
        object.outboxEventIds,
        specifiedType: const FullType(BuiltList, [FullType(String)]),
      );
    }
    yield r'evaluatedAt';
    yield serializers.serialize(
      object.evaluatedAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'idempotentReplay';
    yield serializers.serialize(
      object.idempotentReplay,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    QuotaEvaluationResult object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required QuotaEvaluationResultBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'classSlotId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classSlotId = valueDes;
          break;
        case r'previousStatus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.previousStatus = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(QuotaEvaluationResultStatusEnum),
          ) as QuotaEvaluationResultStatusEnum;
          result.status = valueDes;
          break;
        case r'bookingCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.bookingCount = valueDes;
          break;
        case r'minimumQuota':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.minimumQuota = valueDes;
          break;
        case r'releasedReservationIds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.releasedReservationIds.replace(valueDes);
          break;
        case r'outboxEventIds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.outboxEventIds.replace(valueDes);
          break;
        case r'evaluatedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.evaluatedAt = valueDes;
          break;
        case r'idempotentReplay':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.idempotentReplay = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  QuotaEvaluationResult deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = QuotaEvaluationResultBuilder();
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

class QuotaEvaluationResultStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'CONFIRMED')
  static const QuotaEvaluationResultStatusEnum CONFIRMED = _$quotaEvaluationResultStatusEnum_CONFIRMED;
  @BuiltValueEnumConst(wireName: r'AUTO_CANCELLED')
  static const QuotaEvaluationResultStatusEnum AUTO_CANCELLED = _$quotaEvaluationResultStatusEnum_AUTO_CANCELLED;

  static Serializer<QuotaEvaluationResultStatusEnum> get serializer => _$quotaEvaluationResultStatusEnumSerializer;

  const QuotaEvaluationResultStatusEnum._(String name): super(name);

  static BuiltSet<QuotaEvaluationResultStatusEnum> get values => _$quotaEvaluationResultStatusEnumValues;
  static QuotaEvaluationResultStatusEnum valueOf(String name) => _$quotaEvaluationResultStatusEnumValueOf(name);
}

