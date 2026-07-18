// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$Page extends Page {
  @override
  final BuiltList<Resource> items;
  @override
  final PagePage page;

  factory _$Page([void Function(PageBuilder)? updates]) =>
      (PageBuilder()..update(updates))._build();

  _$Page._({required this.items, required this.page}) : super._();
  @override
  Page rebuild(void Function(PageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PageBuilder toBuilder() => PageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Page && items == other.items && page == other.page;
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
    return (newBuiltValueToStringHelper(r'Page')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class PageBuilder implements Builder<Page, PageBuilder> {
  _$Page? _$v;

  ListBuilder<Resource>? _items;
  ListBuilder<Resource> get items => _$this._items ??= ListBuilder<Resource>();
  set items(ListBuilder<Resource>? items) => _$this._items = items;

  PagePageBuilder? _page;
  PagePageBuilder get page => _$this._page ??= PagePageBuilder();
  set page(PagePageBuilder? page) => _$this._page = page;

  PageBuilder() {
    Page._defaults(this);
  }

  PageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Page other) {
    _$v = other as _$Page;
  }

  @override
  void update(void Function(PageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Page build() => _build();

  _$Page _build() {
    _$Page _$result;
    try {
      _$result = _$v ?? _$Page._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(r'Page', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
