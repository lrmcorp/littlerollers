// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'lookup_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$LookupPage extends LookupPage {
  @override
  final BuiltList<LookupOption> items;
  @override
  final CursorPageMeta page;

  factory _$LookupPage([void Function(LookupPageBuilder)? updates]) =>
      (LookupPageBuilder()..update(updates))._build();

  _$LookupPage._({required this.items, required this.page}) : super._();
  @override
  LookupPage rebuild(void Function(LookupPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  LookupPageBuilder toBuilder() => LookupPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is LookupPage && items == other.items && page == other.page;
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
    return (newBuiltValueToStringHelper(r'LookupPage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class LookupPageBuilder implements Builder<LookupPage, LookupPageBuilder> {
  _$LookupPage? _$v;

  ListBuilder<LookupOption>? _items;
  ListBuilder<LookupOption> get items =>
      _$this._items ??= ListBuilder<LookupOption>();
  set items(ListBuilder<LookupOption>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  LookupPageBuilder() {
    LookupPage._defaults(this);
  }

  LookupPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(LookupPage other) {
    _$v = other as _$LookupPage;
  }

  @override
  void update(void Function(LookupPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  LookupPage build() => _build();

  _$LookupPage _build() {
    _$LookupPage _$result;
    try {
      _$result =
          _$v ?? _$LookupPage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'LookupPage',
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
