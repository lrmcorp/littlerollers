// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_attempt.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const NotificationAttemptStatusEnum _$notificationAttemptStatusEnum_QUEUED =
    const NotificationAttemptStatusEnum._('QUEUED');
const NotificationAttemptStatusEnum _$notificationAttemptStatusEnum_SENT =
    const NotificationAttemptStatusEnum._('SENT');
const NotificationAttemptStatusEnum _$notificationAttemptStatusEnum_DELIVERED =
    const NotificationAttemptStatusEnum._('DELIVERED');
const NotificationAttemptStatusEnum _$notificationAttemptStatusEnum_FAILED =
    const NotificationAttemptStatusEnum._('FAILED');
const NotificationAttemptStatusEnum
_$notificationAttemptStatusEnum_DEAD_LETTER =
    const NotificationAttemptStatusEnum._('DEAD_LETTER');

NotificationAttemptStatusEnum _$notificationAttemptStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'QUEUED':
      return _$notificationAttemptStatusEnum_QUEUED;
    case 'SENT':
      return _$notificationAttemptStatusEnum_SENT;
    case 'DELIVERED':
      return _$notificationAttemptStatusEnum_DELIVERED;
    case 'FAILED':
      return _$notificationAttemptStatusEnum_FAILED;
    case 'DEAD_LETTER':
      return _$notificationAttemptStatusEnum_DEAD_LETTER;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<NotificationAttemptStatusEnum>
_$notificationAttemptStatusEnumValues = BuiltSet<NotificationAttemptStatusEnum>(
  const <NotificationAttemptStatusEnum>[
    _$notificationAttemptStatusEnum_QUEUED,
    _$notificationAttemptStatusEnum_SENT,
    _$notificationAttemptStatusEnum_DELIVERED,
    _$notificationAttemptStatusEnum_FAILED,
    _$notificationAttemptStatusEnum_DEAD_LETTER,
  ],
);

Serializer<NotificationAttemptStatusEnum>
_$notificationAttemptStatusEnumSerializer =
    _$NotificationAttemptStatusEnumSerializer();

class _$NotificationAttemptStatusEnumSerializer
    implements PrimitiveSerializer<NotificationAttemptStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'QUEUED': 'QUEUED',
    'SENT': 'SENT',
    'DELIVERED': 'DELIVERED',
    'FAILED': 'FAILED',
    'DEAD_LETTER': 'DEAD_LETTER',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'QUEUED': 'QUEUED',
    'SENT': 'SENT',
    'DELIVERED': 'DELIVERED',
    'FAILED': 'FAILED',
    'DEAD_LETTER': 'DEAD_LETTER',
  };

  @override
  final Iterable<Type> types = const <Type>[NotificationAttemptStatusEnum];
  @override
  final String wireName = 'NotificationAttemptStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    NotificationAttemptStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  NotificationAttemptStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => NotificationAttemptStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$NotificationAttempt extends NotificationAttempt {
  @override
  final String id;
  @override
  final String occurrenceId;
  @override
  final int attemptNumber;
  @override
  final NotificationAttemptStatusEnum status;
  @override
  final DateTime queuedAt;
  @override
  final String? providerReference;
  @override
  final String? failureCode;
  @override
  final bool idempotentReplay;

  factory _$NotificationAttempt([
    void Function(NotificationAttemptBuilder)? updates,
  ]) => (NotificationAttemptBuilder()..update(updates))._build();

  _$NotificationAttempt._({
    required this.id,
    required this.occurrenceId,
    required this.attemptNumber,
    required this.status,
    required this.queuedAt,
    this.providerReference,
    this.failureCode,
    required this.idempotentReplay,
  }) : super._();
  @override
  NotificationAttempt rebuild(
    void Function(NotificationAttemptBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  NotificationAttemptBuilder toBuilder() =>
      NotificationAttemptBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is NotificationAttempt &&
        id == other.id &&
        occurrenceId == other.occurrenceId &&
        attemptNumber == other.attemptNumber &&
        status == other.status &&
        queuedAt == other.queuedAt &&
        providerReference == other.providerReference &&
        failureCode == other.failureCode &&
        idempotentReplay == other.idempotentReplay;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, occurrenceId.hashCode);
    _$hash = $jc(_$hash, attemptNumber.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, queuedAt.hashCode);
    _$hash = $jc(_$hash, providerReference.hashCode);
    _$hash = $jc(_$hash, failureCode.hashCode);
    _$hash = $jc(_$hash, idempotentReplay.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'NotificationAttempt')
          ..add('id', id)
          ..add('occurrenceId', occurrenceId)
          ..add('attemptNumber', attemptNumber)
          ..add('status', status)
          ..add('queuedAt', queuedAt)
          ..add('providerReference', providerReference)
          ..add('failureCode', failureCode)
          ..add('idempotentReplay', idempotentReplay))
        .toString();
  }
}

