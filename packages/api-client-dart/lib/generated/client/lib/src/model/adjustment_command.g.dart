// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'adjustment_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AdjustmentCommand extends AdjustmentCommand {
  @override
  final String customerPackageId;
  @override
  final int quantity;
  @override
  final String reason;

  factory _$AdjustmentCommand([
    void Function(AdjustmentCommandBuilder)? updates,
  ]) => (AdjustmentCommandBuilder()..update(updates))._build();

  _$AdjustmentCommand._({
    required this.customerPackageId,
    required this.quantity,
    required this.reason,
  }) : super._();
  @override
  AdjustmentCommand rebuild(void Function(AdjustmentCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AdjustmentCommandBuilder toBuilder() =>
      AdjustmentCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AdjustmentCommand &&
        customerPackageId == other.customerPackageId &&
        quantity == other.quantity &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, customerPackageId.hashCode);
    _$hash = $jc(_$hash, quantity.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AdjustmentCommand')
          ..add('customerPackageId', customerPackageId)
          ..add('quantity', quantity)
          ..add('reason', reason))
        .toString();
  }
}

class AdjustmentCommandBuilder
    implements Builder<AdjustmentCommand, AdjustmentCommandBuilder> {
  _$AdjustmentCommand? _$v;

  String? _customerPackageId;
  String? get customerPackageId => _$this._customerPackageId;
  set customerPackageId(String? customerPackageId) =>
      _$this._customerPackageId = customerPackageId;

  int? _quantity;
  int? get quantity => _$this._quantity;
  set quantity(int? quantity) => _$this._quantity = quantity;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  AdjustmentCommandBuilder() {
    AdjustmentCommand._defaults(this);
  }

  AdjustmentCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _customerPackageId = $v.customerPackageId;
      _quantity = $v.quantity;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AdjustmentCommand other) {
    _$v = other as _$AdjustmentCommand;
  }

  @override
  void update(void Function(AdjustmentCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AdjustmentCommand build() => _build();

  _$AdjustmentCommand _build() {
    final _$result =
        _$v ??
        _$AdjustmentCommand._(
          customerPackageId: BuiltValueNullFieldError.checkNotNull(
            customerPackageId,
            r'AdjustmentCommand',
            'customerPackageId',
          ),
          quantity: BuiltValueNullFieldError.checkNotNull(
            quantity,
            r'AdjustmentCommand',
            'quantity',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'AdjustmentCommand',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
