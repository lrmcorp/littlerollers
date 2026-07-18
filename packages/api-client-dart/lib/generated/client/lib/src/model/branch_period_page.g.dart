// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'branch_period_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BranchPeriodPage extends BranchPeriodPage {
  @override
  final BuiltList<BranchPeriod> items;
  @override
  final CursorPageMeta page;

  factory _$BranchPeriodPage([
    void Function(BranchPeriodPageBuilder)? updates,
  ]) => (BranchPeriodPageBuilder()..update(updates))._build();

  _$BranchPeriodPage._({required this.items, required this.page}) : super._();
  @override
  BranchPeriodPage rebuild(void Function(BranchPeriodPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  BranchPeriodPageBuilder toBuilder() =>
      BranchPeriodPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BranchPeriodPage &&
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
    return (newBuiltValueToStringHelper(r'BranchPeriodPage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class BranchPeriodPageBuilder
    implements Builder<BranchPeriodPage, BranchPeriodPageBuilder> {
  _$BranchPeriodPage? _$v;

  ListBuilder<BranchPeriod>? _items;
  ListBuilder<BranchPeriod> get items =>
      _$this._items ??= ListBuilder<BranchPeriod>();
  set items(ListBuilder<BranchPeriod>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  BranchPeriodPageBuilder() {
    BranchPeriodPage._defaults(this);
  }

  BranchPeriodPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BranchPeriodPage other) {
    _$v = other as _$BranchPeriodPage;
  }

  @override
  void update(void Function(BranchPeriodPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BranchPeriodPage build() => _build();

  _$BranchPeriodPage _build() {
    _$BranchPeriodPage _$result;
    try {
      _$result =
          _$v ?? _$BranchPeriodPage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'BranchPeriodPage',
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
