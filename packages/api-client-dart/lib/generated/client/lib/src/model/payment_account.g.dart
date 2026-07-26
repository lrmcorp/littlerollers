// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_account.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PaymentAccount extends PaymentAccount {
  @override
  final String id;
  @override
  final String branchId;
  @override
  final String bankCode;
  @override
  final String bankName;
  @override
  final String maskedAccountNumber;
  @override
  final String accountHolderName;
  @override
  final int paymentWindowHours;
  @override
  final bool active;
  @override
  final int version;

  factory _$PaymentAccount([void Function(PaymentAccountBuilder)? updates]) =>
      (PaymentAccountBuilder()..update(updates))._build();

  _$PaymentAccount._({
    required this.id,
    required this.branchId,
    required this.bankCode,
    required this.bankName,
    required this.maskedAccountNumber,
    required this.accountHolderName,
    required this.paymentWindowHours,
    required this.active,
    required this.version,
  }) : super._();
  @override
  PaymentAccount rebuild(void Function(PaymentAccountBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PaymentAccountBuilder toBuilder() => PaymentAccountBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PaymentAccount &&
        id == other.id &&
        branchId == other.branchId &&
        bankCode == other.bankCode &&
        bankName == other.bankName &&
        maskedAccountNumber == other.maskedAccountNumber &&
        accountHolderName == other.accountHolderName &&
        paymentWindowHours == other.paymentWindowHours &&
        active == other.active &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, bankCode.hashCode);
    _$hash = $jc(_$hash, bankName.hashCode);
    _$hash = $jc(_$hash, maskedAccountNumber.hashCode);
    _$hash = $jc(_$hash, accountHolderName.hashCode);
    _$hash = $jc(_$hash, paymentWindowHours.hashCode);
    _$hash = $jc(_$hash, active.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PaymentAccount')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('bankCode', bankCode)
          ..add('bankName', bankName)
          ..add('maskedAccountNumber', maskedAccountNumber)
          ..add('accountHolderName', accountHolderName)
          ..add('paymentWindowHours', paymentWindowHours)
          ..add('active', active)
          ..add('version', version))
        .toString();
  }
}

class PaymentAccountBuilder
    implements Builder<PaymentAccount, PaymentAccountBuilder> {
  _$PaymentAccount? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _bankCode;
  String? get bankCode => _$this._bankCode;
  set bankCode(String? bankCode) => _$this._bankCode = bankCode;

  String? _bankName;
  String? get bankName => _$this._bankName;
  set bankName(String? bankName) => _$this._bankName = bankName;

  String? _maskedAccountNumber;
  String? get maskedAccountNumber => _$this._maskedAccountNumber;
  set maskedAccountNumber(String? maskedAccountNumber) =>
      _$this._maskedAccountNumber = maskedAccountNumber;

  String? _accountHolderName;
  String? get accountHolderName => _$this._accountHolderName;
  set accountHolderName(String? accountHolderName) =>
      _$this._accountHolderName = accountHolderName;

  int? _paymentWindowHours;
  int? get paymentWindowHours => _$this._paymentWindowHours;
  set paymentWindowHours(int? paymentWindowHours) =>
      _$this._paymentWindowHours = paymentWindowHours;

  bool? _active;
  bool? get active => _$this._active;
  set active(bool? active) => _$this._active = active;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  PaymentAccountBuilder() {
    PaymentAccount._defaults(this);
  }

  PaymentAccountBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchId = $v.branchId;
      _bankCode = $v.bankCode;
      _bankName = $v.bankName;
      _maskedAccountNumber = $v.maskedAccountNumber;
      _accountHolderName = $v.accountHolderName;
      _paymentWindowHours = $v.paymentWindowHours;
      _active = $v.active;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PaymentAccount other) {
    _$v = other as _$PaymentAccount;
  }

  @override
  void update(void Function(PaymentAccountBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PaymentAccount build() => _build();

  _$PaymentAccount _build() {
    final _$result =
        _$v ??
        _$PaymentAccount._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'PaymentAccount',
            'id',
          ),
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'PaymentAccount',
            'branchId',
          ),
          bankCode: BuiltValueNullFieldError.checkNotNull(
            bankCode,
            r'PaymentAccount',
            'bankCode',
          ),
          bankName: BuiltValueNullFieldError.checkNotNull(
            bankName,
            r'PaymentAccount',
            'bankName',
          ),
          maskedAccountNumber: BuiltValueNullFieldError.checkNotNull(
            maskedAccountNumber,
            r'PaymentAccount',
            'maskedAccountNumber',
          ),
          accountHolderName: BuiltValueNullFieldError.checkNotNull(
            accountHolderName,
            r'PaymentAccount',
            'accountHolderName',
          ),
          paymentWindowHours: BuiltValueNullFieldError.checkNotNull(
            paymentWindowHours,
            r'PaymentAccount',
            'paymentWindowHours',
          ),
          active: BuiltValueNullFieldError.checkNotNull(
            active,
            r'PaymentAccount',
            'active',
          ),
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'PaymentAccount',
            'version',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
