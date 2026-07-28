// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$OrderPage extends OrderPage {
  @override
  final BuiltList<Order> items;
  @override
  final CustomerOrderSummary summary;
  @override
  final CursorPageMeta page;

  factory _$OrderPage([void Function(OrderPageBuilder)? updates]) =>
      (OrderPageBuilder()..update(updates))._build();

  _$OrderPage._({
    required this.items,
    required this.summary,
    required this.page,
  }) : super._();
  @override
  OrderPage rebuild(void Function(OrderPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OrderPageBuilder toBuilder() => OrderPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OrderPage &&
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
    return (newBuiltValueToStringHelper(r'OrderPage')
          ..add('items', items)
          ..add('summary', summary)
          ..add('page', page))
        .toString();
  }
}

class OrderPageBuilder implements Builder<OrderPage, OrderPageBuilder> {
  _$OrderPage? _$v;

  ListBuilder<Order>? _items;
  ListBuilder<Order> get items => _$this._items ??= ListBuilder<Order>();
  set items(ListBuilder<Order>? items) => _$this._items = items;

  CustomerOrderSummaryBuilder? _summary;
  CustomerOrderSummaryBuilder get summary =>
      _$this._summary ??= CustomerOrderSummaryBuilder();
  set summary(CustomerOrderSummaryBuilder? summary) =>
      _$this._summary = summary;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  OrderPageBuilder() {
    OrderPage._defaults(this);
  }

  OrderPageBuilder get _$this {
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
  void replace(OrderPage other) {
    _$v = other as _$OrderPage;
  }

  @override
  void update(void Function(OrderPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OrderPage build() => _build();

  _$OrderPage _build() {
    _$OrderPage _$result;
    try {
      _$result =
          _$v ??
          _$OrderPage._(
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
          r'OrderPage',
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
