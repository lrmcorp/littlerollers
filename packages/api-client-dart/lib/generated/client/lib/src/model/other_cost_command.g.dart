// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'other_cost_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$OtherCostCommand extends OtherCostCommand {
  @override
  final String branchId;
  @override
  final String period;
  @override
  final String description;
  @override
  final int amountRp;
  @override
  final String? evidenceUploadId;

  factory _$OtherCostCommand([
    void Function(OtherCostCommandBuilder)? updates,
  ]) => (OtherCostCommandBuilder()..update(updates))._build();

  _$OtherCostCommand._({
    required this.branchId,
    required this.period,
    required this.description,
    required this.amountRp,
    this.evidenceUploadId,
  }) : super._();
  @override
  OtherCostCommand rebuild(void Function(OtherCostCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OtherCostCommandBuilder toBuilder() =>
      OtherCostCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OtherCostCommand &&
        branchId == other.branchId &&
        period == other.period &&
        description == other.description &&
        amountRp == other.amountRp &&
        evidenceUploadId == other.evidenceUploadId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, period.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, amountRp.hashCode);
    _$hash = $jc(_$hash, evidenceUploadId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'OtherCostCommand')
          ..add('branchId', branchId)
          ..add('period', period)
          ..add('description', description)
          ..add('amountRp', amountRp)
          ..add('evidenceUploadId', evidenceUploadId))
        .toString();
  }
}

class OtherCostCommandBuilder
    implements Builder<OtherCostCommand, OtherCostCommandBuilder> {
  _$OtherCostCommand? _$v;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _period;
  String? get period => _$this._period;
  set period(String? period) => _$this._period = period;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  int? _amountRp;
  int? get amountRp => _$this._amountRp;
  set amountRp(int? amountRp) => _$this._amountRp = amountRp;

  String? _evidenceUploadId;
  String? get evidenceUploadId => _$this._evidenceUploadId;
  set evidenceUploadId(String? evidenceUploadId) =>
      _$this._evidenceUploadId = evidenceUploadId;

  OtherCostCommandBuilder() {
    OtherCostCommand._defaults(this);
  }

  OtherCostCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branchId = $v.branchId;
      _period = $v.period;
      _description = $v.description;
      _amountRp = $v.amountRp;
      _evidenceUploadId = $v.evidenceUploadId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OtherCostCommand other) {
    _$v = other as _$OtherCostCommand;
  }

  @override
  void update(void Function(OtherCostCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OtherCostCommand build() => _build();

  _$OtherCostCommand _build() {
    final _$result =
        _$v ??
        _$OtherCostCommand._(
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'OtherCostCommand',
            'branchId',
          ),
          period: BuiltValueNullFieldError.checkNotNull(
            period,
            r'OtherCostCommand',
            'period',
          ),
          description: BuiltValueNullFieldError.checkNotNull(
            description,
            r'OtherCostCommand',
            'description',
          ),
          amountRp: BuiltValueNullFieldError.checkNotNull(
            amountRp,
            r'OtherCostCommand',
            'amountRp',
          ),
          evidenceUploadId: evidenceUploadId,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
