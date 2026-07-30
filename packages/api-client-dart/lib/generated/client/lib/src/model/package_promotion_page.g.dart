// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'package_promotion_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PackagePromotionPage extends PackagePromotionPage {
  @override
  final BuiltList<PackagePromotion> items;
  @override
  final CursorPageMeta page;

  factory _$PackagePromotionPage([
    void Function(PackagePromotionPageBuilder)? updates,
  ]) => (PackagePromotionPageBuilder()..update(updates))._build();

  _$PackagePromotionPage._({required this.items, required this.page})
    : super._();
  @override
  PackagePromotionPage rebuild(
    void Function(PackagePromotionPageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PackagePromotionPageBuilder toBuilder() =>
      PackagePromotionPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PackagePromotionPage &&
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
    return (newBuiltValueToStringHelper(r'PackagePromotionPage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class PackagePromotionPageBuilder
    implements Builder<PackagePromotionPage, PackagePromotionPageBuilder> {
  _$PackagePromotionPage? _$v;

  ListBuilder<PackagePromotion>? _items;
  ListBuilder<PackagePromotion> get items =>
      _$this._items ??= ListBuilder<PackagePromotion>();
  set items(ListBuilder<PackagePromotion>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  PackagePromotionPageBuilder() {
    PackagePromotionPage._defaults(this);
  }

  PackagePromotionPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PackagePromotionPage other) {
    _$v = other as _$PackagePromotionPage;
  }

  @override
  void update(void Function(PackagePromotionPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PackagePromotionPage build() => _build();

  _$PackagePromotionPage _build() {
    _$PackagePromotionPage _$result;
    try {
      _$result =
          _$v ??
          _$PackagePromotionPage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PackagePromotionPage',
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
