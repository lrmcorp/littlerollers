// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'approval_result.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ApprovalResult extends ApprovalResult {
  @override
  final Purchase purchase;
  @override
  final CustomerPackageBalance customerPackage;
  @override
  final LedgerEntry ledgerEntry;
  @override
  final bool idempotentReplay;

  factory _$ApprovalResult([void Function(ApprovalResultBuilder)? updates]) =>
      (ApprovalResultBuilder()..update(updates))._build();

  _$ApprovalResult._({
    required this.purchase,
    required this.customerPackage,
    required this.ledgerEntry,
    required this.idempotentReplay,
  }) : super._();
  @override
  ApprovalResult rebuild(void Function(ApprovalResultBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ApprovalResultBuilder toBuilder() => ApprovalResultBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ApprovalResult &&
        purchase == other.purchase &&
        customerPackage == other.customerPackage &&
        ledgerEntry == other.ledgerEntry &&
        idempotentReplay == other.idempotentReplay;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, purchase.hashCode);
    _$hash = $jc(_$hash, customerPackage.hashCode);
    _$hash = $jc(_$hash, ledgerEntry.hashCode);
    _$hash = $jc(_$hash, idempotentReplay.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ApprovalResult')
          ..add('purchase', purchase)
          ..add('customerPackage', customerPackage)
          ..add('ledgerEntry', ledgerEntry)
          ..add('idempotentReplay', idempotentReplay))
        .toString();
  }
}

class ApprovalResultBuilder
    implements Builder<ApprovalResult, ApprovalResultBuilder> {
  _$ApprovalResult? _$v;

  PurchaseBuilder? _purchase;
  PurchaseBuilder get purchase => _$this._purchase ??= PurchaseBuilder();
  set purchase(PurchaseBuilder? purchase) => _$this._purchase = purchase;

  CustomerPackageBalanceBuilder? _customerPackage;
  CustomerPackageBalanceBuilder get customerPackage =>
      _$this._customerPackage ??= CustomerPackageBalanceBuilder();
  set customerPackage(CustomerPackageBalanceBuilder? customerPackage) =>
      _$this._customerPackage = customerPackage;

  LedgerEntryBuilder? _ledgerEntry;
  LedgerEntryBuilder get ledgerEntry =>
      _$this._ledgerEntry ??= LedgerEntryBuilder();
  set ledgerEntry(LedgerEntryBuilder? ledgerEntry) =>
      _$this._ledgerEntry = ledgerEntry;

  bool? _idempotentReplay;
  bool? get idempotentReplay => _$this._idempotentReplay;
  set idempotentReplay(bool? idempotentReplay) =>
      _$this._idempotentReplay = idempotentReplay;

  ApprovalResultBuilder() {
    ApprovalResult._defaults(this);
  }

  ApprovalResultBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _purchase = $v.purchase.toBuilder();
      _customerPackage = $v.customerPackage.toBuilder();
      _ledgerEntry = $v.ledgerEntry.toBuilder();
      _idempotentReplay = $v.idempotentReplay;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ApprovalResult other) {
    _$v = other as _$ApprovalResult;
  }

  @override
  void update(void Function(ApprovalResultBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ApprovalResult build() => _build();

  _$ApprovalResult _build() {
    _$ApprovalResult _$result;
    try {
      _$result =
          _$v ??
          _$ApprovalResult._(
            purchase: purchase.build(),
            customerPackage: customerPackage.build(),
            ledgerEntry: ledgerEntry.build(),
            idempotentReplay: BuiltValueNullFieldError.checkNotNull(
              idempotentReplay,
              r'ApprovalResult',
              'idempotentReplay',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'purchase';
        purchase.build();
        _$failedField = 'customerPackage';
        customerPackage.build();
        _$failedField = 'ledgerEntry';
        ledgerEntry.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'ApprovalResult',
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
