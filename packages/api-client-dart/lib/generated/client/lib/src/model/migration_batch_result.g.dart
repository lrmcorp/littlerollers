// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'migration_batch_result.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const MigrationBatchResultStatusEnum _$migrationBatchResultStatusEnum_DRAFT =
    const MigrationBatchResultStatusEnum._('DRAFT');
const MigrationBatchResultStatusEnum
_$migrationBatchResultStatusEnum_VALIDATING =
    const MigrationBatchResultStatusEnum._('VALIDATING');
const MigrationBatchResultStatusEnum
_$migrationBatchResultStatusEnum_VALIDATED =
    const MigrationBatchResultStatusEnum._('VALIDATED');
const MigrationBatchResultStatusEnum _$migrationBatchResultStatusEnum_APPLYING =
    const MigrationBatchResultStatusEnum._('APPLYING');
const MigrationBatchResultStatusEnum _$migrationBatchResultStatusEnum_APPLIED =
    const MigrationBatchResultStatusEnum._('APPLIED');
const MigrationBatchResultStatusEnum
_$migrationBatchResultStatusEnum_RECONCILING =
    const MigrationBatchResultStatusEnum._('RECONCILING');
const MigrationBatchResultStatusEnum
_$migrationBatchResultStatusEnum_RECONCILED =
    const MigrationBatchResultStatusEnum._('RECONCILED');
const MigrationBatchResultStatusEnum
_$migrationBatchResultStatusEnum_ROLLING_BACK =
    const MigrationBatchResultStatusEnum._('ROLLING_BACK');
const MigrationBatchResultStatusEnum
_$migrationBatchResultStatusEnum_ROLLED_BACK =
    const MigrationBatchResultStatusEnum._('ROLLED_BACK');
const MigrationBatchResultStatusEnum _$migrationBatchResultStatusEnum_FAILED =
    const MigrationBatchResultStatusEnum._('FAILED');

MigrationBatchResultStatusEnum _$migrationBatchResultStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'DRAFT':
      return _$migrationBatchResultStatusEnum_DRAFT;
    case 'VALIDATING':
      return _$migrationBatchResultStatusEnum_VALIDATING;
    case 'VALIDATED':
      return _$migrationBatchResultStatusEnum_VALIDATED;
    case 'APPLYING':
      return _$migrationBatchResultStatusEnum_APPLYING;
    case 'APPLIED':
      return _$migrationBatchResultStatusEnum_APPLIED;
    case 'RECONCILING':
      return _$migrationBatchResultStatusEnum_RECONCILING;
    case 'RECONCILED':
      return _$migrationBatchResultStatusEnum_RECONCILED;
    case 'ROLLING_BACK':
      return _$migrationBatchResultStatusEnum_ROLLING_BACK;
    case 'ROLLED_BACK':
      return _$migrationBatchResultStatusEnum_ROLLED_BACK;
    case 'FAILED':
      return _$migrationBatchResultStatusEnum_FAILED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<MigrationBatchResultStatusEnum>
_$migrationBatchResultStatusEnumValues =
    BuiltSet<MigrationBatchResultStatusEnum>(
      const <MigrationBatchResultStatusEnum>[
        _$migrationBatchResultStatusEnum_DRAFT,
        _$migrationBatchResultStatusEnum_VALIDATING,
        _$migrationBatchResultStatusEnum_VALIDATED,
        _$migrationBatchResultStatusEnum_APPLYING,
        _$migrationBatchResultStatusEnum_APPLIED,
        _$migrationBatchResultStatusEnum_RECONCILING,
        _$migrationBatchResultStatusEnum_RECONCILED,
        _$migrationBatchResultStatusEnum_ROLLING_BACK,
        _$migrationBatchResultStatusEnum_ROLLED_BACK,
        _$migrationBatchResultStatusEnum_FAILED,
      ],
    );

Serializer<MigrationBatchResultStatusEnum>
_$migrationBatchResultStatusEnumSerializer =
    _$MigrationBatchResultStatusEnumSerializer();

