//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'notification_attempt.g.dart';

/// NotificationAttempt
///
/// Properties:
/// * [id] 
/// * [occurrenceId] 
/// * [attemptNumber] 
/// * [status] 
/// * [queuedAt] 
/// * [providerReference] 
/// * [failureCode] 
/// * [idempotentReplay] 
@BuiltValue()
abstract class NotificationAttempt implements Built<NotificationAttempt, NotificationAttemptBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'occurrenceId')
  String get occurrenceId;

  @BuiltValueField(wireName: r'attemptNumber')
  int get attemptNumber;

  @BuiltValueField(wireName: r'status')
  NotificationAttemptStatusEnum get status;
  // enum statusEnum {  QUEUED,  SENT,  DELIVERED,  FAILED,  DEAD_LETTER,  };

  @BuiltValueField(wireName: r'queuedAt')
  DateTime get queuedAt;

  @BuiltValueField(wireName: r'providerReference')
  String? get providerReference;

  @BuiltValueField(wireName: r'failureCode')
  String? get failureCode;

  @BuiltValueField(wireName: r'idempotentReplay')
  bool get idempotentReplay;

  NotificationAttempt._();

  factory NotificationAttempt([void updates(NotificationAttemptBuilder b)]) = _$NotificationAttempt;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(NotificationAttemptBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<NotificationAttempt> get serializer => _$NotificationAttemptSerializer();
}

class _$NotificationAttemptSerializer implements PrimitiveSerializer<NotificationAttempt> {
  @override
  final Iterable<Type> types = const [NotificationAttempt, _$NotificationAttempt];

  @override
  final String wireName = r'NotificationAttempt';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    NotificationAttempt object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'occurrenceId';
    yield serializers.serialize(
      object.occurrenceId,
      specifiedType: const FullType(String),
    );
    yield r'attemptNumber';
    yield serializers.serialize(
      object.attemptNumber,
      specifiedType: const FullType(int),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(NotificationAttemptStatusEnum),
    );
    yield r'queuedAt';
    yield serializers.serialize(
      object.queuedAt,
      specifiedType: const FullType(DateTime),
    );
    if (object.providerReference != null) {
      yield r'providerReference';
      yield serializers.serialize(
        object.providerReference,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.failureCode != null) {
      yield r'failureCode';
      yield serializers.serialize(
        object.failureCode,
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
    NotificationAttempt object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required NotificationAttemptBuilder result,
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
        case r'occurrenceId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.occurrenceId = valueDes;
          break;
        case r'attemptNumber':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.attemptNumber = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(NotificationAttemptStatusEnum),
          ) as NotificationAttemptStatusEnum;
          result.status = valueDes;
          break;
        case r'queuedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.queuedAt = valueDes;
          break;
        case r'providerReference':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.providerReference = valueDes;
          break;
        case r'failureCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.failureCode = valueDes;
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
  NotificationAttempt deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = NotificationAttemptBuilder();
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

class NotificationAttemptStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'QUEUED')
  static const NotificationAttemptStatusEnum QUEUED = _$notificationAttemptStatusEnum_QUEUED;
  @BuiltValueEnumConst(wireName: r'SENT')
  static const NotificationAttemptStatusEnum SENT = _$notificationAttemptStatusEnum_SENT;
  @BuiltValueEnumConst(wireName: r'DELIVERED')
  static const NotificationAttemptStatusEnum DELIVERED = _$notificationAttemptStatusEnum_DELIVERED;
  @BuiltValueEnumConst(wireName: r'FAILED')
  static const NotificationAttemptStatusEnum FAILED = _$notificationAttemptStatusEnum_FAILED;
  @BuiltValueEnumConst(wireName: r'DEAD_LETTER')
  static const NotificationAttemptStatusEnum DEAD_LETTER = _$notificationAttemptStatusEnum_DEAD_LETTER;

  static Serializer<NotificationAttemptStatusEnum> get serializer => _$notificationAttemptStatusEnumSerializer;

  const NotificationAttemptStatusEnum._(String name): super(name);

  static BuiltSet<NotificationAttemptStatusEnum> get values => _$notificationAttemptStatusEnumValues;
  static NotificationAttemptStatusEnum valueOf(String name) => _$notificationAttemptStatusEnumValueOf(name);
}

