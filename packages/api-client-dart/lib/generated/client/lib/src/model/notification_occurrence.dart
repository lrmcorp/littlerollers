//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/notification_attempt.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'notification_occurrence.g.dart';

/// NotificationOccurrence
///
/// Properties:
/// * [id] 
/// * [eventType] 
/// * [templateKey] 
/// * [recipientMasked] 
/// * [channel] 
/// * [status] 
/// * [attemptCount] 
/// * [rateLimitWaitCount] 
/// * [maxAttempts] 
/// * [nextAttemptAt] 
/// * [lastErrorCode] 
/// * [correlationId] 
/// * [createdAt] 
/// * [acceptedAt] 
/// * [lastAttempt] 
@BuiltValue()
abstract class NotificationOccurrence implements Built<NotificationOccurrence, NotificationOccurrenceBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'eventType')
  String get eventType;

  @BuiltValueField(wireName: r'templateKey')
  String get templateKey;

  @BuiltValueField(wireName: r'recipientMasked')
  String get recipientMasked;

  @BuiltValueField(wireName: r'channel')
  JsonObject? get channel;

  @BuiltValueField(wireName: r'status')
  NotificationOccurrenceStatusEnum get status;
  // enum statusEnum {  PENDING,  SENDING,  ACCEPTED_BY_SMTP,  FAILED_RETRYABLE,  FAILED_TERMINAL,  EXPIRED,  FALLBACK_IN_APP,  };

  @BuiltValueField(wireName: r'attemptCount')
  int get attemptCount;

  @BuiltValueField(wireName: r'rateLimitWaitCount')
  int get rateLimitWaitCount;

  @BuiltValueField(wireName: r'maxAttempts')
  int get maxAttempts;

  @BuiltValueField(wireName: r'nextAttemptAt')
  DateTime? get nextAttemptAt;

  @BuiltValueField(wireName: r'lastErrorCode')
  String? get lastErrorCode;

  @BuiltValueField(wireName: r'correlationId')
  String get correlationId;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'acceptedAt')
  DateTime? get acceptedAt;

  @BuiltValueField(wireName: r'lastAttempt')
  NotificationAttempt? get lastAttempt;

  NotificationOccurrence._();

  factory NotificationOccurrence([void updates(NotificationOccurrenceBuilder b)]) = _$NotificationOccurrence;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(NotificationOccurrenceBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<NotificationOccurrence> get serializer => _$NotificationOccurrenceSerializer();
}

class _$NotificationOccurrenceSerializer implements PrimitiveSerializer<NotificationOccurrence> {
  @override
  final Iterable<Type> types = const [NotificationOccurrence, _$NotificationOccurrence];

