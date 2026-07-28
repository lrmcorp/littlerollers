// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_usage_history_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PaymentUsageHistoryPage extends PaymentUsageHistoryPage {
  @override
  final BuiltList<PaymentUsageHistoryItem> items;
  @override
  final CursorPageMeta page;

  factory _$PaymentUsageHistoryPage([
    void Function(PaymentUsageHistoryPageBuilder)? updates,
  ]) => (PaymentUsageHistoryPageBuilder()..update(updates))._build();

  _$PaymentUsageHistoryPage._({required this.items, required this.page})
    : super._();
  @override
  PaymentUsageHistoryPage rebuild(
    void Function(PaymentUsageHistoryPageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PaymentUsageHistoryPageBuilder toBuilder() =>
      PaymentUsageHistoryPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PaymentUsageHistoryPage &&
        items == other.items &&
        page == other.page;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, page.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PaymentUsageHistoryPage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class PaymentUsageHistoryPageBuilder
    implements
        Builder<PaymentUsageHistoryPage, PaymentUsageHistoryPageBuilder> {
  _$PaymentUsageHistoryPage? _$v;

  ListBuilder<PaymentUsageHistoryItem>? _items;
  ListBuilder<PaymentUsageHistoryItem> get items =>
      _$this._items ??= ListBuilder<PaymentUsageHistoryItem>();
  set items(ListBuilder<PaymentUsageHistoryItem>? items) =>
      _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  PaymentUsageHistoryPageBuilder() {
    PaymentUsageHistoryPage._defaults(this);
  }

  PaymentUsageHistoryPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PaymentUsageHistoryPage other) {
    _$v = other as _$PaymentUsageHistoryPage;
  }

  @override
  void update(void Function(PaymentUsageHistoryPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PaymentUsageHistoryPage build() => _build();

  _$PaymentUsageHistoryPage _build() {
    _$PaymentUsageHistoryPage _$result;
    try {
      _$result =
          _$v ??
          _$PaymentUsageHistoryPage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PaymentUsageHistoryPage',
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
