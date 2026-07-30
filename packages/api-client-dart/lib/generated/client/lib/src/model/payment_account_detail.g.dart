// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_account_detail.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PaymentAccountDetail extends PaymentAccountDetail {
  @override
  final int purchaseCount;
  @override
  final PaymentAccountDetailAllOfBranch branch;
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

  factory _$PaymentAccountDetail([
    void Function(PaymentAccountDetailBuilder)? updates,
  ]) => (PaymentAccountDetailBuilder()..update(updates))._build();

  _$PaymentAccountDetail._({
    required this.purchaseCount,
    required this.branch,
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
  PaymentAccountDetail rebuild(
    void Function(PaymentAccountDetailBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PaymentAccountDetailBuilder toBuilder() =>
      PaymentAccountDetailBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PaymentAccountDetail &&
        purchaseCount == other.purchaseCount &&
        branch == other.branch &&
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
    _$hash = $jc(_$hash, purchaseCount.hashCode);
    _$hash = $jc(_$hash, branch.hashCode);
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
    return (newBuiltValueToStringHelper(r'PaymentAccountDetail')
          ..add('purchaseCount', purchaseCount)
          ..add('branch', branch)
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

class PaymentAccountDetailBuilder
    implements
        Builder<PaymentAccountDetail, PaymentAccountDetailBuilder>,
        PaymentAccountBuilder {
  _$PaymentAccountDetail? _$v;

  int? _purchaseCount;
  int? get purchaseCount => _$this._purchaseCount;
  set purchaseCount(covariant int? purchaseCount) =>
      _$this._purchaseCount = purchaseCount;

  PaymentAccountDetailAllOfBranchBuilder? _branch;
  PaymentAccountDetailAllOfBranchBuilder get branch =>
      _$this._branch ??= PaymentAccountDetailAllOfBranchBuilder();
  set branch(covariant PaymentAccountDetailAllOfBranchBuilder? branch) =>
      _$this._branch = branch;

  String? _id;
  String? get id => _$this._id;
  set id(covariant String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(covariant String? branchId) => _$this._branchId = branchId;

  String? _bankCode;
  String? get bankCode => _$this._bankCode;
  set bankCode(covariant String? bankCode) => _$this._bankCode = bankCode;

  String? _bankName;
  String? get bankName => _$this._bankName;
  set bankName(covariant String? bankName) => _$this._bankName = bankName;

  String? _maskedAccountNumber;
  String? get maskedAccountNumber => _$this._maskedAccountNumber;
  set maskedAccountNumber(covariant String? maskedAccountNumber) =>
      _$this._maskedAccountNumber = maskedAccountNumber;

  String? _accountHolderName;
  String? get accountHolderName => _$this._accountHolderName;
  set accountHolderName(covariant String? accountHolderName) =>
      _$this._accountHolderName = accountHolderName;

  int? _paymentWindowHours;
  int? get paymentWindowHours => _$this._paymentWindowHours;
  set paymentWindowHours(covariant int? paymentWindowHours) =>
      _$this._paymentWindowHours = paymentWindowHours;

  bool? _active;
  bool? get active => _$this._active;
  set active(covariant bool? active) => _$this._active = active;

  int? _version;
  int? get version => _$this._version;
  set version(covariant int? version) => _$this._version = version;

  PaymentAccountDetailBuilder() {
    PaymentAccountDetail._defaults(this);
  }

  PaymentAccountDetailBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _purchaseCount = $v.purchaseCount;
      _branch = $v.branch.toBuilder();
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
  void replace(covariant PaymentAccountDetail other) {
    _$v = other as _$PaymentAccountDetail;
  }

  @override
  void update(void Function(PaymentAccountDetailBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PaymentAccountDetail build() => _build();

  _$PaymentAccountDetail _build() {
    _$PaymentAccountDetail _$result;
    try {
      _$result =
          _$v ??
          _$PaymentAccountDetail._(
            purchaseCount: BuiltValueNullFieldError.checkNotNull(
              purchaseCount,
              r'PaymentAccountDetail',
              'purchaseCount',
            ),
            branch: branch.build(),
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'PaymentAccountDetail',
              'id',
            ),
            branchId: BuiltValueNullFieldError.checkNotNull(
              branchId,
              r'PaymentAccountDetail',
              'branchId',
            ),
            bankCode: BuiltValueNullFieldError.checkNotNull(
              bankCode,
              r'PaymentAccountDetail',
              'bankCode',
            ),
            bankName: BuiltValueNullFieldError.checkNotNull(
              bankName,
              r'PaymentAccountDetail',
              'bankName',
            ),
            maskedAccountNumber: BuiltValueNullFieldError.checkNotNull(
              maskedAccountNumber,
              r'PaymentAccountDetail',
              'maskedAccountNumber',
            ),
            accountHolderName: BuiltValueNullFieldError.checkNotNull(
              accountHolderName,
              r'PaymentAccountDetail',
              'accountHolderName',
            ),
            paymentWindowHours: BuiltValueNullFieldError.checkNotNull(
              paymentWindowHours,
              r'PaymentAccountDetail',
              'paymentWindowHours',
            ),
            active: BuiltValueNullFieldError.checkNotNull(
              active,
              r'PaymentAccountDetail',
              'active',
            ),
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'PaymentAccountDetail',
              'version',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'branch';
        branch.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PaymentAccountDetail',
          _$failedField,
          e.toString(),
        );
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
