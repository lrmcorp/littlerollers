//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'operational_job_result.g.dart';

/// OperationalJobResult
///
/// Properties:
/// * [jobId] 
/// * [status] 
/// * [attemptCount] 
/// * [maxAttempts] 
/// * [leaseExpiresAt] 
/// * [lastErrorCode] 
/// * [idempotentReplay] 
@BuiltValue()
abstract class OperationalJobResult implements Built<OperationalJobResult, OperationalJobResultBuilder> {
  @BuiltValueField(wireName: r'jobId')
  String get jobId;

  @BuiltValueField(wireName: r'status')
  OperationalJobResultStatusEnum get status;
  // enum statusEnum {  QUEUED,  RUNNING,  RETRYING,  SUCCEEDED,  FAILED,  DEAD_LETTER,  };

  @BuiltValueField(wireName: r'attemptCount')
  int get attemptCount;

  @BuiltValueField(wireName: r'maxAttempts')
  int get maxAttempts;

  @BuiltValueField(wireName: r'leaseExpiresAt')
  DateTime? get leaseExpiresAt;

  @BuiltValueField(wireName: r'lastErrorCode')
  String? get lastErrorCode;

  @BuiltValueField(wireName: r'idempotentReplay')
  bool get idempotentReplay;

  OperationalJobResult._();

  factory OperationalJobResult([void updates(OperationalJobResultBuilder b)]) = _$OperationalJobResult;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OperationalJobResultBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OperationalJobResult> get serializer => _$OperationalJobResultSerializer();
}

class _$OperationalJobResultSerializer implements PrimitiveSerializer<OperationalJobResult> {
  @override
  final Iterable<Type> types = const [OperationalJobResult, _$OperationalJobResult];

  @override
  final String wireName = r'OperationalJobResult';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OperationalJobResult object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'jobId';
    yield serializers.serialize(
      object.jobId,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(OperationalJobResultStatusEnum),
    );
    yield r'attemptCount';
    yield serializers.serialize(
      object.attemptCount,
      specifiedType: const FullType(int),
    );
    yield r'maxAttempts';
    yield serializers.serialize(
      object.maxAttempts,
      specifiedType: const FullType(int),
    );
    if (object.leaseExpiresAt != null) {
      yield r'leaseExpiresAt';
      yield serializers.serialize(
        object.leaseExpiresAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    if (object.lastErrorCode != null) {
      yield r'lastErrorCode';
      yield serializers.serialize(
        object.lastErrorCode,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'idempotentReplay';
    yield serializers.serialize(
      object.idempotentReplay,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    OperationalJobResult object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OperationalJobResultBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'jobId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.jobId = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(OperationalJobResultStatusEnum),
          ) as OperationalJobResultStatusEnum;
          result.status = valueDes;
          break;
        case r'attemptCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.attemptCount = valueDes;
          break;
        case r'maxAttempts':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.maxAttempts = valueDes;
          break;
        case r'leaseExpiresAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.leaseExpiresAt = valueDes;
          break;
        case r'lastErrorCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.lastErrorCode = valueDes;
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
  OperationalJobResult deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OperationalJobResultBuilder();
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

class OperationalJobResultStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'QUEUED')
  static const OperationalJobResultStatusEnum QUEUED = _$operationalJobResultStatusEnum_QUEUED;
  @BuiltValueEnumConst(wireName: r'RUNNING')
  static const OperationalJobResultStatusEnum RUNNING = _$operationalJobResultStatusEnum_RUNNING;
  @BuiltValueEnumConst(wireName: r'RETRYING')
  static const OperationalJobResultStatusEnum RETRYING = _$operationalJobResultStatusEnum_RETRYING;
  @BuiltValueEnumConst(wireName: r'SUCCEEDED')
  static const OperationalJobResultStatusEnum SUCCEEDED = _$operationalJobResultStatusEnum_SUCCEEDED;
  @BuiltValueEnumConst(wireName: r'FAILED')
  static const OperationalJobResultStatusEnum FAILED = _$operationalJobResultStatusEnum_FAILED;
  @BuiltValueEnumConst(wireName: r'DEAD_LETTER')
  static const OperationalJobResultStatusEnum DEAD_LETTER = _$operationalJobResultStatusEnum_DEAD_LETTER;

  static Serializer<OperationalJobResultStatusEnum> get serializer => _$operationalJobResultStatusEnumSerializer;

  const OperationalJobResultStatusEnum._(String name): super(name);

  static BuiltSet<OperationalJobResultStatusEnum> get values => _$operationalJobResultStatusEnumValues;
  static OperationalJobResultStatusEnum valueOf(String name) => _$operationalJobResultStatusEnumValueOf(name);
}