class NotificationAttemptBuilder
    implements Builder<NotificationAttempt, NotificationAttemptBuilder> {
  _$NotificationAttempt? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _occurrenceId;
  String? get occurrenceId => _$this._occurrenceId;
  set occurrenceId(String? occurrenceId) => _$this._occurrenceId = occurrenceId;

  int? _attemptNumber;
  int? get attemptNumber => _$this._attemptNumber;
  set attemptNumber(int? attemptNumber) =>
      _$this._attemptNumber = attemptNumber;

  NotificationAttemptStatusEnum? _status;
  NotificationAttemptStatusEnum? get status => _$this._status;
  set status(NotificationAttemptStatusEnum? status) => _$this._status = status;

  DateTime? _queuedAt;
  DateTime? get queuedAt => _$this._queuedAt;
  set queuedAt(DateTime? queuedAt) => _$this._queuedAt = queuedAt;

  String? _providerReference;
  String? get providerReference => _$this._providerReference;
  set providerReference(String? providerReference) =>
      _$this._providerReference = providerReference;

  String? _failureCode;
  String? get failureCode => _$this._failureCode;
  set failureCode(String? failureCode) => _$this._failureCode = failureCode;

  bool? _idempotentReplay;
  bool? get idempotentReplay => _$this._idempotentReplay;
  set idempotentReplay(bool? idempotentReplay) =>
      _$this._idempotentReplay = idempotentReplay;

  NotificationAttemptBuilder() {
    NotificationAttempt._defaults(this);
  }

  NotificationAttemptBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _occurrenceId = $v.occurrenceId;
      _attemptNumber = $v.attemptNumber;
      _status = $v.status;
      _queuedAt = $v.queuedAt;
      _providerReference = $v.providerReference;
      _failureCode = $v.failureCode;
      _idempotentReplay = $v.idempotentReplay;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(NotificationAttempt other) {
    _$v = other as _$NotificationAttempt;
  }

  @override
  void update(void Function(NotificationAttemptBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  NotificationAttempt build() => _build();

  _$NotificationAttempt _build() {
    final _$result =
        _$v ??
        _$NotificationAttempt._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'NotificationAttempt',
            'id',
          ),
          occurrenceId: BuiltValueNullFieldError.checkNotNull(
            occurrenceId,
            r'NotificationAttempt',
            'occurrenceId',
          ),
          attemptNumber: BuiltValueNullFieldError.checkNotNull(
            attemptNumber,
            r'NotificationAttempt',
            'attemptNumber',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'NotificationAttempt',
            'status',
          ),
          queuedAt: BuiltValueNullFieldError.checkNotNull(
            queuedAt,
            r'NotificationAttempt',
            'queuedAt',
          ),
          providerReference: providerReference,
          failureCode: failureCode,
          idempotentReplay: BuiltValueNullFieldError.checkNotNull(
            idempotentReplay,
            r'NotificationAttempt',
            'idempotentReplay',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
