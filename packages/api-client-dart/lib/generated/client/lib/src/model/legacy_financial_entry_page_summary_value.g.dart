// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'legacy_financial_entry_page_summary_value.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$LegacyFinancialEntryPageSummaryValue
    extends LegacyFinancialEntryPageSummaryValue {
  @override
  final int amountRp;
  @override
  final int count;

  factory _$LegacyFinancialEntryPageSummaryValue([
    void Function(LegacyFinancialEntryPageSummaryValueBuilder)? updates,
  ]) =>
      (LegacyFinancialEntryPageSummaryValueBuilder()..update(updates))._build();

  _$LegacyFinancialEntryPageSummaryValue._({
    required this.amountRp,
    required this.count,
  }) : super._();
  @override
  LegacyFinancialEntryPageSummaryValue rebuild(
    void Function(LegacyFinancialEntryPageSummaryValueBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  LegacyFinancialEntryPageSummaryValueBuilder toBuilder() =>
      LegacyFinancialEntryPageSummaryValueBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is LegacyFinancialEntryPageSummaryValue &&
        amountRp == other.amountRp &&
        count == other.count;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, amountRp.hashCode);
    _$hash = $jc(_$hash, count.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'LegacyFinancialEntryPageSummaryValue')
          ..add('amountRp', amountRp)
          ..add('count', count))
        .toString();
  }
}

class LegacyFinancialEntryPageSummaryValueBuilder
    implements
        Builder<
          LegacyFinancialEntryPageSummaryValue,
          LegacyFinancialEntryPageSummaryValueBuilder
        > {
  _$LegacyFinancialEntryPageSummaryValue? _$v;

  int? _amountRp;
  int? get amountRp => _$this._amountRp;
  set amountRp(int? amountRp) => _$this._amountRp = amountRp;

  int? _count;
  int? get count => _$this._count;
  set count(int? count) => _$this._count = count;

  LegacyFinancialEntryPageSummaryValueBuilder() {
    LegacyFinancialEntryPageSummaryValue._defaults(this);
  }

  LegacyFinancialEntryPageSummaryValueBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _amountRp = $v.amountRp;
      _count = $v.count;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(LegacyFinancialEntryPageSummaryValue other) {
    _$v = other as _$LegacyFinancialEntryPageSummaryValue;
  }

  @override
  void update(
    void Function(LegacyFinancialEntryPageSummaryValueBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  LegacyFinancialEntryPageSummaryValue build() => _build();

  _$LegacyFinancialEntryPageSummaryValue _build() {
    final _$result =
        _$v ??
        _$LegacyFinancialEntryPageSummaryValue._(
          amountRp: BuiltValueNullFieldError.checkNotNull(
            amountRp,
            r'LegacyFinancialEntryPageSummaryValue',
            'amountRp',
          ),
          count: BuiltValueNullFieldError.checkNotNull(
            count,
            r'LegacyFinancialEntryPageSummaryValue',
            'count',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
