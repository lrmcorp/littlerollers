// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'checkout_options.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CheckoutOptions extends CheckoutOptions {
  @override
  final CheckoutOptionsPackage package;
  @override
  final CheckoutOptionsPaymentAccount paymentAccount;

  factory _$CheckoutOptions([void Function(CheckoutOptionsBuilder)? updates]) =>
      (CheckoutOptionsBuilder()..update(updates))._build();

  _$CheckoutOptions._({required this.package, required this.paymentAccount})
    : super._();
  @override
  CheckoutOptions rebuild(void Function(CheckoutOptionsBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CheckoutOptionsBuilder toBuilder() => CheckoutOptionsBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CheckoutOptions &&
        package == other.package &&
        paymentAccount == other.paymentAccount;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, package.hashCode);
    _$hash = $jc(_$hash, paymentAccount.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CheckoutOptions')
          ..add('package', package)
          ..add('paymentAccount', paymentAccount))
        .toString();
  }
}

class CheckoutOptionsBuilder
    implements Builder<CheckoutOptions, CheckoutOptionsBuilder> {
  _$CheckoutOptions? _$v;

  CheckoutOptionsPackageBuilder? _package;
  CheckoutOptionsPackageBuilder get package =>
      _$this._package ??= CheckoutOptionsPackageBuilder();
  set package(CheckoutOptionsPackageBuilder? package) =>
      _$this._package = package;

  CheckoutOptionsPaymentAccountBuilder? _paymentAccount;
  CheckoutOptionsPaymentAccountBuilder get paymentAccount =>
      _$this._paymentAccount ??= CheckoutOptionsPaymentAccountBuilder();
  set paymentAccount(CheckoutOptionsPaymentAccountBuilder? paymentAccount) =>
      _$this._paymentAccount = paymentAccount;

  CheckoutOptionsBuilder() {
    CheckoutOptions._defaults(this);
  }

  CheckoutOptionsBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _package = $v.package.toBuilder();
      _paymentAccount = $v.paymentAccount.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CheckoutOptions other) {
    _$v = other as _$CheckoutOptions;
  }

  @override
  void update(void Function(CheckoutOptionsBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CheckoutOptions build() => _build();

  _$CheckoutOptions _build() {
    _$CheckoutOptions _$result;
    try {
      _$result =
          _$v ??
          _$CheckoutOptions._(
            package: package.build(),
            paymentAccount: paymentAccount.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'package';
        package.build();
        _$failedField = 'paymentAccount';
        paymentAccount.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'CheckoutOptions',
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
