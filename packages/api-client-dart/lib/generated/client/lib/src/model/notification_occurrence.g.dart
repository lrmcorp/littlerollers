// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_occurrence.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const NotificationOccurrenceStatusEnum
_$notificationOccurrenceStatusEnum_PENDING =
    const NotificationOccurrenceStatusEnum._('PENDING');
const NotificationOccurrenceStatusEnum
_$notificationOccurrenceStatusEnum_SENDING =
    const NotificationOccurrenceStatusEnum._('SENDING');
const NotificationOccurrenceStatusEnum
_$notificationOccurrenceStatusEnum_ACCEPTED_BY_SMTP =
    const NotificationOccurrenceStatusEnum._('ACCEPTED_BY_SMTP');
const NotificationOccurrenceStatusEnum
_$notificationOccurrenceStatusEnum_FAILED_RETRYABLE =
    const NotificationOccurrenceStatusEnum._('FAILED_RETRYABLE');
const NotificationOccurrenceStatusEnum
_$notificationOccurrenceStatusEnum_FAILED_TERMINAL =
    const NotificationOccurrenceStatusEnum._('FAILED_TERMINAL');
const NotificationOccurrenceStatusEnum
_$notificationOccurrenceStatusEnum_EXPIRED =
    const NotificationOccurrenceStatusEnum._('EXPIRED');
const NotificationOccurrenceStatusEnum
_$notificationOccurrenceStatusEnum_FALLBACK_IN_APP =
    const NotificationOccurrenceStatusEnum._('FALLBACK_IN_APP');

NotificationOccurrenceStatusEnum _$notificationOccurrenceStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'PENDING':
      return _$notificationOccurrenceStatusEnum_PENDING;
    case 'SENDING':
      return _$notificationOccurrenceStatusEnum_SENDING;
    case 'ACCEPTED_BY_SMTP':
      return _$notificationOccurrenceStatusEnum_ACCEPTED_BY_SMTP;
    case 'FAILED_RETRYABLE':
      return _$notificationOccurrenceStatusEnum_FAILED_RETRYABLE;
    case 'FAILED_TERMINAL':
      return _$notificationOccurrenceStatusEnum_FAILED_TERMINAL;
    case 'EXPIRED':
      return _$notificationOccurrenceStatusEnum_EXPIRED;
    case 'FALLBACK_IN_APP':
      return _$notificationOccurrenceStatusEnum_FALLBACK_IN_APP;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<NotificationOccurrenceStatusEnum>
_$notificationOccurrenceStatusEnumValues =
    BuiltSet<NotificationOccurrenceStatusEnum>(
      const <NotificationOccurrenceStatusEnum>[
        _$notificationOccurrenceStatusEnum_PENDING,
        _$notificationOccurrenceStatusEnum_SENDING,
        _$notificationOccurrenceStatusEnum_ACCEPTED_BY_SMTP,
        _$notificationOccurrenceStatusEnum_FAILED_RETRYABLE,
        _$notificationOccurrenceStatusEnum_FAILED_TERMINAL,
        _$notificationOccurrenceStatusEnum_EXPIRED,
        _$notificationOccurrenceStatusEnum_FALLBACK_IN_APP,
      ],
    );

Serializer<NotificationOccurrenceStatusEnum>
_$notificationOccurrenceStatusEnumSerializer =
    _$NotificationOccurrenceStatusEnumSerializer();

