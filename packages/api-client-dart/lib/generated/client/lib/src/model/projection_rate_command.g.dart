// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'projection_rate_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ProjectionRateCommand extends ProjectionRateCommand {
  @override
  final String branchId;
  @override
  final String reason;
  @override
  final JsonObject? kind;
  @override
  final int rateRp;
  @override
  final String classTypeId;
  @override
  final Date effectiveFrom;
  @override
  final Date? effectiveUntil;

  factory _$ProjectionRateCommand([
    void Function(ProjectionRateCommandBuilder)? updates,
  ]) => (ProjectionRateCommandBuilder()..update(updates))._build();

  _$ProjectionRateCommand._({
    required this.branchId,
    required this.reason,
    this.kind,
    required this.rateRp,
    required this.classTypeId,
    required this.effectiveFrom,
    this.effectiveUntil,
  }) : super._();
  @override
  ProjectionRateCommand rebuild(
    void Function(ProjectionRateCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  ProjectionRateCommandBuilder toBuilder() =>
      ProjectionRateCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ProjectionRateCommand &&
        branchId == other.branchId &&
        reason == other.reason &&
        kind == other.kind &&
        rateRp == other.rateRp &&
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
    _$hash = $jc(_$hash, rateRp.hashCode);
    _$hash = $jc(_$hash, classTypeId.hashCode);
    _$hash = $jc(_$hash, effectiveFrom.hashCode);
    _$hash = $jc(_$hash, effectiveUntil.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ProjectionRateCommand')
          ..add('branchId', branchId)
          ..add('reason', reason)
          ..add('kind', kind)
          ..add('rateRp', rateRp)
          ..add('classTypeId', classTypeId)
          ..add('effectiveFrom', effectiveFrom)
          ..add('effectiveUntil', effectiveUntil))
        .toString();
  }
}

class ProjectionRateCommandBuilder
    implements
        Builder<ProjectionRateCommand, ProjectionRateCommandBuilder>,
        EffectivePeriodBuilder {
  _$ProjectionRateCommand? _$v;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(covariant String? branchId) => _$this._branchId = branchId;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(covariant String? reason) => _$this._reason = reason;

  JsonObject? _kind;
  JsonObject? get kind => _$this._kind;
  set kind(covariant JsonObject? kind) => _$this._kind = kind;

  int? _rateRp;
  int? get rateRp => _$this._rateRp;
  set rateRp(covariant int? rateRp) => _$this._rateRp = rateRp;

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

  ProjectionRateCommandBuilder() {
    ProjectionRateCommand._defaults(this);
  }

  ProjectionRateCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branchId = $v.branchId;
      _reason = $v.reason;
      _kind = $v.kind;
      _rateRp = $v.rateRp;
      _classTypeId = $v.classTypeId;
      _effectiveFrom = $v.effectiveFrom;
      _effectiveUntil = $v.effectiveUntil;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant ProjectionRateCommand other) {
    _$v = other as _$ProjectionRateCommand;
  }

  @override
  void update(void Function(ProjectionRateCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ProjectionRateCommand build() => _build();

  _$ProjectionRateCommand _build() {
    final _$result =
        _$v ??
        _$ProjectionRateCommand._(
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'ProjectionRateCommand',
            'branchId',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'ProjectionRateCommand',
            'reason',
          ),
          kind: kind,
          rateRp: BuiltValueNullFieldError.checkNotNull(
            rateRp,
            r'ProjectionRateCommand',
            'rateRp',
          ),
          classTypeId: BuiltValueNullFieldError.checkNotNull(
            classTypeId,
            r'ProjectionRateCommand',
            'classTypeId',
          ),
          effectiveFrom: BuiltValueNullFieldError.checkNotNull(
            effectiveFrom,
            r'ProjectionRateCommand',
            'effectiveFrom',
          ),
          effectiveUntil: effectiveUntil,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
