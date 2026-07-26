// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_payment_account.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$OrderPaymentAccount extends OrderPaymentAccount {
  @override
  final String? bankName;
  @override
  final String? accountNumber;
  @override
  final String? accountHolderName;

  factory _$OrderPaymentAccount([
    void Function(OrderPaymentAccountBuilder)? updates,
  ]) => (OrderPaymentAccountBuilder()..update(updates))._build();

  _$OrderPaymentAccount._({
    this.bankName,
    this.accountNumber,
    this.accountHolderName,
  }) : super._();
  @override
  OrderPaymentAccount rebuild(
    void Function(OrderPaymentAccountBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  OrderPaymentAccountBuilder toBuilder() =>
      OrderPaymentAccountBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OrderPaymentAccount &&
        bankName == other.bankName &&
        accountNumber == other.accountNumber &&
        accountHolderName == other.accountHolderName;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, bankName.hashCode);
    _$hash = $jc(_$hash, accountNumber.hashCode);
    _$hash = $jc(_$hash, accountHolderName.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'OrderPaymentAccount')
          ..add('bankName', bankName)
          ..add('accountNumber', accountNumber)
          ..add('accountHolderName', accountHolderName))
        .toString();
  }
}

class OrderPaymentAccountBuilder
    implements Builder<OrderPaymentAccount, OrderPaymentAccountBuilder> {
  _$OrderPaymentAccount? _$v;

  String? _bankName;
  String? get bankName => _$this._bankName;
  set bankName(String? bankName) => _$this._bankName = bankName;

  String? _accountNumber;
  String? get accountNumber => _$this._accountNumber;
  set accountNumber(String? accountNumber) =>
      _$this._accountNumber = accountNumber;

  String? _accountHolderName;
  String? get accountHolderName => _$this._accountHolderName;
  set accountHolderName(String? accountHolderName) =>
      _$this._accountHolderName = accountHolderName;

  OrderPaymentAccountBuilder() {
    OrderPaymentAccount._defaults(this);
  }

  OrderPaymentAccountBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _bankName = $v.bankName;
      _accountNumber = $v.accountNumber;
      _accountHolderName = $v.accountHolderName;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OrderPaymentAccount other) {
    _$v = other as _$OrderPaymentAccount;
  }

  @override
  void update(void Function(OrderPaymentAccountBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OrderPaymentAccount build() => _build();

  _$OrderPaymentAccount _build() {
    final _$result =
        _$v ??
        _$OrderPaymentAccount._(
          bankName: bankName,
          accountNumber: accountNumber,
          accountHolderName: accountHolderName,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