  @override
  final String wireName = r'NotificationOccurrence';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    NotificationOccurrence object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'eventType';
    yield serializers.serialize(
      object.eventType,
      specifiedType: const FullType(String),
    );
    yield r'templateKey';
    yield serializers.serialize(
      object.templateKey,
      specifiedType: const FullType(String),
    );
    yield r'recipientMasked';
    yield serializers.serialize(
      object.recipientMasked,
      specifiedType: const FullType(String),
    );
    yield r'channel';
    yield object.channel == null ? null : serializers.serialize(
      object.channel,
      specifiedType: const FullType.nullable(JsonObject),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(NotificationOccurrenceStatusEnum),
    );
    yield r'attemptCount';
    yield serializers.serialize(
      object.attemptCount,
      specifiedType: const FullType(int),
    );
    yield r'rateLimitWaitCount';
    yield serializers.serialize(
      object.rateLimitWaitCount,
      specifiedType: const FullType(int),
    );
    yield r'maxAttempts';
    yield serializers.serialize(
      object.maxAttempts,
      specifiedType: const FullType(int),
    );
    if (object.nextAttemptAt != null) {
      yield r'nextAttemptAt';
      yield serializers.serialize(
        object.nextAttemptAt,
        specifiedType: const FullType(DateTime),
      );
    }
    if (object.lastErrorCode != null) {
      yield r'lastErrorCode';
      yield serializers.serialize(
        object.lastErrorCode,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'correlationId';
    yield serializers.serialize(
      object.correlationId,
      specifiedType: const FullType(String),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
    if (object.acceptedAt != null) {
      yield r'acceptedAt';
      yield serializers.serialize(
        object.acceptedAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    if (object.lastAttempt != null) {
      yield r'lastAttempt';
      yield serializers.serialize(
        object.lastAttempt,
        specifiedType: const FullType.nullable(NotificationAttempt),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    NotificationOccurrence object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required NotificationOccurrenceBuilder result,
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
        case r'eventType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.eventType = valueDes;
          break;
        case r'templateKey':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.templateKey = valueDes;
          break;
        case r'recipientMasked':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.recipientMasked = valueDes;
          break;
        case r'channel':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(JsonObject),
          ) as JsonObject?;
          if (valueDes == null) continue;
          result.channel = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(NotificationOccurrenceStatusEnum),
          ) as NotificationOccurrenceStatusEnum;
          result.status = valueDes;
          break;
        case r'attemptCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.attemptCount = valueDes;
          break;
        case r'rateLimitWaitCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.rateLimitWaitCount = valueDes;
          break;
        case r'maxAttempts':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.maxAttempts = valueDes;
          break;
        case r'nextAttemptAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.nextAttemptAt = valueDes;
          break;
        case r'lastErrorCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.lastErrorCode = valueDes;
          break;
        case r'correlationId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.correlationId = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        case r'acceptedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.acceptedAt = valueDes;
          break;
        case r'lastAttempt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(NotificationAttempt),
          ) as NotificationAttempt?;
          if (valueDes == null) continue;
          result.lastAttempt.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  NotificationOccurrence deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = NotificationOccurrenceBuilder();
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

class NotificationOccurrenceStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING')
  static const NotificationOccurrenceStatusEnum PENDING = _$notificationOccurrenceStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'SENDING')
  static const NotificationOccurrenceStatusEnum SENDING = _$notificationOccurrenceStatusEnum_SENDING;
  @BuiltValueEnumConst(wireName: r'ACCEPTED_BY_SMTP')
  static const NotificationOccurrenceStatusEnum ACCEPTED_BY_SMTP = _$notificationOccurrenceStatusEnum_ACCEPTED_BY_SMTP;
  @BuiltValueEnumConst(wireName: r'FAILED_RETRYABLE')
  static const NotificationOccurrenceStatusEnum FAILED_RETRYABLE = _$notificationOccurrenceStatusEnum_FAILED_RETRYABLE;
  @BuiltValueEnumConst(wireName: r'FAILED_TERMINAL')
  static const NotificationOccurrenceStatusEnum FAILED_TERMINAL = _$notificationOccurrenceStatusEnum_FAILED_TERMINAL;
  @BuiltValueEnumConst(wireName: r'EXPIRED')
  static const NotificationOccurrenceStatusEnum EXPIRED = _$notificationOccurrenceStatusEnum_EXPIRED;
  @BuiltValueEnumConst(wireName: r'FALLBACK_IN_APP')
  static const NotificationOccurrenceStatusEnum FALLBACK_IN_APP = _$notificationOccurrenceStatusEnum_FALLBACK_IN_APP;

  static Serializer<NotificationOccurrenceStatusEnum> get serializer => _$notificationOccurrenceStatusEnumSerializer;

  const NotificationOccurrenceStatusEnum._(String name): super(name);

  static BuiltSet<NotificationOccurrenceStatusEnum> get values => _$notificationOccurrenceStatusEnumValues;
  static NotificationOccurrenceStatusEnum valueOf(String name) => _$notificationOccurrenceStatusEnumValueOf(name);
}

