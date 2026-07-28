// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_retry_result.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$NotificationRetryResult extends NotificationRetryResult {
  @override
  final String id;
  @override
  final JsonObject? status;
  @override
  final DateTime nextAttemptAt;

  factory _$NotificationRetryResult([
    void Function(NotificationRetryResultBuilder)? updates,
  ]) => (NotificationRetryResultBuilder()..update(updates))._build();

  _$NotificationRetryResult._({
    required this.id,
    this.status,
    required this.nextAttemptAt,
  }) : super._();
  @override
  NotificationRetryResult rebuild(
    void Function(NotificationRetryResultBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  NotificationRetryResultBuilder toBuilder() =>
      NotificationRetryResultBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is NotificationRetryResult &&
        id == other.id &&
        status == other.status &&
        nextAttemptAt == other.nextAttemptAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, nextAttemptAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'NotificationRetryResult')
          ..add('id', id)
          ..add('status', status)
          ..add('nextAttemptAt', nextAttemptAt))
        .toString();
  }
}

class NotificationRetryResultBuilder
    implements
        Builder<NotificationRetryResult, NotificationRetryResultBuilder> {
  _$NotificationRetryResult? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  JsonObject? _status;
  JsonObject? get status => _$this._status;
  set status(JsonObject? status) => _$this._status = status;

  DateTime? _nextAttemptAt;
  DateTime? get nextAttemptAt => _$this._nextAttemptAt;
  set nextAttemptAt(DateTime? nextAttemptAt) =>
      _$this._nextAttemptAt = nextAttemptAt;

  NotificationRetryResultBuilder() {
    NotificationRetryResult._defaults(this);
  }

  NotificationRetryResultBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _status = $v.status;
      _nextAttemptAt = $v.nextAttemptAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(NotificationRetryResult other) {
    _$v = other as _$NotificationRetryResult;
  }

  @override
  void update(void Function(NotificationRetryResultBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  NotificationRetryResult build() => _build();

  _$NotificationRetryResult _build() {
    final _$result =
        _$v ??
        _$NotificationRetryResult._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'NotificationRetryResult',
            'id',
          ),
          status: status,
          nextAttemptAt: BuiltValueNullFieldError.checkNotNull(
            nextAttemptAt,
            r'NotificationRetryResult',
            'nextAttemptAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
