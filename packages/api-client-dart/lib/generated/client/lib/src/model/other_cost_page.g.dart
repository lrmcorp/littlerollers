// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'other_cost_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$OtherCostPage extends OtherCostPage {
  @override
  final BuiltList<OtherCost> items;
  @override
  final CursorPageMeta page;

  factory _$OtherCostPage([void Function(OtherCostPageBuilder)? updates]) =>
      (OtherCostPageBuilder()..update(updates))._build();

  _$OtherCostPage._({required this.items, required this.page}) : super._();
  @override
  OtherCostPage rebuild(void Function(OtherCostPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OtherCostPageBuilder toBuilder() => OtherCostPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OtherCostPage && items == other.items && page == other.page;
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
    return (newBuiltValueToStringHelper(r'OtherCostPage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class OtherCostPageBuilder
    implements Builder<OtherCostPage, OtherCostPageBuilder> {
  _$OtherCostPage? _$v;

  ListBuilder<OtherCost>? _items;
  ListBuilder<OtherCost> get items =>
      _$this._items ??= ListBuilder<OtherCost>();
  set items(ListBuilder<OtherCost>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  OtherCostPageBuilder() {
    OtherCostPage._defaults(this);
  }

  OtherCostPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OtherCostPage other) {
    _$v = other as _$OtherCostPage;
  }

  @override
  void update(void Function(OtherCostPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OtherCostPage build() => _build();

  _$OtherCostPage _build() {
    _$OtherCostPage _$result;
    try {
      _$result =
          _$v ?? _$OtherCostPage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'OtherCostPage',
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
