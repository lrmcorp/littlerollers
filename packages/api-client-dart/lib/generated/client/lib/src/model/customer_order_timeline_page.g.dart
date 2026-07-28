// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_order_timeline_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CustomerOrderTimelinePage extends CustomerOrderTimelinePage {
  @override
  final BuiltList<CustomerOrderTimelineItem> items;
  @override
  final CursorPageMeta page;

  factory _$CustomerOrderTimelinePage([
    void Function(CustomerOrderTimelinePageBuilder)? updates,
  ]) => (CustomerOrderTimelinePageBuilder()..update(updates))._build();

  _$CustomerOrderTimelinePage._({required this.items, required this.page})
    : super._();
  @override
  CustomerOrderTimelinePage rebuild(
    void Function(CustomerOrderTimelinePageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerOrderTimelinePageBuilder toBuilder() =>
      CustomerOrderTimelinePageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerOrderTimelinePage &&
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
    return (newBuiltValueToStringHelper(r'CustomerOrderTimelinePage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class CustomerOrderTimelinePageBuilder
    implements
        Builder<CustomerOrderTimelinePage, CustomerOrderTimelinePageBuilder> {
  _$CustomerOrderTimelinePage? _$v;

  ListBuilder<CustomerOrderTimelineItem>? _items;
  ListBuilder<CustomerOrderTimelineItem> get items =>
      _$this._items ??= ListBuilder<CustomerOrderTimelineItem>();
  set items(ListBuilder<CustomerOrderTimelineItem>? items) =>
      _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  CustomerOrderTimelinePageBuilder() {
    CustomerOrderTimelinePage._defaults(this);
  }

  CustomerOrderTimelinePageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerOrderTimelinePage other) {
    _$v = other as _$CustomerOrderTimelinePage;
  }

  @override
  void update(void Function(CustomerOrderTimelinePageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerOrderTimelinePage build() => _build();

  _$CustomerOrderTimelinePage _build() {
    _$CustomerOrderTimelinePage _$result;
    try {
      _$result =
          _$v ??
          _$CustomerOrderTimelinePage._(
            items: items.build(),
            page: page.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'CustomerOrderTimelinePage',
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
