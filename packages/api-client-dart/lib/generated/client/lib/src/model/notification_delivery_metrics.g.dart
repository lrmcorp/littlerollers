// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_delivery_metrics.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$NotificationDeliveryMetrics extends NotificationDeliveryMetrics {
  @override
  final int totalCount;
  @override
  final int pendingCount;
  @override
  final int acceptedCount;
  @override
  final int terminalFailureCount;
  @override
  final int deadLetterCount;
  @override
  final int retryCount;
  @override
  final int rateLimitWaitCount;
  @override
  final int queueAgeSeconds;
  @override
  final int acceptedRateBasisPoints;
  @override
  final int failureRateBasisPoints;
  @override
  final BuiltMap<String, int> byStatus;

  factory _$NotificationDeliveryMetrics([
    void Function(NotificationDeliveryMetricsBuilder)? updates,
  ]) => (NotificationDeliveryMetricsBuilder()..update(updates))._build();

  _$NotificationDeliveryMetrics._({
    required this.totalCount,
    required this.pendingCount,
    required this.acceptedCount,
    required this.terminalFailureCount,
    required this.deadLetterCount,
    required this.retryCount,
    required this.rateLimitWaitCount,
    required this.queueAgeSeconds,
    required this.acceptedRateBasisPoints,
    required this.failureRateBasisPoints,
    required this.byStatus,
  }) : super._();
  @override
  NotificationDeliveryMetrics rebuild(
    void Function(NotificationDeliveryMetricsBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  NotificationDeliveryMetricsBuilder toBuilder() =>
      NotificationDeliveryMetricsBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is NotificationDeliveryMetrics &&
        totalCount == other.totalCount &&
        pendingCount == other.pendingCount &&
        acceptedCount == other.acceptedCount &&
        terminalFailureCount == other.terminalFailureCount &&
        deadLetterCount == other.deadLetterCount &&
        retryCount == other.retryCount &&
        rateLimitWaitCount == other.rateLimitWaitCount &&
        queueAgeSeconds == other.queueAgeSeconds &&
        acceptedRateBasisPoints == other.acceptedRateBasisPoints &&
        failureRateBasisPoints == other.failureRateBasisPoints &&
        byStatus == other.byStatus;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, totalCount.hashCode);
    _$hash = $jc(_$hash, pendingCount.hashCode);
    _$hash = $jc(_$hash, acceptedCount.hashCode);
    _$hash = $jc(_$hash, terminalFailureCount.hashCode);
    _$hash = $jc(_$hash, deadLetterCount.hashCode);
    _$hash = $jc(_$hash, retryCount.hashCode);
    _$hash = $jc(_$hash, rateLimitWaitCount.hashCode);
    _$hash = $jc(_$hash, queueAgeSeconds.hashCode);
    _$hash = $jc(_$hash, acceptedRateBasisPoints.hashCode);
    _$hash = $jc(_$hash, failureRateBasisPoints.hashCode);
    _$hash = $jc(_$hash, byStatus.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'NotificationDeliveryMetrics')
          ..add('totalCount', totalCount)
          ..add('pendingCount', pendingCount)
          ..add('acceptedCount', acceptedCount)
          ..add('terminalFailureCount', terminalFailureCount)
          ..add('deadLetterCount', deadLetterCount)
          ..add('retryCount', retryCount)
          ..add('rateLimitWaitCount', rateLimitWaitCount)
          ..add('queueAgeSeconds', queueAgeSeconds)
          ..add('acceptedRateBasisPoints', acceptedRateBasisPoints)
          ..add('failureRateBasisPoints', failureRateBasisPoints)
          ..add('byStatus', byStatus))
        .toString();
  }
}

