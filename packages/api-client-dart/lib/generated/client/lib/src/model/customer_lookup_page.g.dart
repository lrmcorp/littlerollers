// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_lookup_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CustomerLookupPage extends CustomerLookupPage {
  @override
  final BuiltList<CustomerLookupOption> items;
  @override
  final CursorPageMeta page;

  factory _$CustomerLookupPage([
    void Function(CustomerLookupPageBuilder)? updates,
  ]) => (CustomerLookupPageBuilder()..update(updates))._build();

  _$CustomerLookupPage._({required this.items, required this.page}) : super._();
  @override
  CustomerLookupPage rebuild(
    void Function(CustomerLookupPageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerLookupPageBuilder toBuilder() =>
      CustomerLookupPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerLookupPage &&
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
    return (newBuiltValueToStringHelper(r'CustomerLookupPage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class CustomerLookupPageBuilder
    implements Builder<CustomerLookupPage, CustomerLookupPageBuilder> {
  _$CustomerLookupPage? _$v;

  ListBuilder<CustomerLookupOption>? _items;
  ListBuilder<CustomerLookupOption> get items =>
      _$this._items ??= ListBuilder<CustomerLookupOption>();
  set items(ListBuilder<CustomerLookupOption>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  CustomerLookupPageBuilder() {
    CustomerLookupPage._defaults(this);
  }

  CustomerLookupPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerLookupPage other) {
    _$v = other as _$CustomerLookupPage;
  }

  @override
  void update(void Function(CustomerLookupPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerLookupPage build() => _build();

  _$CustomerLookupPage _build() {
    _$CustomerLookupPage _$result;
    try {
      _$result =
          _$v ??
          _$CustomerLookupPage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'CustomerLookupPage',
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
