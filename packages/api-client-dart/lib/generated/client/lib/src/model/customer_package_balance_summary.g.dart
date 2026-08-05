// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_package_balance_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CustomerPackageBalanceSummary extends CustomerPackageBalanceSummary {
  @override
  final int packageCount;
  @override
  final int activePackageCount;
  @override
  final int ledgerBalance;
  @override
  final int reserved;
  @override
  final int available;
  @override
  final int usedSessions;
  @override
  final int reversedSessions;
  @override
  final int adjustmentDelta;
  @override
  final int expiringSoon;

  factory _$CustomerPackageBalanceSummary([
    void Function(CustomerPackageBalanceSummaryBuilder)? updates,
  ]) => (CustomerPackageBalanceSummaryBuilder()..update(updates))._build();

  _$CustomerPackageBalanceSummary._({
    required this.packageCount,
    required this.activePackageCount,
    required this.ledgerBalance,
    required this.reserved,
    required this.available,
    required this.usedSessions,
    required this.reversedSessions,
    required this.adjustmentDelta,
    required this.expiringSoon,
  }) : super._();
  @override
  CustomerPackageBalanceSummary rebuild(
    void Function(CustomerPackageBalanceSummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerPackageBalanceSummaryBuilder toBuilder() =>
      CustomerPackageBalanceSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerPackageBalanceSummary &&
        packageCount == other.packageCount &&
        activePackageCount == other.activePackageCount &&
        ledgerBalance == other.ledgerBalance &&
        reserved == other.reserved &&
        available == other.available &&
        usedSessions == other.usedSessions &&
        reversedSessions == other.reversedSessions &&
        adjustmentDelta == other.adjustmentDelta &&
        expiringSoon == other.expiringSoon;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, packageCount.hashCode);
    _$hash = $jc(_$hash, activePackageCount.hashCode);
    _$hash = $jc(_$hash, ledgerBalance.hashCode);
    _$hash = $jc(_$hash, reserved.hashCode);
    _$hash = $jc(_$hash, available.hashCode);
    _$hash = $jc(_$hash, usedSessions.hashCode);
    _$hash = $jc(_$hash, reversedSessions.hashCode);
    _$hash = $jc(_$hash, adjustmentDelta.hashCode);
    _$hash = $jc(_$hash, expiringSoon.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerPackageBalanceSummary')
          ..add('packageCount', packageCount)
          ..add('activePackageCount', activePackageCount)
          ..add('ledgerBalance', ledgerBalance)
          ..add('reserved', reserved)
          ..add('available', available)
          ..add('usedSessions', usedSessions)
          ..add('reversedSessions', reversedSessions)
          ..add('adjustmentDelta', adjustmentDelta)
          ..add('expiringSoon', expiringSoon))
        .toString();
  }
}

class CustomerPackageBalanceSummaryBuilder
    implements
        Builder<
          CustomerPackageBalanceSummary,
          CustomerPackageBalanceSummaryBuilder
        > {
  _$CustomerPackageBalanceSummary? _$v;

  int? _packageCount;
  int? get packageCount => _$this._packageCount;
  set packageCount(int? packageCount) => _$this._packageCount = packageCount;

  int? _activePackageCount;
  int? get activePackageCount => _$this._activePackageCount;
  set activePackageCount(int? activePackageCount) =>
      _$this._activePackageCount = activePackageCount;

  int? _ledgerBalance;
  int? get ledgerBalance => _$this._ledgerBalance;
  set ledgerBalance(int? ledgerBalance) =>
      _$this._ledgerBalance = ledgerBalance;

  int? _reserved;
  int? get reserved => _$this._reserved;
  set reserved(int? reserved) => _$this._reserved = reserved;

  int? _available;
  int? get available => _$this._available;
  set available(int? available) => _$this._available = available;

  int? _usedSessions;
  int? get usedSessions => _$this._usedSessions;
  set usedSessions(int? usedSessions) => _$this._usedSessions = usedSessions;

  int? _reversedSessions;
  int? get reversedSessions => _$this._reversedSessions;
  set reversedSessions(int? reversedSessions) =>
      _$this._reversedSessions = reversedSessions;

  int? _adjustmentDelta;
  int? get adjustmentDelta => _$this._adjustmentDelta;
  set adjustmentDelta(int? adjustmentDelta) =>
      _$this._adjustmentDelta = adjustmentDelta;

  int? _expiringSoon;
  int? get expiringSoon => _$this._expiringSoon;
  set expiringSoon(int? expiringSoon) => _$this._expiringSoon = expiringSoon;

  CustomerPackageBalanceSummaryBuilder() {
    CustomerPackageBalanceSummary._defaults(this);
  }

  CustomerPackageBalanceSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _packageCount = $v.packageCount;
      _activePackageCount = $v.activePackageCount;
      _ledgerBalance = $v.ledgerBalance;
      _reserved = $v.reserved;
      _available = $v.available;
      _usedSessions = $v.usedSessions;
      _reversedSessions = $v.reversedSessions;
      _adjustmentDelta = $v.adjustmentDelta;
      _expiringSoon = $v.expiringSoon;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerPackageBalanceSummary other) {
    _$v = other as _$CustomerPackageBalanceSummary;
  }

  @override
  void update(void Function(CustomerPackageBalanceSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerPackageBalanceSummary build() => _build();

  _$CustomerPackageBalanceSummary _build() {
    final _$result =
        _$v ??
        _$CustomerPackageBalanceSummary._(
          packageCount: BuiltValueNullFieldError.checkNotNull(
            packageCount,
            r'CustomerPackageBalanceSummary',
            'packageCount',
          ),
          activePackageCount: BuiltValueNullFieldError.checkNotNull(
            activePackageCount,
            r'CustomerPackageBalanceSummary',
            'activePackageCount',
          ),
          ledgerBalance: BuiltValueNullFieldError.checkNotNull(
            ledgerBalance,
            r'CustomerPackageBalanceSummary',
            'ledgerBalance',
          ),
          reserved: BuiltValueNullFieldError.checkNotNull(
            reserved,
            r'CustomerPackageBalanceSummary',
            'reserved',
          ),
          available: BuiltValueNullFieldError.checkNotNull(
            available,
            r'CustomerPackageBalanceSummary',
            'available',
          ),
          usedSessions: BuiltValueNullFieldError.checkNotNull(
            usedSessions,
            r'CustomerPackageBalanceSummary',
            'usedSessions',
          ),
          reversedSessions: BuiltValueNullFieldError.checkNotNull(
            reversedSessions,
            r'CustomerPackageBalanceSummary',
            'reversedSessions',
          ),
          adjustmentDelta: BuiltValueNullFieldError.checkNotNull(
            adjustmentDelta,
            r'CustomerPackageBalanceSummary',
            'adjustmentDelta',
          ),
          expiringSoon: BuiltValueNullFieldError.checkNotNull(
            expiringSoon,
            r'CustomerPackageBalanceSummary',
            'expiringSoon',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
