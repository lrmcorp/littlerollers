// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'instructor_fee_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$InstructorFeeCommand extends InstructorFeeCommand {
  @override
  final String branchId;
  @override
  final String reason;
  @override
  final JsonObject? kind;
  @override
  final int feeRp;
  @override
  final String instructorUserId;
  @override
  final String classTypeId;
  @override
  final Date effectiveFrom;
  @override
  final Date? effectiveUntil;

  factory _$InstructorFeeCommand([
    void Function(InstructorFeeCommandBuilder)? updates,
  ]) => (InstructorFeeCommandBuilder()..update(updates))._build();

  _$InstructorFeeCommand._({
    required this.branchId,
    required this.reason,
    this.kind,
    required this.feeRp,
    required this.instructorUserId,
    required this.classTypeId,
    required this.effectiveFrom,
    this.effectiveUntil,
  }) : super._();
  @override
  InstructorFeeCommand rebuild(
    void Function(InstructorFeeCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  InstructorFeeCommandBuilder toBuilder() =>
      InstructorFeeCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is InstructorFeeCommand &&
        branchId == other.branchId &&
        reason == other.reason &&
        kind == other.kind &&
        feeRp == other.feeRp &&
        instructorUserId == other.instructorUserId &&
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
    _$hash = $jc(_$hash, feeRp.hashCode);
    _$hash = $jc(_$hash, instructorUserId.hashCode);
    _$hash = $jc(_$hash, classTypeId.hashCode);
    _$hash = $jc(_$hash, effectiveFrom.hashCode);
    _$hash = $jc(_$hash, effectiveUntil.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'InstructorFeeCommand')
          ..add('branchId', branchId)
          ..add('reason', reason)
          ..add('kind', kind)
          ..add('feeRp', feeRp)
          ..add('instructorUserId', instructorUserId)
          ..add('classTypeId', classTypeId)
          ..add('effectiveFrom', effectiveFrom)
          ..add('effectiveUntil', effectiveUntil))
        .toString();
  }
}

class InstructorFeeCommandBuilder
    implements
        Builder<InstructorFeeCommand, InstructorFeeCommandBuilder>,
        EffectivePeriodBuilder {
  _$InstructorFeeCommand? _$v;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(covariant String? branchId) => _$this._branchId = branchId;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(covariant String? reason) => _$this._reason = reason;

  JsonObject? _kind;
  JsonObject? get kind => _$this._kind;
  set kind(covariant JsonObject? kind) => _$this._kind = kind;

  int? _feeRp;
  int? get feeRp => _$this._feeRp;
  set feeRp(covariant int? feeRp) => _$this._feeRp = feeRp;

  String? _instructorUserId;
  String? get instructorUserId => _$this._instructorUserId;
  set instructorUserId(covariant String? instructorUserId) =>
      _$this._instructorUserId = instructorUserId;

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

  InstructorFeeCommandBuilder() {
    InstructorFeeCommand._defaults(this);
  }

  InstructorFeeCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branchId = $v.branchId;
      _reason = $v.reason;
      _kind = $v.kind;
      _feeRp = $v.feeRp;
      _instructorUserId = $v.instructorUserId;
      _classTypeId = $v.classTypeId;
      _effectiveFrom = $v.effectiveFrom;
      _effectiveUntil = $v.effectiveUntil;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant InstructorFeeCommand other) {
    _$v = other as _$InstructorFeeCommand;
  }

  @override
  void update(void Function(InstructorFeeCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  InstructorFeeCommand build() => _build();

  _$InstructorFeeCommand _build() {
    final _$result =
        _$v ??
        _$InstructorFeeCommand._(
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'InstructorFeeCommand',
            'branchId',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'InstructorFeeCommand',
            'reason',
          ),
          kind: kind,
          feeRp: BuiltValueNullFieldError.checkNotNull(
            feeRp,
            r'InstructorFeeCommand',
            'feeRp',
          ),
          instructorUserId: BuiltValueNullFieldError.checkNotNull(
            instructorUserId,
            r'InstructorFeeCommand',
            'instructorUserId',
          ),
          classTypeId: BuiltValueNullFieldError.checkNotNull(
            classTypeId,
            r'InstructorFeeCommand',
            'classTypeId',
          ),
          effectiveFrom: BuiltValueNullFieldError.checkNotNull(
            effectiveFrom,
            r'InstructorFeeCommand',
            'effectiveFrom',
          ),
          effectiveUntil: effectiveUntil,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
