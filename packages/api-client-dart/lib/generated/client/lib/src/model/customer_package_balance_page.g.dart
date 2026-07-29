// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_package_balance_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CustomerPackageBalancePage extends CustomerPackageBalancePage {
  @override
  final BuiltList<CustomerPackageBalance> items;
  @override
  final CustomerPackageBalanceSummary summary;
  @override
  final CursorPageMeta page;

  factory _$CustomerPackageBalancePage([
    void Function(CustomerPackageBalancePageBuilder)? updates,
  ]) => (CustomerPackageBalancePageBuilder()..update(updates))._build();

  _$CustomerPackageBalancePage._({
    required this.items,
    required this.summary,
    required this.page,
  }) : super._();
  @override
  CustomerPackageBalancePage rebuild(
    void Function(CustomerPackageBalancePageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerPackageBalancePageBuilder toBuilder() =>
      CustomerPackageBalancePageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerPackageBalancePage &&
        items == other.items &&
        summary == other.summary &&
        page == other.page;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, summary.hashCode);
    _$hash = $jc(_$hash, page.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerPackageBalancePage')
          ..add('items', items)
          ..add('summary', summary)
          ..add('page', page))
        .toString();
  }
}

class CustomerPackageBalancePageBuilder
    implements
        Builder<CustomerPackageBalancePage, CustomerPackageBalancePageBuilder> {
  _$CustomerPackageBalancePage? _$v;

  ListBuilder<CustomerPackageBalance>? _items;
  ListBuilder<CustomerPackageBalance> get items =>
      _$this._items ??= ListBuilder<CustomerPackageBalance>();
  set items(ListBuilder<CustomerPackageBalance>? items) =>
      _$this._items = items;

  CustomerPackageBalanceSummaryBuilder? _summary;
  CustomerPackageBalanceSummaryBuilder get summary =>
      _$this._summary ??= CustomerPackageBalanceSummaryBuilder();
  set summary(CustomerPackageBalanceSummaryBuilder? summary) =>
      _$this._summary = summary;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  CustomerPackageBalancePageBuilder() {
    CustomerPackageBalancePage._defaults(this);
  }

  CustomerPackageBalancePageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _summary = $v.summary.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerPackageBalancePage other) {
    _$v = other as _$CustomerPackageBalancePage;
  }

  @override
  void update(void Function(CustomerPackageBalancePageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerPackageBalancePage build() => _build();

  _$CustomerPackageBalancePage _build() {
    _$CustomerPackageBalancePage _$result;
    try {
      _$result =
          _$v ??
          _$CustomerPackageBalancePage._(
            items: items.build(),
            summary: summary.build(),
            page: page.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'summary';
        summary.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'CustomerPackageBalancePage',
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
