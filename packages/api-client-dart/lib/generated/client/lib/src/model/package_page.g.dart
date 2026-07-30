// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'package_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PackagePage extends PackagePage {
  @override
  final BuiltList<Package> items;
  @override
  final PackageManagementSummary summary;
  @override
  final CursorPageMeta page;

  factory _$PackagePage([void Function(PackagePageBuilder)? updates]) =>
      (PackagePageBuilder()..update(updates))._build();

  _$PackagePage._({
    required this.items,
    required this.summary,
    required this.page,
  }) : super._();
  @override
  PackagePage rebuild(void Function(PackagePageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PackagePageBuilder toBuilder() => PackagePageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PackagePage &&
        items == other.items &&
        summary == other.summary &&
        page == other.page;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, summary.hashCode);
    _$hash = $jc(_$hash, page.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PackagePage')
          ..add('items', items)
          ..add('summary', summary)
          ..add('page', page))
        .toString();
  }
}

class PackagePageBuilder implements Builder<PackagePage, PackagePageBuilder> {
  _$PackagePage? _$v;

  ListBuilder<Package>? _items;
  ListBuilder<Package> get items => _$this._items ??= ListBuilder<Package>();
  set items(ListBuilder<Package>? items) => _$this._items = items;

  PackageManagementSummaryBuilder? _summary;
  PackageManagementSummaryBuilder get summary =>
      _$this._summary ??= PackageManagementSummaryBuilder();
  set summary(PackageManagementSummaryBuilder? summary) =>
      _$this._summary = summary;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  PackagePageBuilder() {
    PackagePage._defaults(this);
  }

  PackagePageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _summary = $v.summary.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PackagePage other) {
    _$v = other as _$PackagePage;
  }

  @override
  void update(void Function(PackagePageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PackagePage build() => _build();

  _$PackagePage _build() {
    _$PackagePage _$result;
    try {
      _$result =
          _$v ??
          _$PackagePage._(
            items: items.build(),
            summary: summary.build(),
            page: page.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'summary';
        summary.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PackagePage',
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
