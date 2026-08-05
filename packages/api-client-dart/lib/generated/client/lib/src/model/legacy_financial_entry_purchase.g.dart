// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'legacy_financial_entry_purchase.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$LegacyFinancialEntryPurchase extends LegacyFinancialEntryPurchase {
  @override
  final String? id;

  factory _$LegacyFinancialEntryPurchase([
    void Function(LegacyFinancialEntryPurchaseBuilder)? updates,
  ]) => (LegacyFinancialEntryPurchaseBuilder()..update(updates))._build();

  _$LegacyFinancialEntryPurchase._({this.id}) : super._();
  @override
  LegacyFinancialEntryPurchase rebuild(
    void Function(LegacyFinancialEntryPurchaseBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  LegacyFinancialEntryPurchaseBuilder toBuilder() =>
      LegacyFinancialEntryPurchaseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is LegacyFinancialEntryPurchase && id == other.id;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
      r'LegacyFinancialEntryPurchase',
    )..add('id', id)).toString();
  }
}

class LegacyFinancialEntryPurchaseBuilder
    implements
        Builder<
          LegacyFinancialEntryPurchase,
          LegacyFinancialEntryPurchaseBuilder
        > {
  _$LegacyFinancialEntryPurchase? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  LegacyFinancialEntryPurchaseBuilder() {
    LegacyFinancialEntryPurchase._defaults(this);
  }

  LegacyFinancialEntryPurchaseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(LegacyFinancialEntryPurchase other) {
    _$v = other as _$LegacyFinancialEntryPurchase;
  }

  @override
  void update(void Function(LegacyFinancialEntryPurchaseBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  LegacyFinancialEntryPurchase build() => _build();

  _$LegacyFinancialEntryPurchase _build() {
    final _$result = _$v ?? _$LegacyFinancialEntryPurchase._(id: id);
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