class NotificationDeliveryMetricsBuilder
    implements
        Builder<
          NotificationDeliveryMetrics,
          NotificationDeliveryMetricsBuilder
        > {
  _$NotificationDeliveryMetrics? _$v;

  int? _totalCount;
  int? get totalCount => _$this._totalCount;
  set totalCount(int? totalCount) => _$this._totalCount = totalCount;

  int? _pendingCount;
  int? get pendingCount => _$this._pendingCount;
  set pendingCount(int? pendingCount) => _$this._pendingCount = pendingCount;

  int? _acceptedCount;
  int? get acceptedCount => _$this._acceptedCount;
  set acceptedCount(int? acceptedCount) =>
      _$this._acceptedCount = acceptedCount;

  int? _terminalFailureCount;
  int? get terminalFailureCount => _$this._terminalFailureCount;
  set terminalFailureCount(int? terminalFailureCount) =>
      _$this._terminalFailureCount = terminalFailureCount;

  int? _deadLetterCount;
  int? get deadLetterCount => _$this._deadLetterCount;
  set deadLetterCount(int? deadLetterCount) =>
      _$this._deadLetterCount = deadLetterCount;

  int? _retryCount;
  int? get retryCount => _$this._retryCount;
  set retryCount(int? retryCount) => _$this._retryCount = retryCount;

  int? _rateLimitWaitCount;
  int? get rateLimitWaitCount => _$this._rateLimitWaitCount;
  set rateLimitWaitCount(int? rateLimitWaitCount) =>
      _$this._rateLimitWaitCount = rateLimitWaitCount;

  int? _queueAgeSeconds;
  int? get queueAgeSeconds => _$this._queueAgeSeconds;
  set queueAgeSeconds(int? queueAgeSeconds) =>
      _$this._queueAgeSeconds = queueAgeSeconds;

  int? _acceptedRateBasisPoints;
  int? get acceptedRateBasisPoints => _$this._acceptedRateBasisPoints;
  set acceptedRateBasisPoints(int? acceptedRateBasisPoints) =>
      _$this._acceptedRateBasisPoints = acceptedRateBasisPoints;

  int? _failureRateBasisPoints;
  int? get failureRateBasisPoints => _$this._failureRateBasisPoints;
  set failureRateBasisPoints(int? failureRateBasisPoints) =>
      _$this._failureRateBasisPoints = failureRateBasisPoints;

  MapBuilder<String, int>? _byStatus;
  MapBuilder<String, int> get byStatus =>
      _$this._byStatus ??= MapBuilder<String, int>();
  set byStatus(MapBuilder<String, int>? byStatus) =>
      _$this._byStatus = byStatus;

  NotificationDeliveryMetricsBuilder() {
    NotificationDeliveryMetrics._defaults(this);
  }

  NotificationDeliveryMetricsBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _totalCount = $v.totalCount;
      _pendingCount = $v.pendingCount;
      _acceptedCount = $v.acceptedCount;
      _terminalFailureCount = $v.terminalFailureCount;
      _deadLetterCount = $v.deadLetterCount;
      _retryCount = $v.retryCount;
      _rateLimitWaitCount = $v.rateLimitWaitCount;
      _queueAgeSeconds = $v.queueAgeSeconds;
      _acceptedRateBasisPoints = $v.acceptedRateBasisPoints;
      _failureRateBasisPoints = $v.failureRateBasisPoints;
      _byStatus = $v.byStatus.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(NotificationDeliveryMetrics other) {
    _$v = other as _$NotificationDeliveryMetrics;
  }

  @override
  void update(void Function(NotificationDeliveryMetricsBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  NotificationDeliveryMetrics build() => _build();

  _$NotificationDeliveryMetrics _build() {
    _$NotificationDeliveryMetrics _$result;
    try {
      _$result =
          _$v ??
          _$NotificationDeliveryMetrics._(
            totalCount: BuiltValueNullFieldError.checkNotNull(
              totalCount,
              r'NotificationDeliveryMetrics',
              'totalCount',
            ),
            pendingCount: BuiltValueNullFieldError.checkNotNull(
              pendingCount,
              r'NotificationDeliveryMetrics',
              'pendingCount',
            ),
            acceptedCount: BuiltValueNullFieldError.checkNotNull(
              acceptedCount,
              r'NotificationDeliveryMetrics',
              'acceptedCount',
            ),
            terminalFailureCount: BuiltValueNullFieldError.checkNotNull(
              terminalFailureCount,
              r'NotificationDeliveryMetrics',
              'terminalFailureCount',
            ),
            deadLetterCount: BuiltValueNullFieldError.checkNotNull(
              deadLetterCount,
              r'NotificationDeliveryMetrics',
              'deadLetterCount',
            ),
            retryCount: BuiltValueNullFieldError.checkNotNull(
              retryCount,
              r'NotificationDeliveryMetrics',
              'retryCount',
            ),
            rateLimitWaitCount: BuiltValueNullFieldError.checkNotNull(
              rateLimitWaitCount,
              r'NotificationDeliveryMetrics',
              'rateLimitWaitCount',
            ),
            queueAgeSeconds: BuiltValueNullFieldError.checkNotNull(
              queueAgeSeconds,
              r'NotificationDeliveryMetrics',
              'queueAgeSeconds',
            ),
            acceptedRateBasisPoints: BuiltValueNullFieldError.checkNotNull(
              acceptedRateBasisPoints,
              r'NotificationDeliveryMetrics',
              'acceptedRateBasisPoints',
            ),
            failureRateBasisPoints: BuiltValueNullFieldError.checkNotNull(
              failureRateBasisPoints,
              r'NotificationDeliveryMetrics',
              'failureRateBasisPoints',
            ),
            byStatus: byStatus.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'byStatus';
        byStatus.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'NotificationDeliveryMetrics',
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
