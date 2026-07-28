// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_attempt.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const NotificationAttemptStatusEnum _$notificationAttemptStatusEnum_SENDING =
    const NotificationAttemptStatusEnum._('SENDING');
const NotificationAttemptStatusEnum
_$notificationAttemptStatusEnum_ACCEPTED_BY_SMTP =
    const NotificationAttemptStatusEnum._('ACCEPTED_BY_SMTP');
const NotificationAttemptStatusEnum
_$notificationAttemptStatusEnum_FAILED_RETRYABLE =
    const NotificationAttemptStatusEnum._('FAILED_RETRYABLE');
const NotificationAttemptStatusEnum
_$notificationAttemptStatusEnum_FAILED_TERMINAL =
    const NotificationAttemptStatusEnum._('FAILED_TERMINAL');

NotificationAttemptStatusEnum _$notificationAttemptStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'SENDING':
      return _$notificationAttemptStatusEnum_SENDING;
    case 'ACCEPTED_BY_SMTP':
      return _$notificationAttemptStatusEnum_ACCEPTED_BY_SMTP;
    case 'FAILED_RETRYABLE':
      return _$notificationAttemptStatusEnum_FAILED_RETRYABLE;
    case 'FAILED_TERMINAL':
      return _$notificationAttemptStatusEnum_FAILED_TERMINAL;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<NotificationAttemptStatusEnum>
_$notificationAttemptStatusEnumValues = BuiltSet<NotificationAttemptStatusEnum>(
  const <NotificationAttemptStatusEnum>[
    _$notificationAttemptStatusEnum_SENDING,
    _$notificationAttemptStatusEnum_ACCEPTED_BY_SMTP,
    _$notificationAttemptStatusEnum_FAILED_RETRYABLE,
    _$notificationAttemptStatusEnum_FAILED_TERMINAL,
  ],
);

Serializer<NotificationAttemptStatusEnum>
_$notificationAttemptStatusEnumSerializer =
    _$NotificationAttemptStatusEnumSerializer();

class _$NotificationAttemptStatusEnumSerializer
    implements PrimitiveSerializer<NotificationAttemptStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'SENDING': 'SENDING',
    'ACCEPTED_BY_SMTP': 'ACCEPTED_BY_SMTP',
    'FAILED_RETRYABLE': 'FAILED_RETRYABLE',
    'FAILED_TERMINAL': 'FAILED_TERMINAL',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'SENDING': 'SENDING',
    'ACCEPTED_BY_SMTP': 'ACCEPTED_BY_SMTP',
    'FAILED_RETRYABLE': 'FAILED_RETRYABLE',
    'FAILED_TERMINAL': 'FAILED_TERMINAL',
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
  final DateTime startedAt;
  @override
  final DateTime? completedAt;
  @override
  final String? providerCode;
  @override
  final String? errorCode;

  factory _$NotificationAttempt([
    void Function(NotificationAttemptBuilder)? updates,
  ]) => (NotificationAttemptBuilder()..update(updates))._build();

  _$NotificationAttempt._({
    required this.id,
    required this.occurrenceId,
    required this.attemptNumber,
    required this.status,
    required this.startedAt,
    this.completedAt,
    this.providerCode,
    this.errorCode,
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
        startedAt == other.startedAt &&
        completedAt == other.completedAt &&
        providerCode == other.providerCode &&
        errorCode == other.errorCode;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, occurrenceId.hashCode);
    _$hash = $jc(_$hash, attemptNumber.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, startedAt.hashCode);
    _$hash = $jc(_$hash, completedAt.hashCode);
    _$hash = $jc(_$hash, providerCode.hashCode);
    _$hash = $jc(_$hash, errorCode.hashCode);
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
          ..add('startedAt', startedAt)
          ..add('completedAt', completedAt)
          ..add('providerCode', providerCode)
          ..add('errorCode', errorCode))
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

  DateTime? _startedAt;
  DateTime? get startedAt => _$this._startedAt;
  set startedAt(DateTime? startedAt) => _$this._startedAt = startedAt;

  DateTime? _completedAt;
  DateTime? get completedAt => _$this._completedAt;
  set completedAt(DateTime? completedAt) => _$this._completedAt = completedAt;

  String? _providerCode;
  String? get providerCode => _$this._providerCode;
  set providerCode(String? providerCode) => _$this._providerCode = providerCode;

  String? _errorCode;
  String? get errorCode => _$this._errorCode;
  set errorCode(String? errorCode) => _$this._errorCode = errorCode;

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
      _startedAt = $v.startedAt;
      _completedAt = $v.completedAt;
      _providerCode = $v.providerCode;
      _errorCode = $v.errorCode;
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
          startedAt: BuiltValueNullFieldError.checkNotNull(
            startedAt,
            r'NotificationAttempt',
            'startedAt',
          ),
          completedAt: completedAt,
          providerCode: providerCode,
          errorCode: errorCode,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
