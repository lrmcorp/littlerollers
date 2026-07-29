// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'voucher_redemption_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$VoucherRedemptionPage extends VoucherRedemptionPage {
  @override
  final JsonObject voucher;
  @override
  final BuiltList<VoucherRedemption> items;
  @override
  final CursorPageMeta page;

  factory _$VoucherRedemptionPage([
    void Function(VoucherRedemptionPageBuilder)? updates,
  ]) => (VoucherRedemptionPageBuilder()..update(updates))._build();

  _$VoucherRedemptionPage._({
    required this.voucher,
    required this.items,
    required this.page,
  }) : super._();
  @override
  VoucherRedemptionPage rebuild(
    void Function(VoucherRedemptionPageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  VoucherRedemptionPageBuilder toBuilder() =>
      VoucherRedemptionPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is VoucherRedemptionPage &&
        voucher == other.voucher &&
        items == other.items &&
        page == other.page;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, voucher.hashCode);
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, page.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'VoucherRedemptionPage')
          ..add('voucher', voucher)
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class VoucherRedemptionPageBuilder
    implements Builder<VoucherRedemptionPage, VoucherRedemptionPageBuilder> {
  _$VoucherRedemptionPage? _$v;

  JsonObject? _voucher;
  JsonObject? get voucher => _$this._voucher;
  set voucher(JsonObject? voucher) => _$this._voucher = voucher;

  ListBuilder<VoucherRedemption>? _items;
  ListBuilder<VoucherRedemption> get items =>
      _$this._items ??= ListBuilder<VoucherRedemption>();
  set items(ListBuilder<VoucherRedemption>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  VoucherRedemptionPageBuilder() {
    VoucherRedemptionPage._defaults(this);
  }

  VoucherRedemptionPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _voucher = $v.voucher;
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(VoucherRedemptionPage other) {
    _$v = other as _$VoucherRedemptionPage;
  }

  @override
  void update(void Function(VoucherRedemptionPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  VoucherRedemptionPage build() => _build();

  _$VoucherRedemptionPage _build() {
    _$VoucherRedemptionPage _$result;
    try {
      _$result =
          _$v ??
          _$VoucherRedemptionPage._(
            voucher: BuiltValueNullFieldError.checkNotNull(
              voucher,
              r'VoucherRedemptionPage',
              'voucher',
            ),
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
          r'VoucherRedemptionPage',
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
