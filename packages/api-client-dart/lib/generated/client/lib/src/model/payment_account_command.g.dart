// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_account_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PaymentAccountCommand extends PaymentAccountCommand {
  @override
  final String branchId;
  @override
  final String bankCode;
  @override
  final String bankName;
  @override
  final String accountNumber;
  @override
  final String accountHolderName;
  @override
  final int paymentWindowHours;
  @override
  final String reason;

  factory _$PaymentAccountCommand([
    void Function(PaymentAccountCommandBuilder)? updates,
  ]) => (PaymentAccountCommandBuilder()..update(updates))._build();

  _$PaymentAccountCommand._({
    required this.branchId,
    required this.bankCode,
    required this.bankName,
    required this.accountNumber,
    required this.accountHolderName,
    required this.paymentWindowHours,
    required this.reason,
  }) : super._();
  @override
  PaymentAccountCommand rebuild(
    void Function(PaymentAccountCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PaymentAccountCommandBuilder toBuilder() =>
      PaymentAccountCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PaymentAccountCommand &&
        branchId == other.branchId &&
        bankCode == other.bankCode &&
        bankName == other.bankName &&
        accountNumber == other.accountNumber &&
        accountHolderName == other.accountHolderName &&
        paymentWindowHours == other.paymentWindowHours &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, bankCode.hashCode);
    _$hash = $jc(_$hash, bankName.hashCode);
    _$hash = $jc(_$hash, accountNumber.hashCode);
    _$hash = $jc(_$hash, accountHolderName.hashCode);
    _$hash = $jc(_$hash, paymentWindowHours.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PaymentAccountCommand')
          ..add('branchId', branchId)
          ..add('bankCode', bankCode)
          ..add('bankName', bankName)
          ..add('accountNumber', accountNumber)
          ..add('accountHolderName', accountHolderName)
          ..add('paymentWindowHours', paymentWindowHours)
          ..add('reason', reason))
        .toString();
  }
}

class PaymentAccountCommandBuilder
    implements Builder<PaymentAccountCommand, PaymentAccountCommandBuilder> {
  _$PaymentAccountCommand? _$v;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _bankCode;
  String? get bankCode => _$this._bankCode;
  set bankCode(String? bankCode) => _$this._bankCode = bankCode;

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

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  PaymentAccountCommandBuilder() {
    PaymentAccountCommand._defaults(this);
  }

  PaymentAccountCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branchId = $v.branchId;
      _bankCode = $v.bankCode;
      _bankName = $v.bankName;
      _accountNumber = $v.accountNumber;
      _accountHolderName = $v.accountHolderName;
      _paymentWindowHours = $v.paymentWindowHours;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PaymentAccountCommand other) {
    _$v = other as _$PaymentAccountCommand;
  }

  @override
  void update(void Function(PaymentAccountCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PaymentAccountCommand build() => _build();

  _$PaymentAccountCommand _build() {
    final _$result =
        _$v ??
        _$PaymentAccountCommand._(
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'PaymentAccountCommand',
            'branchId',
          ),
          bankCode: BuiltValueNullFieldError.checkNotNull(
            bankCode,
            r'PaymentAccountCommand',
            'bankCode',
          ),
          bankName: BuiltValueNullFieldError.checkNotNull(
            bankName,
            r'PaymentAccountCommand',
            'bankName',
          ),
          accountNumber: BuiltValueNullFieldError.checkNotNull(
            accountNumber,
            r'PaymentAccountCommand',
            'accountNumber',
          ),
          accountHolderName: BuiltValueNullFieldError.checkNotNull(
            accountHolderName,
            r'PaymentAccountCommand',
            'accountHolderName',
          ),
          paymentWindowHours: BuiltValueNullFieldError.checkNotNull(
            paymentWindowHours,
            r'PaymentAccountCommand',
            'paymentWindowHours',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'PaymentAccountCommand',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
