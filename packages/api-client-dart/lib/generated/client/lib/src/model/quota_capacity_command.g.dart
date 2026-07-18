// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quota_capacity_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$QuotaCapacityCommand extends QuotaCapacityCommand {
  @override
  final String branchId;
  @override
  final String reason;
  @override
  final JsonObject? kind;
  @override
  final int defaultCapacity;
  @override
  final int minimumQuota;
  @override
  final String classTypeId;
  @override
  final Date effectiveFrom;
  @override
  final Date? effectiveUntil;

  factory _$QuotaCapacityCommand([
    void Function(QuotaCapacityCommandBuilder)? updates,
  ]) => (QuotaCapacityCommandBuilder()..update(updates))._build();

  _$QuotaCapacityCommand._({
    required this.branchId,
    required this.reason,
    this.kind,
    required this.defaultCapacity,
    required this.minimumQuota,
    required this.classTypeId,
    required this.effectiveFrom,
    this.effectiveUntil,
  }) : super._();
  @override
  QuotaCapacityCommand rebuild(
    void Function(QuotaCapacityCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  QuotaCapacityCommandBuilder toBuilder() =>
      QuotaCapacityCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is QuotaCapacityCommand &&
        branchId == other.branchId &&
        reason == other.reason &&
        kind == other.kind &&
        defaultCapacity == other.defaultCapacity &&
        minimumQuota == other.minimumQuota &&
        classTypeId == other.classTypeId &&
        effectiveFrom == other.effectiveFrom &&
        effectiveUntil == other.effectiveUntil;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jc(_$hash, kind.hashCode);
    _$hash = $jc(_$hash, defaultCapacity.hashCode);
    _$hash = $jc(_$hash, minimumQuota.hashCode);
    _$hash = $jc(_$hash, classTypeId.hashCode);
    _$hash = $jc(_$hash, effectiveFrom.hashCode);
    _$hash = $jc(_$hash, effectiveUntil.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'QuotaCapacityCommand')
          ..add('branchId', branchId)
          ..add('reason', reason)
          ..add('kind', kind)
          ..add('defaultCapacity', defaultCapacity)
          ..add('minimumQuota', minimumQuota)
          ..add('classTypeId', classTypeId)
          ..add('effectiveFrom', effectiveFrom)
          ..add('effectiveUntil', effectiveUntil))
        .toString();
  }
}

class QuotaCapacityCommandBuilder
    implements
        Builder<QuotaCapacityCommand, QuotaCapacityCommandBuilder>,
        EffectivePeriodBuilder {
  _$QuotaCapacityCommand? _$v;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(covariant String? branchId) => _$this._branchId = branchId;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(covariant String? reason) => _$this._reason = reason;

  JsonObject? _kind;
  JsonObject? get kind => _$this._kind;
  set kind(covariant JsonObject? kind) => _$this._kind = kind;

  int? _defaultCapacity;
  int? get defaultCapacity => _$this._defaultCapacity;
  set defaultCapacity(covariant int? defaultCapacity) =>
      _$this._defaultCapacity = defaultCapacity;

  int? _minimumQuota;
  int? get minimumQuota => _$this._minimumQuota;
  set minimumQuota(covariant int? minimumQuota) =>
      _$this._minimumQuota = minimumQuota;

  String? _classTypeId;
  String? get classTypeId => _$this._classTypeId;
  set classTypeId(covariant String? classTypeId) =>
      _$this._classTypeId = classTypeId;

  Date? _effectiveFrom;
  Date? get effectiveFrom => _$this._effectiveFrom;
  set effectiveFrom(covariant Date? effectiveFrom) =>
      _$this._effectiveFrom = effectiveFrom;

  Date? _effectiveUntil;
  Date? get effectiveUntil => _$this._effectiveUntil;
  set effectiveUntil(covariant Date? effectiveUntil) =>
      _$this._effectiveUntil = effectiveUntil;

  QuotaCapacityCommandBuilder() {
    QuotaCapacityCommand._defaults(this);
  }

  QuotaCapacityCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branchId = $v.branchId;
      _reason = $v.reason;
      _kind = $v.kind;
      _defaultCapacity = $v.defaultCapacity;
      _minimumQuota = $v.minimumQuota;
      _classTypeId = $v.classTypeId;
      _effectiveFrom = $v.effectiveFrom;
      _effectiveUntil = $v.effectiveUntil;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant QuotaCapacityCommand other) {
    _$v = other as _$QuotaCapacityCommand;
  }

  @override
  void update(void Function(QuotaCapacityCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  QuotaCapacityCommand build() => _build();

  _$QuotaCapacityCommand _build() {
    final _$result =
        _$v ??
        _$QuotaCapacityCommand._(
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'QuotaCapacityCommand',
            'branchId',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'QuotaCapacityCommand',
            'reason',
          ),
          kind: kind,
          defaultCapacity: BuiltValueNullFieldError.checkNotNull(
            defaultCapacity,
            r'QuotaCapacityCommand',
            'defaultCapacity',
          ),
          minimumQuota: BuiltValueNullFieldError.checkNotNull(
            minimumQuota,
            r'QuotaCapacityCommand',
            'minimumQuota',
          ),
          classTypeId: BuiltValueNullFieldError.checkNotNull(
            classTypeId,
            r'QuotaCapacityCommand',
            'classTypeId',
          ),
          effectiveFrom: BuiltValueNullFieldError.checkNotNull(
            effectiveFrom,
            r'QuotaCapacityCommand',
            'effectiveFrom',
          ),
          effectiveUntil: effectiveUntil,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
