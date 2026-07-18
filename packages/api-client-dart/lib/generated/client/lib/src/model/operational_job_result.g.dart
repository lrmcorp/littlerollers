// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'operational_job_result.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const OperationalJobResultStatusEnum _$operationalJobResultStatusEnum_QUEUED =
    const OperationalJobResultStatusEnum._('QUEUED');
const OperationalJobResultStatusEnum _$operationalJobResultStatusEnum_RUNNING =
    const OperationalJobResultStatusEnum._('RUNNING');
const OperationalJobResultStatusEnum _$operationalJobResultStatusEnum_RETRYING =
    const OperationalJobResultStatusEnum._('RETRYING');
const OperationalJobResultStatusEnum
_$operationalJobResultStatusEnum_SUCCEEDED =
    const OperationalJobResultStatusEnum._('SUCCEEDED');
const OperationalJobResultStatusEnum _$operationalJobResultStatusEnum_FAILED =
    const OperationalJobResultStatusEnum._('FAILED');
const OperationalJobResultStatusEnum
_$operationalJobResultStatusEnum_DEAD_LETTER =
    const OperationalJobResultStatusEnum._('DEAD_LETTER');

OperationalJobResultStatusEnum _$operationalJobResultStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'QUEUED':
      return _$operationalJobResultStatusEnum_QUEUED;
    case 'RUNNING':
      return _$operationalJobResultStatusEnum_RUNNING;
    case 'RETRYING':
      return _$operationalJobResultStatusEnum_RETRYING;
    case 'SUCCEEDED':
      return _$operationalJobResultStatusEnum_SUCCEEDED;
    case 'FAILED':
      return _$operationalJobResultStatusEnum_FAILED;
    case 'DEAD_LETTER':
      return _$operationalJobResultStatusEnum_DEAD_LETTER;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<OperationalJobResultStatusEnum>
_$operationalJobResultStatusEnumValues =
    BuiltSet<OperationalJobResultStatusEnum>(
      const <OperationalJobResultStatusEnum>[
        _$operationalJobResultStatusEnum_QUEUED,
        _$operationalJobResultStatusEnum_RUNNING,
        _$operationalJobResultStatusEnum_RETRYING,
        _$operationalJobResultStatusEnum_SUCCEEDED,
        _$operationalJobResultStatusEnum_FAILED,
        _$operationalJobResultStatusEnum_DEAD_LETTER,
      ],
    );

Serializer<OperationalJobResultStatusEnum>
_$operationalJobResultStatusEnumSerializer =
    _$OperationalJobResultStatusEnumSerializer();

class _$OperationalJobResultStatusEnumSerializer
    implements PrimitiveSerializer<OperationalJobResultStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'QUEUED': 'QUEUED',
    'RUNNING': 'RUNNING',
    'RETRYING': 'RETRYING',
    'SUCCEEDED': 'SUCCEEDED',
    'FAILED': 'FAILED',
    'DEAD_LETTER': 'DEAD_LETTER',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'QUEUED': 'QUEUED',
    'RUNNING': 'RUNNING',
    'RETRYING': 'RETRYING',
    'SUCCEEDED': 'SUCCEEDED',
    'FAILED': 'FAILED',
    'DEAD_LETTER': 'DEAD_LETTER',
  };

  @override
  final Iterable<Type> types = const <Type>[OperationalJobResultStatusEnum];
  @override
  final String wireName = 'OperationalJobResultStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    OperationalJobResultStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  OperationalJobResultStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => OperationalJobResultStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$OperationalJobResult extends OperationalJobResult {
  @override
  final String jobId;
  @override
  final OperationalJobResultStatusEnum status;
  @override
  final int attemptCount;
  @override
  final int maxAttempts;
  @override
  final DateTime? leaseExpiresAt;
  @override
  final String? lastErrorCode;
  @override
  final bool idempotentReplay;

  factory _$OperationalJobResult([
    void Function(OperationalJobResultBuilder)? updates,
  ]) => (OperationalJobResultBuilder()..update(updates))._build();

  _$OperationalJobResult._({
    required this.jobId,
    required this.status,
    required this.attemptCount,
    required this.maxAttempts,
    this.leaseExpiresAt,
    this.lastErrorCode,
    required this.idempotentReplay,
  }) : super._();
  @override
  OperationalJobResult rebuild(
    void Function(OperationalJobResultBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  OperationalJobResultBuilder toBuilder() =>
      OperationalJobResultBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OperationalJobResult &&
        jobId == other.jobId &&
        status == other.status &&
        attemptCount == other.attemptCount &&
        maxAttempts == other.maxAttempts &&
        leaseExpiresAt == other.leaseExpiresAt &&
        lastErrorCode == other.lastErrorCode &&
        idempotentReplay == other.idempotentReplay;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, jobId.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, attemptCount.hashCode);
    _$hash = $jc(_$hash, maxAttempts.hashCode);
    _$hash = $jc(_$hash, leaseExpiresAt.hashCode);
    _$hash = $jc(_$hash, lastErrorCode.hashCode);
    _$hash = $jc(_$hash, idempotentReplay.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'OperationalJobResult')
          ..add('jobId', jobId)
          ..add('status', status)
          ..add('attemptCount', attemptCount)
          ..add('maxAttempts', maxAttempts)
          ..add('leaseExpiresAt', leaseExpiresAt)
          ..add('lastErrorCode', lastErrorCode)
          ..add('idempotentReplay', idempotentReplay))
        .toString();
  }
}

