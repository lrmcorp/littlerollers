//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'operational_job.g.dart';

/// OperationalJob
///
/// Properties:
/// * [id] 
/// * [type] 
/// * [status] 
/// * [attemptCount] 
/// * [maxAttempts] 
/// * [progress] 
/// * [leaseExpiresAt] 
/// * [lastErrorCode] 
/// * [createdAt] 
/// * [version] 
@BuiltValue()
abstract class OperationalJob implements Built<OperationalJob, OperationalJobBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'type')
  String get type;

  @BuiltValueField(wireName: r'status')
  OperationalJobStatusEnum get status;
  // enum statusEnum {  QUEUED,  RUNNING,  RETRYING,  SUCCEEDED,  FAILED,  DEAD_LETTER,  };

  @BuiltValueField(wireName: r'attemptCount')
  int get attemptCount;

  @BuiltValueField(wireName: r'maxAttempts')
  int get maxAttempts;

  @BuiltValueField(wireName: r'progress')
  int get progress;

  @BuiltValueField(wireName: r'leaseExpiresAt')
  DateTime? get leaseExpiresAt;

  @BuiltValueField(wireName: r'lastErrorCode')
  String? get lastErrorCode;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'version')
  int get version;

  OperationalJob._();

  factory OperationalJob([void updates(OperationalJobBuilder b)]) = _$OperationalJob;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OperationalJobBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OperationalJob> get serializer => _$OperationalJobSerializer();
}

class _$OperationalJobSerializer implements PrimitiveSerializer<OperationalJob> {
  @override
  final Iterable<Type> types = const [OperationalJob, _$OperationalJob];

  @override
  final String wireName = r'OperationalJob';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OperationalJob object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'type';
    yield serializers.serialize(
      object.type,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(OperationalJobStatusEnum),
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
    yield r'progress';
    yield serializers.serialize(
      object.progress,
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
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    OperationalJob object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OperationalJobBuilder result,
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
        case r'type':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.type = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(OperationalJobStatusEnum),
          ) as OperationalJobStatusEnum;
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
        case r'progress':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.progress = valueDes;
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
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  OperationalJob deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OperationalJobBuilder();
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

class OperationalJobStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'QUEUED')
  static const OperationalJobStatusEnum QUEUED = _$operationalJobStatusEnum_QUEUED;
  @BuiltValueEnumConst(wireName: r'RUNNING')
  static const OperationalJobStatusEnum RUNNING = _$operationalJobStatusEnum_RUNNING;
  @BuiltValueEnumConst(wireName: r'RETRYING')
  static const OperationalJobStatusEnum RETRYING = _$operationalJobStatusEnum_RETRYING;
  @BuiltValueEnumConst(wireName: r'SUCCEEDED')
  static const OperationalJobStatusEnum SUCCEEDED = _$operationalJobStatusEnum_SUCCEEDED;
  @BuiltValueEnumConst(wireName: r'FAILED')
  static const OperationalJobStatusEnum FAILED = _$operationalJobStatusEnum_FAILED;
  @BuiltValueEnumConst(wireName: r'DEAD_LETTER')
  static const OperationalJobStatusEnum DEAD_LETTER = _$operationalJobStatusEnum_DEAD_LETTER;

  static Serializer<OperationalJobStatusEnum> get serializer => _$operationalJobStatusEnumSerializer;

  const OperationalJobStatusEnum._(String name): super(name);

  static BuiltSet<OperationalJobStatusEnum> get values => _$operationalJobStatusEnumValues;
  static OperationalJobStatusEnum valueOf(String name) => _$operationalJobStatusEnumValueOf(name);
}