class _$NotificationOccurrenceStatusEnumSerializer
    implements PrimitiveSerializer<NotificationOccurrenceStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PENDING': 'PENDING',
    'SENDING': 'SENDING',
    'ACCEPTED_BY_SMTP': 'ACCEPTED_BY_SMTP',
    'FAILED_RETRYABLE': 'FAILED_RETRYABLE',
    'FAILED_TERMINAL': 'FAILED_TERMINAL',
    'EXPIRED': 'EXPIRED',
    'FALLBACK_IN_APP': 'FALLBACK_IN_APP',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PENDING': 'PENDING',
    'SENDING': 'SENDING',
    'ACCEPTED_BY_SMTP': 'ACCEPTED_BY_SMTP',
    'FAILED_RETRYABLE': 'FAILED_RETRYABLE',
    'FAILED_TERMINAL': 'FAILED_TERMINAL',
    'EXPIRED': 'EXPIRED',
    'FALLBACK_IN_APP': 'FALLBACK_IN_APP',
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
  final String templateKey;
  @override
  final String recipientMasked;
  @override
  final JsonObject? channel;
  @override
  final NotificationOccurrenceStatusEnum status;
  @override
  final int attemptCount;
  @override
  final int rateLimitWaitCount;
  @override
  final int maxAttempts;
  @override
  final DateTime? nextAttemptAt;
  @override
  final String? lastErrorCode;
  @override
  final String correlationId;
  @override
  final DateTime createdAt;
  @override
  final DateTime? acceptedAt;
  @override
  final NotificationAttempt? lastAttempt;

  factory _$NotificationOccurrence([
    void Function(NotificationOccurrenceBuilder)? updates,
  ]) => (NotificationOccurrenceBuilder()..update(updates))._build();

  _$NotificationOccurrence._({
    required this.id,
    required this.eventType,
    required this.templateKey,
    required this.recipientMasked,
    this.channel,
    required this.status,
    required this.attemptCount,
    required this.rateLimitWaitCount,
    required this.maxAttempts,
    this.nextAttemptAt,
    this.lastErrorCode,
    required this.correlationId,
    required this.createdAt,
    this.acceptedAt,
    this.lastAttempt,
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
        templateKey == other.templateKey &&
        recipientMasked == other.recipientMasked &&
        channel == other.channel &&
        status == other.status &&
        attemptCount == other.attemptCount &&
        rateLimitWaitCount == other.rateLimitWaitCount &&
        maxAttempts == other.maxAttempts &&
        nextAttemptAt == other.nextAttemptAt &&
        lastErrorCode == other.lastErrorCode &&
        correlationId == other.correlationId &&
        createdAt == other.createdAt &&
        acceptedAt == other.acceptedAt &&
        lastAttempt == other.lastAttempt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, eventType.hashCode);
    _$hash = $jc(_$hash, templateKey.hashCode);
    _$hash = $jc(_$hash, recipientMasked.hashCode);
    _$hash = $jc(_$hash, channel.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, attemptCount.hashCode);
    _$hash = $jc(_$hash, rateLimitWaitCount.hashCode);
    _$hash = $jc(_$hash, maxAttempts.hashCode);
    _$hash = $jc(_$hash, nextAttemptAt.hashCode);
    _$hash = $jc(_$hash, lastErrorCode.hashCode);
    _$hash = $jc(_$hash, correlationId.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, acceptedAt.hashCode);
    _$hash = $jc(_$hash, lastAttempt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'NotificationOccurrence')
          ..add('id', id)
          ..add('eventType', eventType)
          ..add('templateKey', templateKey)
          ..add('recipientMasked', recipientMasked)
          ..add('channel', channel)
          ..add('status', status)
          ..add('attemptCount', attemptCount)
          ..add('rateLimitWaitCount', rateLimitWaitCount)
          ..add('maxAttempts', maxAttempts)
          ..add('nextAttemptAt', nextAttemptAt)
          ..add('lastErrorCode', lastErrorCode)
          ..add('correlationId', correlationId)
          ..add('createdAt', createdAt)
          ..add('acceptedAt', acceptedAt)
          ..add('lastAttempt', lastAttempt))
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

  String? _templateKey;
  String? get templateKey => _$this._templateKey;
  set templateKey(String? templateKey) => _$this._templateKey = templateKey;

  String? _recipientMasked;
  String? get recipientMasked => _$this._recipientMasked;
  set recipientMasked(String? recipientMasked) =>
      _$this._recipientMasked = recipientMasked;

  JsonObject? _channel;
  JsonObject? get channel => _$this._channel;
  set channel(JsonObject? channel) => _$this._channel = channel;

  NotificationOccurrenceStatusEnum? _status;
  NotificationOccurrenceStatusEnum? get status => _$this._status;
  set status(NotificationOccurrenceStatusEnum? status) =>
      _$this._status = status;

  int? _attemptCount;
  int? get attemptCount => _$this._attemptCount;
  set attemptCount(int? attemptCount) => _$this._attemptCount = attemptCount;

  int? _rateLimitWaitCount;
  int? get rateLimitWaitCount => _$this._rateLimitWaitCount;
  set rateLimitWaitCount(int? rateLimitWaitCount) =>
      _$this._rateLimitWaitCount = rateLimitWaitCount;

  int? _maxAttempts;
  int? get maxAttempts => _$this._maxAttempts;
  set maxAttempts(int? maxAttempts) => _$this._maxAttempts = maxAttempts;

  DateTime? _nextAttemptAt;
  DateTime? get nextAttemptAt => _$this._nextAttemptAt;
  set nextAttemptAt(DateTime? nextAttemptAt) =>
      _$this._nextAttemptAt = nextAttemptAt;

  String? _lastErrorCode;
  String? get lastErrorCode => _$this._lastErrorCode;
  set lastErrorCode(String? lastErrorCode) =>
      _$this._lastErrorCode = lastErrorCode;

  String? _correlationId;
  String? get correlationId => _$this._correlationId;
  set correlationId(String? correlationId) =>
      _$this._correlationId = correlationId;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _acceptedAt;
  DateTime? get acceptedAt => _$this._acceptedAt;
  set acceptedAt(DateTime? acceptedAt) => _$this._acceptedAt = acceptedAt;

  NotificationAttemptBuilder? _lastAttempt;
  NotificationAttemptBuilder get lastAttempt =>
      _$this._lastAttempt ??= NotificationAttemptBuilder();
  set lastAttempt(NotificationAttemptBuilder? lastAttempt) =>
      _$this._lastAttempt = lastAttempt;

  NotificationOccurrenceBuilder() {
    NotificationOccurrence._defaults(this);
  }

  NotificationOccurrenceBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _eventType = $v.eventType;
      _templateKey = $v.templateKey;
      _recipientMasked = $v.recipientMasked;
      _channel = $v.channel;
      _status = $v.status;
      _attemptCount = $v.attemptCount;
      _rateLimitWaitCount = $v.rateLimitWaitCount;
      _maxAttempts = $v.maxAttempts;
      _nextAttemptAt = $v.nextAttemptAt;
      _lastErrorCode = $v.lastErrorCode;
      _correlationId = $v.correlationId;
      _createdAt = $v.createdAt;
      _acceptedAt = $v.acceptedAt;
      _lastAttempt = $v.lastAttempt?.toBuilder();
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
            templateKey: BuiltValueNullFieldError.checkNotNull(
              templateKey,
              r'NotificationOccurrence',
              'templateKey',
            ),
            recipientMasked: BuiltValueNullFieldError.checkNotNull(
              recipientMasked,
              r'NotificationOccurrence',
              'recipientMasked',
            ),
            channel: channel,
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'NotificationOccurrence',
              'status',
            ),
            attemptCount: BuiltValueNullFieldError.checkNotNull(
              attemptCount,
              r'NotificationOccurrence',
              'attemptCount',
            ),
            rateLimitWaitCount: BuiltValueNullFieldError.checkNotNull(
              rateLimitWaitCount,
              r'NotificationOccurrence',
              'rateLimitWaitCount',
            ),
            maxAttempts: BuiltValueNullFieldError.checkNotNull(
              maxAttempts,
              r'NotificationOccurrence',
              'maxAttempts',
            ),
            nextAttemptAt: nextAttemptAt,
            lastErrorCode: lastErrorCode,
            correlationId: BuiltValueNullFieldError.checkNotNull(
              correlationId,
              r'NotificationOccurrence',
              'correlationId',
            ),
            createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt,
              r'NotificationOccurrence',
              'createdAt',
            ),
            acceptedAt: acceptedAt,
            lastAttempt: _lastAttempt?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'lastAttempt';
        _lastAttempt?.build();
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
