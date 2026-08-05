// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'legacy_financial_entry_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$LegacyFinancialEntryPage extends LegacyFinancialEntryPage {
  @override
  final BuiltList<LegacyFinancialEntry> items;
  @override
  final int total;
  @override
  final BuiltMap<String, LegacyFinancialEntryPageSummaryValue> summary;
  @override
  final CursorPageMeta page;

  factory _$LegacyFinancialEntryPage([
    void Function(LegacyFinancialEntryPageBuilder)? updates,
  ]) => (LegacyFinancialEntryPageBuilder()..update(updates))._build();

  _$LegacyFinancialEntryPage._({
    required this.items,
    required this.total,
    required this.summary,
    required this.page,
  }) : super._();
  @override
  LegacyFinancialEntryPage rebuild(
    void Function(LegacyFinancialEntryPageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  LegacyFinancialEntryPageBuilder toBuilder() =>
      LegacyFinancialEntryPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is LegacyFinancialEntryPage &&
        items == other.items &&
        total == other.total &&
        summary == other.summary &&
        page == other.page;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, total.hashCode);
    _$hash = $jc(_$hash, summary.hashCode);
    _$hash = $jc(_$hash, page.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'LegacyFinancialEntryPage')
          ..add('items', items)
          ..add('total', total)
          ..add('summary', summary)
          ..add('page', page))
        .toString();
  }
}

class LegacyFinancialEntryPageBuilder
    implements
        Builder<LegacyFinancialEntryPage, LegacyFinancialEntryPageBuilder> {
  _$LegacyFinancialEntryPage? _$v;

  ListBuilder<LegacyFinancialEntry>? _items;
  ListBuilder<LegacyFinancialEntry> get items =>
      _$this._items ??= ListBuilder<LegacyFinancialEntry>();
  set items(ListBuilder<LegacyFinancialEntry>? items) => _$this._items = items;

  int? _total;
  int? get total => _$this._total;
  set total(int? total) => _$this._total = total;

  MapBuilder<String, LegacyFinancialEntryPageSummaryValue>? _summary;
  MapBuilder<String, LegacyFinancialEntryPageSummaryValue> get summary =>
      _$this._summary ??=
          MapBuilder<String, LegacyFinancialEntryPageSummaryValue>();
  set summary(
    MapBuilder<String, LegacyFinancialEntryPageSummaryValue>? summary,
  ) => _$this._summary = summary;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  LegacyFinancialEntryPageBuilder() {
    LegacyFinancialEntryPage._defaults(this);
  }

  LegacyFinancialEntryPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _total = $v.total;
      _summary = $v.summary.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(LegacyFinancialEntryPage other) {
    _$v = other as _$LegacyFinancialEntryPage;
  }

  @override
  void update(void Function(LegacyFinancialEntryPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  LegacyFinancialEntryPage build() => _build();

  _$LegacyFinancialEntryPage _build() {
    _$LegacyFinancialEntryPage _$result;
    try {
      _$result =
          _$v ??
          _$LegacyFinancialEntryPage._(
            items: items.build(),
            total: BuiltValueNullFieldError.checkNotNull(
              total,
              r'LegacyFinancialEntryPage',
              'total',
            ),
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
          r'LegacyFinancialEntryPage',
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
