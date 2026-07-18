//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/notification_attempt.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'notification_occurrence.g.dart';

/// NotificationOccurrence
///
/// Properties:
/// * [id] 
/// * [eventType] 
/// * [recipientType] 
/// * [maskedRecipient] 
/// * [channel] 
/// * [status] 
/// * [createdAt] 
/// * [attempts] 
@BuiltValue()
abstract class NotificationOccurrence implements Built<NotificationOccurrence, NotificationOccurrenceBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'eventType')
  String get eventType;

  @BuiltValueField(wireName: r'recipientType')
  String get recipientType;

  @BuiltValueField(wireName: r'maskedRecipient')
  String? get maskedRecipient;

  @BuiltValueField(wireName: r'channel')
  NotificationOccurrenceChannelEnum get channel;
  // enum channelEnum {  WHATSAPP,  IN_APP,  EMAIL,  };

  @BuiltValueField(wireName: r'status')
  NotificationOccurrenceStatusEnum get status;
  // enum statusEnum {  PENDING,  SENT,  DELIVERED,  FAILED,  DEAD_LETTER,  };

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'attempts')
  BuiltList<NotificationAttempt> get attempts;

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
    yield r'recipientType';
    yield serializers.serialize(
      object.recipientType,
      specifiedType: const FullType(String),
    );
    if (object.maskedRecipient != null) {
      yield r'maskedRecipient';
      yield serializers.serialize(
        object.maskedRecipient,
        specifiedType: const FullType(String),
      );
    }
    yield r'channel';
    yield serializers.serialize(
      object.channel,
      specifiedType: const FullType(NotificationOccurrenceChannelEnum),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(NotificationOccurrenceStatusEnum),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'attempts';
    yield serializers.serialize(
      object.attempts,
      specifiedType: const FullType(BuiltList, [FullType(NotificationAttempt)]),
    );
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
        case r'recipientType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.recipientType = valueDes;
          break;
        case r'maskedRecipient':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.maskedRecipient = valueDes;
          break;
        case r'channel':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(NotificationOccurrenceChannelEnum),
          ) as NotificationOccurrenceChannelEnum;
          result.channel = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(NotificationOccurrenceStatusEnum),
          ) as NotificationOccurrenceStatusEnum;
          result.status = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        case r'attempts':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(NotificationAttempt)]),
          ) as BuiltList<NotificationAttempt>;
          result.attempts.replace(valueDes);
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

class NotificationOccurrenceChannelEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'WHATSAPP')
  static const NotificationOccurrenceChannelEnum WHATSAPP = _$notificationOccurrenceChannelEnum_WHATSAPP;
  @BuiltValueEnumConst(wireName: r'IN_APP')
  static const NotificationOccurrenceChannelEnum IN_APP = _$notificationOccurrenceChannelEnum_IN_APP;
  @BuiltValueEnumConst(wireName: r'EMAIL')
  static const NotificationOccurrenceChannelEnum EMAIL = _$notificationOccurrenceChannelEnum_EMAIL;

  static Serializer<NotificationOccurrenceChannelEnum> get serializer => _$notificationOccurrenceChannelEnumSerializer;

  const NotificationOccurrenceChannelEnum._(String name): super(name);

  static BuiltSet<NotificationOccurrenceChannelEnum> get values => _$notificationOccurrenceChannelEnumValues;
  static NotificationOccurrenceChannelEnum valueOf(String name) => _$notificationOccurrenceChannelEnumValueOf(name);
}

class NotificationOccurrenceStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING')
  static const NotificationOccurrenceStatusEnum PENDING = _$notificationOccurrenceStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'SENT')
  static const NotificationOccurrenceStatusEnum SENT = _$notificationOccurrenceStatusEnum_SENT;
  @BuiltValueEnumConst(wireName: r'DELIVERED')
  static const NotificationOccurrenceStatusEnum DELIVERED = _$notificationOccurrenceStatusEnum_DELIVERED;
  @BuiltValueEnumConst(wireName: r'FAILED')
  static const NotificationOccurrenceStatusEnum FAILED = _$notificationOccurrenceStatusEnum_FAILED;
  @BuiltValueEnumConst(wireName: r'DEAD_LETTER')
  static const NotificationOccurrenceStatusEnum DEAD_LETTER = _$notificationOccurrenceStatusEnum_DEAD_LETTER;

  static Serializer<NotificationOccurrenceStatusEnum> get serializer => _$notificationOccurrenceStatusEnumSerializer;

  const NotificationOccurrenceStatusEnum._(String name): super(name);

  static BuiltSet<NotificationOccurrenceStatusEnum> get values => _$notificationOccurrenceStatusEnumValues;
  static NotificationOccurrenceStatusEnum valueOf(String name) => _$notificationOccurrenceStatusEnumValueOf(name);
}

