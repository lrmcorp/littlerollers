// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'checkout_options_payment_account.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CheckoutOptionsPaymentAccount extends CheckoutOptionsPaymentAccount {
  @override
  final String id;
  @override
  final String bankName;
  @override
  final String accountNumber;
  @override
  final String accountHolderName;
  @override
  final int paymentWindowHours;

  factory _$CheckoutOptionsPaymentAccount([
    void Function(CheckoutOptionsPaymentAccountBuilder)? updates,
  ]) => (CheckoutOptionsPaymentAccountBuilder()..update(updates))._build();

  _$CheckoutOptionsPaymentAccount._({
    required this.id,
    required this.bankName,
    required this.accountNumber,
    required this.accountHolderName,
    required this.paymentWindowHours,
  }) : super._();
  @override
  CheckoutOptionsPaymentAccount rebuild(
    void Function(CheckoutOptionsPaymentAccountBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CheckoutOptionsPaymentAccountBuilder toBuilder() =>
      CheckoutOptionsPaymentAccountBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CheckoutOptionsPaymentAccount &&
        id == other.id &&
        bankName == other.bankName &&
        accountNumber == other.accountNumber &&
        accountHolderName == other.accountHolderName &&
        paymentWindowHours == other.paymentWindowHours;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, bankName.hashCode);
    _$hash = $jc(_$hash, accountNumber.hashCode);
    _$hash = $jc(_$hash, accountHolderName.hashCode);
    _$hash = $jc(_$hash, paymentWindowHours.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CheckoutOptionsPaymentAccount')
          ..add('id', id)
          ..add('bankName', bankName)
          ..add('accountNumber', accountNumber)
          ..add('accountHolderName', accountHolderName)
          ..add('paymentWindowHours', paymentWindowHours))
        .toString();
  }
}

class CheckoutOptionsPaymentAccountBuilder
    implements
        Builder<
          CheckoutOptionsPaymentAccount,
          CheckoutOptionsPaymentAccountBuilder
        > {
  _$CheckoutOptionsPaymentAccount? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

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

  int? _paymentWindowHours;
  int? get paymentWindowHours => _$this._paymentWindowHours;
  set paymentWindowHours(int? paymentWindowHours) =>
      _$this._paymentWindowHours = paymentWindowHours;

  CheckoutOptionsPaymentAccountBuilder() {
    CheckoutOptionsPaymentAccount._defaults(this);
  }

  CheckoutOptionsPaymentAccountBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _bankName = $v.bankName;
      _accountNumber = $v.accountNumber;
      _accountHolderName = $v.accountHolderName;
      _paymentWindowHours = $v.paymentWindowHours;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CheckoutOptionsPaymentAccount other) {
    _$v = other as _$CheckoutOptionsPaymentAccount;
  }

  @override
  void update(void Function(CheckoutOptionsPaymentAccountBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CheckoutOptionsPaymentAccount build() => _build();

  _$CheckoutOptionsPaymentAccount _build() {
    final _$result =
        _$v ??
        _$CheckoutOptionsPaymentAccount._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'CheckoutOptionsPaymentAccount',
            'id',
          ),
          bankName: BuiltValueNullFieldError.checkNotNull(
            bankName,
            r'CheckoutOptionsPaymentAccount',
            'bankName',
          ),
          accountNumber: BuiltValueNullFieldError.checkNotNull(
            accountNumber,
            r'CheckoutOptionsPaymentAccount',
            'accountNumber',
          ),
          accountHolderName: BuiltValueNullFieldError.checkNotNull(
            accountHolderName,
            r'CheckoutOptionsPaymentAccount',
            'accountHolderName',
          ),
          paymentWindowHours: BuiltValueNullFieldError.checkNotNull(
            paymentWindowHours,
            r'CheckoutOptionsPaymentAccount',
            'paymentWindowHours',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