class _$MigrationBatchResultStatusEnumSerializer
    implements PrimitiveSerializer<MigrationBatchResultStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'DRAFT': 'DRAFT',
    'VALIDATING': 'VALIDATING',
    'VALIDATED': 'VALIDATED',
    'APPLYING': 'APPLYING',
    'APPLIED': 'APPLIED',
    'RECONCILING': 'RECONCILING',
    'RECONCILED': 'RECONCILED',
    'ROLLING_BACK': 'ROLLING_BACK',
    'ROLLED_BACK': 'ROLLED_BACK',
    'FAILED': 'FAILED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'DRAFT': 'DRAFT',
    'VALIDATING': 'VALIDATING',
    'VALIDATED': 'VALIDATED',
    'APPLYING': 'APPLYING',
    'APPLIED': 'APPLIED',
    'RECONCILING': 'RECONCILING',
    'RECONCILED': 'RECONCILED',
    'ROLLING_BACK': 'ROLLING_BACK',
    'ROLLED_BACK': 'ROLLED_BACK',
    'FAILED': 'FAILED',
  };

  @override
  final Iterable<Type> types = const <Type>[MigrationBatchResultStatusEnum];
  @override
  final String wireName = 'MigrationBatchResultStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    MigrationBatchResultStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  MigrationBatchResultStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => MigrationBatchResultStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$MigrationBatchResult extends MigrationBatchResult {
  @override
  final String id;
  @override
  final MigrationBatchResultStatusEnum status;
  @override
  final String sourceChecksum;
  @override
  final String mappingVersion;
  @override
  final MigrationControlTotals totals;
  @override
  final String? exceptionArtifactId;
  @override
  final int version;
  @override
  final bool idempotentReplay;

  factory _$MigrationBatchResult([
    void Function(MigrationBatchResultBuilder)? updates,
  ]) => (MigrationBatchResultBuilder()..update(updates))._build();

  _$MigrationBatchResult._({
    required this.id,
    required this.status,
    required this.sourceChecksum,
    required this.mappingVersion,
    required this.totals,
    this.exceptionArtifactId,
    required this.version,
    required this.idempotentReplay,
  }) : super._();
  @override
  MigrationBatchResult rebuild(
    void Function(MigrationBatchResultBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  MigrationBatchResultBuilder toBuilder() =>
      MigrationBatchResultBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MigrationBatchResult &&
        id == other.id &&
        status == other.status &&
        sourceChecksum == other.sourceChecksum &&
        mappingVersion == other.mappingVersion &&
        totals == other.totals &&
        exceptionArtifactId == other.exceptionArtifactId &&
        version == other.version &&
        idempotentReplay == other.idempotentReplay;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, sourceChecksum.hashCode);
    _$hash = $jc(_$hash, mappingVersion.hashCode);
    _$hash = $jc(_$hash, totals.hashCode);
    _$hash = $jc(_$hash, exceptionArtifactId.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jc(_$hash, idempotentReplay.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'MigrationBatchResult')
          ..add('id', id)
          ..add('status', status)
          ..add('sourceChecksum', sourceChecksum)
          ..add('mappingVersion', mappingVersion)
          ..add('totals', totals)
          ..add('exceptionArtifactId', exceptionArtifactId)
          ..add('version', version)
          ..add('idempotentReplay', idempotentReplay))
        .toString();
  }
}

class MigrationBatchResultBuilder
    implements Builder<MigrationBatchResult, MigrationBatchResultBuilder> {
  _$MigrationBatchResult? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  MigrationBatchResultStatusEnum? _status;
  MigrationBatchResultStatusEnum? get status => _$this._status;
  set status(MigrationBatchResultStatusEnum? status) => _$this._status = status;

  String? _sourceChecksum;
  String? get sourceChecksum => _$this._sourceChecksum;
  set sourceChecksum(String? sourceChecksum) =>
      _$this._sourceChecksum = sourceChecksum;

  String? _mappingVersion;
  String? get mappingVersion => _$this._mappingVersion;
  set mappingVersion(String? mappingVersion) =>
      _$this._mappingVersion = mappingVersion;

  MigrationControlTotalsBuilder? _totals;
  MigrationControlTotalsBuilder get totals =>
      _$this._totals ??= MigrationControlTotalsBuilder();
  set totals(MigrationControlTotalsBuilder? totals) => _$this._totals = totals;

  String? _exceptionArtifactId;
  String? get exceptionArtifactId => _$this._exceptionArtifactId;
  set exceptionArtifactId(String? exceptionArtifactId) =>
      _$this._exceptionArtifactId = exceptionArtifactId;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  bool? _idempotentReplay;
  bool? get idempotentReplay => _$this._idempotentReplay;
  set idempotentReplay(bool? idempotentReplay) =>
      _$this._idempotentReplay = idempotentReplay;

  MigrationBatchResultBuilder() {
    MigrationBatchResult._defaults(this);
  }

  MigrationBatchResultBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _status = $v.status;
      _sourceChecksum = $v.sourceChecksum;
      _mappingVersion = $v.mappingVersion;
      _totals = $v.totals.toBuilder();
      _exceptionArtifactId = $v.exceptionArtifactId;
      _version = $v.version;
      _idempotentReplay = $v.idempotentReplay;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MigrationBatchResult other) {
    _$v = other as _$MigrationBatchResult;
  }

  @override
  void update(void Function(MigrationBatchResultBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MigrationBatchResult build() => _build();

  _$MigrationBatchResult _build() {
    _$MigrationBatchResult _$result;
    try {
      _$result =
          _$v ??
          _$MigrationBatchResult._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'MigrationBatchResult',
              'id',
            ),
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'MigrationBatchResult',
              'status',
            ),
            sourceChecksum: BuiltValueNullFieldError.checkNotNull(
              sourceChecksum,
              r'MigrationBatchResult',
              'sourceChecksum',
            ),
            mappingVersion: BuiltValueNullFieldError.checkNotNull(
              mappingVersion,
              r'MigrationBatchResult',
              'mappingVersion',
            ),
            totals: totals.build(),
            exceptionArtifactId: exceptionArtifactId,
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'MigrationBatchResult',
              'version',
            ),
            idempotentReplay: BuiltValueNullFieldError.checkNotNull(
              idempotentReplay,
              r'MigrationBatchResult',
              'idempotentReplay',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'totals';
        totals.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'MigrationBatchResult',
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
