// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'operational_job.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const OperationalJobStatusEnum _$operationalJobStatusEnum_QUEUED =
    const OperationalJobStatusEnum._('QUEUED');
const OperationalJobStatusEnum _$operationalJobStatusEnum_RUNNING =
    const OperationalJobStatusEnum._('RUNNING');
const OperationalJobStatusEnum _$operationalJobStatusEnum_RETRYING =
    const OperationalJobStatusEnum._('RETRYING');
const OperationalJobStatusEnum _$operationalJobStatusEnum_SUCCEEDED =
    const OperationalJobStatusEnum._('SUCCEEDED');
const OperationalJobStatusEnum _$operationalJobStatusEnum_FAILED =
    const OperationalJobStatusEnum._('FAILED');

OperationalJobStatusEnum _$operationalJobStatusEnumValueOf(String name) {
  switch (name) {
    case 'QUEUED':
      return _$operationalJobStatusEnum_QUEUED;
    case 'RUNNING':
      return _$operationalJobStatusEnum_RUNNING;
    case 'RETRYING':
      return _$operationalJobStatusEnum_RETRYING;
    case 'SUCCEEDED':
      return _$operationalJobStatusEnum_SUCCEEDED;
    case 'FAILED':
      return _$operationalJobStatusEnum_FAILED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<OperationalJobStatusEnum> _$operationalJobStatusEnumValues =
    BuiltSet<OperationalJobStatusEnum>(const <OperationalJobStatusEnum>[
      _$operationalJobStatusEnum_QUEUED,
      _$operationalJobStatusEnum_RUNNING,
      _$operationalJobStatusEnum_RETRYING,
      _$operationalJobStatusEnum_SUCCEEDED,
      _$operationalJobStatusEnum_FAILED,
    ]);

Serializer<OperationalJobStatusEnum> _$operationalJobStatusEnumSerializer =
    _$OperationalJobStatusEnumSerializer();

class _$OperationalJobStatusEnumSerializer
    implements PrimitiveSerializer<OperationalJobStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'QUEUED': 'QUEUED',
    'RUNNING': 'RUNNING',
    'RETRYING': 'RETRYING',
    'SUCCEEDED': 'SUCCEEDED',
    'FAILED': 'FAILED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'QUEUED': 'QUEUED',
    'RUNNING': 'RUNNING',
    'RETRYING': 'RETRYING',
    'SUCCEEDED': 'SUCCEEDED',
    'FAILED': 'FAILED',
  };

  @override
  final Iterable<Type> types = const <Type>[OperationalJobStatusEnum];
  @override
  final String wireName = 'OperationalJobStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    OperationalJobStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  OperationalJobStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => OperationalJobStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$OperationalJob extends OperationalJob {
  @override
  final String id;
  @override
  final JsonObject? type;
  @override
  final OperationalJobStatusEnum status;
  @override
  final int attemptCount;
  @override
  final int maxAttempts;
  @override
  final int progress;
  @override
  final DateTime dueAt;
  @override
  final DateTime nextAttemptAt;
  @override
  final DateTime? leaseExpiresAt;
  @override
  final String? lastErrorCode;
  @override
  final DateTime createdAt;
  @override
  final int version;

  factory _$OperationalJob([void Function(OperationalJobBuilder)? updates]) =>
      (OperationalJobBuilder()..update(updates))._build();

  _$OperationalJob._({
    required this.id,
    this.type,
    required this.status,
    required this.attemptCount,
    required this.maxAttempts,
    required this.progress,
    required this.dueAt,
    required this.nextAttemptAt,
    this.leaseExpiresAt,
    this.lastErrorCode,
    required this.createdAt,
    required this.version,
  }) : super._();
  @override
  OperationalJob rebuild(void Function(OperationalJobBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OperationalJobBuilder toBuilder() => OperationalJobBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OperationalJob &&
        id == other.id &&
        type == other.type &&
        status == other.status &&
        attemptCount == other.attemptCount &&
        maxAttempts == other.maxAttempts &&
        progress == other.progress &&
        dueAt == other.dueAt &&
        nextAttemptAt == other.nextAttemptAt &&
        leaseExpiresAt == other.leaseExpiresAt &&
        lastErrorCode == other.lastErrorCode &&
        createdAt == other.createdAt &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, type.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, attemptCount.hashCode);
    _$hash = $jc(_$hash, maxAttempts.hashCode);
    _$hash = $jc(_$hash, progress.hashCode);
    _$hash = $jc(_$hash, dueAt.hashCode);
    _$hash = $jc(_$hash, nextAttemptAt.hashCode);
    _$hash = $jc(_$hash, leaseExpiresAt.hashCode);
    _$hash = $jc(_$hash, lastErrorCode.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'OperationalJob')
          ..add('id', id)
          ..add('type', type)
          ..add('status', status)
          ..add('attemptCount', attemptCount)
          ..add('maxAttempts', maxAttempts)
          ..add('progress', progress)
          ..add('dueAt', dueAt)
          ..add('nextAttemptAt', nextAttemptAt)
          ..add('leaseExpiresAt', leaseExpiresAt)
          ..add('lastErrorCode', lastErrorCode)
          ..add('createdAt', createdAt)
          ..add('version', version))
        .toString();
  }
}