class OperationalJobResultBuilder
    implements Builder<OperationalJobResult, OperationalJobResultBuilder> {
  _$OperationalJobResult? _$v;

  String? _jobId;
  String? get jobId => _$this._jobId;
  set jobId(String? jobId) => _$this._jobId = jobId;

  OperationalJobResultStatusEnum? _status;
  OperationalJobResultStatusEnum? get status => _$this._status;
  set status(OperationalJobResultStatusEnum? status) => _$this._status = status;

  int? _attemptCount;
  int? get attemptCount => _$this._attemptCount;
  set attemptCount(int? attemptCount) => _$this._attemptCount = attemptCount;

  int? _maxAttempts;
  int? get maxAttempts => _$this._maxAttempts;
  set maxAttempts(int? maxAttempts) => _$this._maxAttempts = maxAttempts;

  DateTime? _leaseExpiresAt;
  DateTime? get leaseExpiresAt => _$this._leaseExpiresAt;
  set leaseExpiresAt(DateTime? leaseExpiresAt) =>
      _$this._leaseExpiresAt = leaseExpiresAt;

  String? _lastErrorCode;
  String? get lastErrorCode => _$this._lastErrorCode;
  set lastErrorCode(String? lastErrorCode) =>
      _$this._lastErrorCode = lastErrorCode;

  bool? _idempotentReplay;
  bool? get idempotentReplay => _$this._idempotentReplay;
  set idempotentReplay(bool? idempotentReplay) =>
      _$this._idempotentReplay = idempotentReplay;

  OperationalJobResultBuilder() {
    OperationalJobResult._defaults(this);
  }

  OperationalJobResultBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _jobId = $v.jobId;
      _status = $v.status;
      _attemptCount = $v.attemptCount;
      _maxAttempts = $v.maxAttempts;
      _leaseExpiresAt = $v.leaseExpiresAt;
      _lastErrorCode = $v.lastErrorCode;
      _idempotentReplay = $v.idempotentReplay;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OperationalJobResult other) {
    _$v = other as _$OperationalJobResult;
  }

  @override
  void update(void Function(OperationalJobResultBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OperationalJobResult build() => _build();

  _$OperationalJobResult _build() {
    final _$result =
        _$v ??
        _$OperationalJobResult._(
          jobId: BuiltValueNullFieldError.checkNotNull(
            jobId,
            r'OperationalJobResult',
            'jobId',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'OperationalJobResult',
            'status',
          ),
          attemptCount: BuiltValueNullFieldError.checkNotNull(
            attemptCount,
            r'OperationalJobResult',
            'attemptCount',
          ),
          maxAttempts: BuiltValueNullFieldError.checkNotNull(
            maxAttempts,
            r'OperationalJobResult',
            'maxAttempts',
          ),
          leaseExpiresAt: leaseExpiresAt,
          lastErrorCode: lastErrorCode,
          idempotentReplay: BuiltValueNullFieldError.checkNotNull(
            idempotentReplay,
            r'OperationalJobResult',
            'idempotentReplay',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
