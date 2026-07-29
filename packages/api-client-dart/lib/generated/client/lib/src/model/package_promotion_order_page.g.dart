// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'package_promotion_order_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PackagePromotionOrderPage extends PackagePromotionOrderPage {
  @override
  final BuiltList<PackagePromotionOrderPageItemsInner> items;
  @override
  final CursorPageMeta page;

  factory _$PackagePromotionOrderPage([
    void Function(PackagePromotionOrderPageBuilder)? updates,
  ]) => (PackagePromotionOrderPageBuilder()..update(updates))._build();

  _$PackagePromotionOrderPage._({required this.items, required this.page})
    : super._();
  @override
  PackagePromotionOrderPage rebuild(
    void Function(PackagePromotionOrderPageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PackagePromotionOrderPageBuilder toBuilder() =>
      PackagePromotionOrderPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PackagePromotionOrderPage &&
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
    return (newBuiltValueToStringHelper(r'PackagePromotionOrderPage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class PackagePromotionOrderPageBuilder
    implements
        Builder<PackagePromotionOrderPage, PackagePromotionOrderPageBuilder> {
  _$PackagePromotionOrderPage? _$v;

  ListBuilder<PackagePromotionOrderPageItemsInner>? _items;
  ListBuilder<PackagePromotionOrderPageItemsInner> get items =>
      _$this._items ??= ListBuilder<PackagePromotionOrderPageItemsInner>();
  set items(ListBuilder<PackagePromotionOrderPageItemsInner>? items) =>
      _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  PackagePromotionOrderPageBuilder() {
    PackagePromotionOrderPage._defaults(this);
  }

  PackagePromotionOrderPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PackagePromotionOrderPage other) {
    _$v = other as _$PackagePromotionOrderPage;
  }

  @override
  void update(void Function(PackagePromotionOrderPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PackagePromotionOrderPage build() => _build();

  _$PackagePromotionOrderPage _build() {
    _$PackagePromotionOrderPage _$result;
    try {
      _$result =
          _$v ??
          _$PackagePromotionOrderPage._(
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
          r'PackagePromotionOrderPage',
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
