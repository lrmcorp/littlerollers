// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'correction_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CorrectionCommand extends CorrectionCommand {
  @override
  final String branchId;
  @override
  final String currentPeriod;
  @override
  final String referencePeriod;
  @override
  final int amountRp;
  @override
  final String reason;

  factory _$CorrectionCommand([
    void Function(CorrectionCommandBuilder)? updates,
  ]) => (CorrectionCommandBuilder()..update(updates))._build();

  _$CorrectionCommand._({
    required this.branchId,
    required this.currentPeriod,
    required this.referencePeriod,
    required this.amountRp,
    required this.reason,
  }) : super._();
  @override
  CorrectionCommand rebuild(void Function(CorrectionCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CorrectionCommandBuilder toBuilder() =>
      CorrectionCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CorrectionCommand &&
        branchId == other.branchId &&
        currentPeriod == other.currentPeriod &&
        referencePeriod == other.referencePeriod &&
        amountRp == other.amountRp &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, currentPeriod.hashCode);
    _$hash = $jc(_$hash, referencePeriod.hashCode);
    _$hash = $jc(_$hash, amountRp.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CorrectionCommand')
          ..add('branchId', branchId)
          ..add('currentPeriod', currentPeriod)
          ..add('referencePeriod', referencePeriod)
          ..add('amountRp', amountRp)
          ..add('reason', reason))
        .toString();
  }
}

class CorrectionCommandBuilder
    implements Builder<CorrectionCommand, CorrectionCommandBuilder> {
  _$CorrectionCommand? _$v;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _currentPeriod;
  String? get currentPeriod => _$this._currentPeriod;
  set currentPeriod(String? currentPeriod) =>
      _$this._currentPeriod = currentPeriod;

  String? _referencePeriod;
  String? get referencePeriod => _$this._referencePeriod;
  set referencePeriod(String? referencePeriod) =>
      _$this._referencePeriod = referencePeriod;

  int? _amountRp;
  int? get amountRp => _$this._amountRp;
  set amountRp(int? amountRp) => _$this._amountRp = amountRp;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  CorrectionCommandBuilder() {
    CorrectionCommand._defaults(this);
  }

  CorrectionCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branchId = $v.branchId;
      _currentPeriod = $v.currentPeriod;
      _referencePeriod = $v.referencePeriod;
      _amountRp = $v.amountRp;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CorrectionCommand other) {
    _$v = other as _$CorrectionCommand;
  }

  @override
  void update(void Function(CorrectionCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CorrectionCommand build() => _build();

  _$CorrectionCommand _build() {
    final _$result =
        _$v ??
        _$CorrectionCommand._(
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'CorrectionCommand',
            'branchId',
          ),
          currentPeriod: BuiltValueNullFieldError.checkNotNull(
            currentPeriod,
            r'CorrectionCommand',
            'currentPeriod',
          ),
          referencePeriod: BuiltValueNullFieldError.checkNotNull(
            referencePeriod,
            r'CorrectionCommand',
            'referencePeriod',
          ),
          amountRp: BuiltValueNullFieldError.checkNotNull(
            amountRp,
            r'CorrectionCommand',
            'amountRp',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'CorrectionCommand',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
