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
/// * [startedAt] 
/// * [completedAt] 
/// * [providerCode] 
/// * [errorCode] 
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
  // enum statusEnum {  SENDING,  ACCEPTED_BY_SMTP,  FAILED_RETRYABLE,  FAILED_TERMINAL,  };

  @BuiltValueField(wireName: r'startedAt')
  DateTime get startedAt;

  @BuiltValueField(wireName: r'completedAt')
  DateTime? get completedAt;

  @BuiltValueField(wireName: r'providerCode')
  String? get providerCode;

  @BuiltValueField(wireName: r'errorCode')
  String? get errorCode;

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
    yield r'startedAt';
    yield serializers.serialize(
      object.startedAt,
      specifiedType: const FullType(DateTime),
    );
    if (object.completedAt != null) {
      yield r'completedAt';
      yield serializers.serialize(
        object.completedAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    if (object.providerCode != null) {
      yield r'providerCode';
      yield serializers.serialize(
        object.providerCode,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.errorCode != null) {
      yield r'errorCode';
      yield serializers.serialize(
        object.errorCode,
        specifiedType: const FullType.nullable(String),
      );
    }
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
        case r'startedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.startedAt = valueDes;
          break;
        case r'completedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.completedAt = valueDes;
          break;
        case r'providerCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.providerCode = valueDes;
          break;
        case r'errorCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.errorCode = valueDes;
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

  @BuiltValueEnumConst(wireName: r'SENDING')
  static const NotificationAttemptStatusEnum SENDING = _$notificationAttemptStatusEnum_SENDING;
  @BuiltValueEnumConst(wireName: r'ACCEPTED_BY_SMTP')
  static const NotificationAttemptStatusEnum ACCEPTED_BY_SMTP = _$notificationAttemptStatusEnum_ACCEPTED_BY_SMTP;
  @BuiltValueEnumConst(wireName: r'FAILED_RETRYABLE')
  static const NotificationAttemptStatusEnum FAILED_RETRYABLE = _$notificationAttemptStatusEnum_FAILED_RETRYABLE;
  @BuiltValueEnumConst(wireName: r'FAILED_TERMINAL')
  static const NotificationAttemptStatusEnum FAILED_TERMINAL = _$notificationAttemptStatusEnum_FAILED_TERMINAL;

  static Serializer<NotificationAttemptStatusEnum> get serializer => _$notificationAttemptStatusEnumSerializer;

  const NotificationAttemptStatusEnum._(String name): super(name);

  static BuiltSet<NotificationAttemptStatusEnum> get values => _$notificationAttemptStatusEnumValues;
  static NotificationAttemptStatusEnum valueOf(String name) => _$notificationAttemptStatusEnumValueOf(name);
}

