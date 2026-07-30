// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'voucher_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$VoucherPage extends VoucherPage {
  @override
  final BuiltList<Voucher> items;
  @override
  final CursorPageMeta page;

  factory _$VoucherPage([void Function(VoucherPageBuilder)? updates]) =>
      (VoucherPageBuilder()..update(updates))._build();

  _$VoucherPage._({required this.items, required this.page}) : super._();
  @override
  VoucherPage rebuild(void Function(VoucherPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  VoucherPageBuilder toBuilder() => VoucherPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is VoucherPage && items == other.items && page == other.page;
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
    return (newBuiltValueToStringHelper(r'VoucherPage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class VoucherPageBuilder implements Builder<VoucherPage, VoucherPageBuilder> {
  _$VoucherPage? _$v;

  ListBuilder<Voucher>? _items;
  ListBuilder<Voucher> get items => _$this._items ??= ListBuilder<Voucher>();
  set items(ListBuilder<Voucher>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  VoucherPageBuilder() {
    VoucherPage._defaults(this);
  }

  VoucherPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(VoucherPage other) {
    _$v = other as _$VoucherPage;
  }

  @override
  void update(void Function(VoucherPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  VoucherPage build() => _build();

  _$VoucherPage _build() {
    _$VoucherPage _$result;
    try {
      _$result =
          _$v ?? _$VoucherPage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'VoucherPage',
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
