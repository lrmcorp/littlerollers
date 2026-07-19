// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'branch_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BranchPage extends BranchPage {
  @override
  final BuiltList<Branch> items;
  @override
  final CursorPageMeta page;

  factory _$BranchPage([void Function(BranchPageBuilder)? updates]) =>
      (BranchPageBuilder()..update(updates))._build();

  _$BranchPage._({required this.items, required this.page}) : super._();
  @override
  BranchPage rebuild(void Function(BranchPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  BranchPageBuilder toBuilder() => BranchPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BranchPage && items == other.items && page == other.page;
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
    return (newBuiltValueToStringHelper(r'BranchPage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class BranchPageBuilder implements Builder<BranchPage, BranchPageBuilder> {
  _$BranchPage? _$v;

  ListBuilder<Branch>? _items;
  ListBuilder<Branch> get items => _$this._items ??= ListBuilder<Branch>();
  set items(ListBuilder<Branch>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  BranchPageBuilder() {
    BranchPage._defaults(this);
  }

  BranchPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BranchPage other) {
    _$v = other as _$BranchPage;
  }

  @override
  void update(void Function(BranchPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BranchPage build() => _build();

  _$BranchPage _build() {
    _$BranchPage _$result;
    try {
      _$result =
          _$v ?? _$BranchPage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'BranchPage',
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