class OperationalJobBuilder
    implements Builder<OperationalJob, OperationalJobBuilder> {
  _$OperationalJob? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  JsonObject? _type;
  JsonObject? get type => _$this._type;
  set type(JsonObject? type) => _$this._type = type;

  OperationalJobStatusEnum? _status;
  OperationalJobStatusEnum? get status => _$this._status;
  set status(OperationalJobStatusEnum? status) => _$this._status = status;

  int? _attemptCount;
  int? get attemptCount => _$this._attemptCount;
  set attemptCount(int? attemptCount) => _$this._attemptCount = attemptCount;

  int? _maxAttempts;
  int? get maxAttempts => _$this._maxAttempts;
  set maxAttempts(int? maxAttempts) => _$this._maxAttempts = maxAttempts;

  int? _progress;
  int? get progress => _$this._progress;
  set progress(int? progress) => _$this._progress = progress;

  DateTime? _dueAt;
  DateTime? get dueAt => _$this._dueAt;
  set dueAt(DateTime? dueAt) => _$this._dueAt = dueAt;

  DateTime? _nextAttemptAt;
  DateTime? get nextAttemptAt => _$this._nextAttemptAt;
  set nextAttemptAt(DateTime? nextAttemptAt) =>
      _$this._nextAttemptAt = nextAttemptAt;

  DateTime? _leaseExpiresAt;
  DateTime? get leaseExpiresAt => _$this._leaseExpiresAt;
  set leaseExpiresAt(DateTime? leaseExpiresAt) =>
      _$this._leaseExpiresAt = leaseExpiresAt;

  String? _lastErrorCode;
  String? get lastErrorCode => _$this._lastErrorCode;
  set lastErrorCode(String? lastErrorCode) =>
      _$this._lastErrorCode = lastErrorCode;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  OperationalJobBuilder() {
    OperationalJob._defaults(this);
  }

  OperationalJobBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _type = $v.type;
      _status = $v.status;
      _attemptCount = $v.attemptCount;
      _maxAttempts = $v.maxAttempts;
      _progress = $v.progress;
      _dueAt = $v.dueAt;
      _nextAttemptAt = $v.nextAttemptAt;
      _leaseExpiresAt = $v.leaseExpiresAt;
      _lastErrorCode = $v.lastErrorCode;
      _createdAt = $v.createdAt;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OperationalJob other) {
    _$v = other as _$OperationalJob;
  }

  @override
  void update(void Function(OperationalJobBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OperationalJob build() => _build();

  _$OperationalJob _build() {
    final _$result =
        _$v ??
        _$OperationalJob._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'OperationalJob',
            'id',
          ),
          type: type,
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'OperationalJob',
            'status',
          ),
          attemptCount: BuiltValueNullFieldError.checkNotNull(
            attemptCount,
            r'OperationalJob',
            'attemptCount',
          ),
          maxAttempts: BuiltValueNullFieldError.checkNotNull(
            maxAttempts,
            r'OperationalJob',
            'maxAttempts',
          ),
          progress: BuiltValueNullFieldError.checkNotNull(
            progress,
            r'OperationalJob',
            'progress',
          ),
          dueAt: BuiltValueNullFieldError.checkNotNull(
            dueAt,
            r'OperationalJob',
            'dueAt',
          ),
          nextAttemptAt: BuiltValueNullFieldError.checkNotNull(
            nextAttemptAt,
            r'OperationalJob',
            'nextAttemptAt',
          ),
          leaseExpiresAt: leaseExpiresAt,
          lastErrorCode: lastErrorCode,
          createdAt: BuiltValueNullFieldError.checkNotNull(
            createdAt,
            r'OperationalJob',
            'createdAt',
          ),
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'OperationalJob',
            'version',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
