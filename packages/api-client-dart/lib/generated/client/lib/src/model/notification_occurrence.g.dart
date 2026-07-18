// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_occurrence.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const NotificationOccurrenceChannelEnum
_$notificationOccurrenceChannelEnum_WHATSAPP =
    const NotificationOccurrenceChannelEnum._('WHATSAPP');
const NotificationOccurrenceChannelEnum
_$notificationOccurrenceChannelEnum_IN_APP =
    const NotificationOccurrenceChannelEnum._('IN_APP');
const NotificationOccurrenceChannelEnum
_$notificationOccurrenceChannelEnum_EMAIL =
    const NotificationOccurrenceChannelEnum._('EMAIL');

NotificationOccurrenceChannelEnum _$notificationOccurrenceChannelEnumValueOf(
  String name,
) {
  switch (name) {
    case 'WHATSAPP':
      return _$notificationOccurrenceChannelEnum_WHATSAPP;
    case 'IN_APP':
      return _$notificationOccurrenceChannelEnum_IN_APP;
    case 'EMAIL':
      return _$notificationOccurrenceChannelEnum_EMAIL;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<NotificationOccurrenceChannelEnum>
_$notificationOccurrenceChannelEnumValues =
    BuiltSet<NotificationOccurrenceChannelEnum>(
      const <NotificationOccurrenceChannelEnum>[
        _$notificationOccurrenceChannelEnum_WHATSAPP,
        _$notificationOccurrenceChannelEnum_IN_APP,
        _$notificationOccurrenceChannelEnum_EMAIL,
      ],
    );

const NotificationOccurrenceStatusEnum
_$notificationOccurrenceStatusEnum_PENDING =
    const NotificationOccurrenceStatusEnum._('PENDING');
const NotificationOccurrenceStatusEnum _$notificationOccurrenceStatusEnum_SENT =
    const NotificationOccurrenceStatusEnum._('SENT');
const NotificationOccurrenceStatusEnum
_$notificationOccurrenceStatusEnum_DELIVERED =
    const NotificationOccurrenceStatusEnum._('DELIVERED');
const NotificationOccurrenceStatusEnum
_$notificationOccurrenceStatusEnum_FAILED =
    const NotificationOccurrenceStatusEnum._('FAILED');
const NotificationOccurrenceStatusEnum
_$notificationOccurrenceStatusEnum_DEAD_LETTER =
    const NotificationOccurrenceStatusEnum._('DEAD_LETTER');

NotificationOccurrenceStatusEnum _$notificationOccurrenceStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'PENDING':
      return _$notificationOccurrenceStatusEnum_PENDING;
    case 'SENT':
      return _$notificationOccurrenceStatusEnum_SENT;
    case 'DELIVERED':
      return _$notificationOccurrenceStatusEnum_DELIVERED;
    case 'FAILED':
      return _$notificationOccurrenceStatusEnum_FAILED;
    case 'DEAD_LETTER':
      return _$notificationOccurrenceStatusEnum_DEAD_LETTER;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<NotificationOccurrenceStatusEnum>
_$notificationOccurrenceStatusEnumValues =
    BuiltSet<NotificationOccurrenceStatusEnum>(
      const <NotificationOccurrenceStatusEnum>[
        _$notificationOccurrenceStatusEnum_PENDING,
        _$notificationOccurrenceStatusEnum_SENT,
        _$notificationOccurrenceStatusEnum_DELIVERED,
        _$notificationOccurrenceStatusEnum_FAILED,
        _$notificationOccurrenceStatusEnum_DEAD_LETTER,
      ],
    );

Serializer<NotificationOccurrenceChannelEnum>
_$notificationOccurrenceChannelEnumSerializer =
    _$NotificationOccurrenceChannelEnumSerializer();
Serializer<NotificationOccurrenceStatusEnum>
_$notificationOccurrenceStatusEnumSerializer =
    _$NotificationOccurrenceStatusEnumSerializer();

class _$NotificationOccurrenceChannelEnumSerializer
    implements PrimitiveSerializer<NotificationOccurrenceChannelEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'WHATSAPP': 'WHATSAPP',
    'IN_APP': 'IN_APP',
    'EMAIL': 'EMAIL',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'WHATSAPP': 'WHATSAPP',
    'IN_APP': 'IN_APP',
    'EMAIL': 'EMAIL',
  };

  @override
  final Iterable<Type> types = const <Type>[NotificationOccurrenceChannelEnum];
  @override
  final String wireName = 'NotificationOccurrenceChannelEnum';

  @override
  Object serialize(
    Serializers serializers,
    NotificationOccurrenceChannelEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  NotificationOccurrenceChannelEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => NotificationOccurrenceChannelEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$NotificationOccurrenceStatusEnumSerializer
    implements PrimitiveSerializer<NotificationOccurrenceStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PENDING': 'PENDING',
    'SENT': 'SENT',
    'DELIVERED': 'DELIVERED',
    'FAILED': 'FAILED',
    'DEAD_LETTER': 'DEAD_LETTER',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PENDING': 'PENDING',
    'SENT': 'SENT',
    'DELIVERED': 'DELIVERED',
    'FAILED': 'FAILED',
    'DEAD_LETTER': 'DEAD_LETTER',
  };

  @override
  final Iterable<Type> types = const <Type>[NotificationOccurrenceStatusEnum];
  @override
  final String wireName = 'NotificationOccurrenceStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    NotificationOccurrenceStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  NotificationOccurrenceStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => NotificationOccurrenceStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$NotificationOccurrence extends NotificationOccurrence {
  @override
  final String id;
  @override
  final String eventType;
  @override
  final String recipientType;
  @override
  final String? maskedRecipient;
  @override
  final NotificationOccurrenceChannelEnum channel;
  @override
  final NotificationOccurrenceStatusEnum status;
  @override
  final DateTime createdAt;
  @override
  final BuiltList<NotificationAttempt> attempts;

  factory _$NotificationOccurrence([
    void Function(NotificationOccurrenceBuilder)? updates,
  ]) => (NotificationOccurrenceBuilder()..update(updates))._build();

  _$NotificationOccurrence._({
    required this.id,
    required this.eventType,
    required this.recipientType,
    this.maskedRecipient,
    required this.channel,
    required this.status,
    required this.createdAt,
    required this.attempts,
  }) : super._();
  @override
  NotificationOccurrence rebuild(
    void Function(NotificationOccurrenceBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  NotificationOccurrenceBuilder toBuilder() =>
      NotificationOccurrenceBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is NotificationOccurrence &&
        id == other.id &&
        eventType == other.eventType &&
        recipientType == other.recipientType &&
        maskedRecipient == other.maskedRecipient &&
        channel == other.channel &&
        status == other.status &&
        createdAt == other.createdAt &&
        attempts == other.attempts;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, eventType.hashCode);
    _$hash = $jc(_$hash, recipientType.hashCode);
    _$hash = $jc(_$hash, maskedRecipient.hashCode);
    _$hash = $jc(_$hash, channel.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, attempts.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'NotificationOccurrence')
          ..add('id', id)
          ..add('eventType', eventType)
          ..add('recipientType', recipientType)
          ..add('maskedRecipient', maskedRecipient)
          ..add('channel', channel)
          ..add('status', status)
          ..add('createdAt', createdAt)
          ..add('attempts', attempts))
        .toString();
  }
}

