// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'purchase_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PurchasePage extends PurchasePage {
  @override
  final BuiltList<Purchase> items;
  @override
  final CursorPageMeta page;

  factory _$PurchasePage([void Function(PurchasePageBuilder)? updates]) =>
      (PurchasePageBuilder()..update(updates))._build();

  _$PurchasePage._({required this.items, required this.page}) : super._();
  @override
  PurchasePage rebuild(void Function(PurchasePageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PurchasePageBuilder toBuilder() => PurchasePageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PurchasePage && items == other.items && page == other.page;
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
    return (newBuiltValueToStringHelper(r'PurchasePage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class PurchasePageBuilder
    implements Builder<PurchasePage, PurchasePageBuilder> {
  _$PurchasePage? _$v;

  ListBuilder<Purchase>? _items;
  ListBuilder<Purchase> get items => _$this._items ??= ListBuilder<Purchase>();
  set items(ListBuilder<Purchase>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  PurchasePageBuilder() {
    PurchasePage._defaults(this);
  }

  PurchasePageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PurchasePage other) {
    _$v = other as _$PurchasePage;
  }

  @override
  void update(void Function(PurchasePageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PurchasePage build() => _build();

  _$PurchasePage _build() {
    _$PurchasePage _$result;
    try {
      _$result =
          _$v ?? _$PurchasePage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PurchasePage',
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