class NotificationOccurrenceBuilder
    implements Builder<NotificationOccurrence, NotificationOccurrenceBuilder> {
  _$NotificationOccurrence? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _eventType;
  String? get eventType => _$this._eventType;
  set eventType(String? eventType) => _$this._eventType = eventType;

  String? _recipientType;
  String? get recipientType => _$this._recipientType;
  set recipientType(String? recipientType) =>
      _$this._recipientType = recipientType;

  String? _maskedRecipient;
  String? get maskedRecipient => _$this._maskedRecipient;
  set maskedRecipient(String? maskedRecipient) =>
      _$this._maskedRecipient = maskedRecipient;

  NotificationOccurrenceChannelEnum? _channel;
  NotificationOccurrenceChannelEnum? get channel => _$this._channel;
  set channel(NotificationOccurrenceChannelEnum? channel) =>
      _$this._channel = channel;

  NotificationOccurrenceStatusEnum? _status;
  NotificationOccurrenceStatusEnum? get status => _$this._status;
  set status(NotificationOccurrenceStatusEnum? status) =>
      _$this._status = status;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  ListBuilder<NotificationAttempt>? _attempts;
  ListBuilder<NotificationAttempt> get attempts =>
      _$this._attempts ??= ListBuilder<NotificationAttempt>();
  set attempts(ListBuilder<NotificationAttempt>? attempts) =>
      _$this._attempts = attempts;

  NotificationOccurrenceBuilder() {
    NotificationOccurrence._defaults(this);
  }

  NotificationOccurrenceBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _eventType = $v.eventType;
      _recipientType = $v.recipientType;
      _maskedRecipient = $v.maskedRecipient;
      _channel = $v.channel;
      _status = $v.status;
      _createdAt = $v.createdAt;
      _attempts = $v.attempts.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(NotificationOccurrence other) {
    _$v = other as _$NotificationOccurrence;
  }

  @override
  void update(void Function(NotificationOccurrenceBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  NotificationOccurrence build() => _build();

  _$NotificationOccurrence _build() {
    _$NotificationOccurrence _$result;
    try {
      _$result =
          _$v ??
          _$NotificationOccurrence._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'NotificationOccurrence',
              'id',
            ),
            eventType: BuiltValueNullFieldError.checkNotNull(
              eventType,
              r'NotificationOccurrence',
              'eventType',
            ),
            recipientType: BuiltValueNullFieldError.checkNotNull(
              recipientType,
              r'NotificationOccurrence',
              'recipientType',
            ),
            maskedRecipient: maskedRecipient,
            channel: BuiltValueNullFieldError.checkNotNull(
              channel,
              r'NotificationOccurrence',
              'channel',
            ),
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'NotificationOccurrence',
              'status',
            ),
            createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt,
              r'NotificationOccurrence',
              'createdAt',
            ),
            attempts: attempts.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'attempts';
        attempts.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'NotificationOccurrence',
          _$failedField,
          e.toString(),
        );
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
