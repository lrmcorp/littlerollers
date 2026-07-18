// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'financial_report_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$FinancialReportPage extends FinancialReportPage {
  @override
  final FinancialReport report;
  @override
  final BuiltList<JsonObject> items;
  @override
  final CursorPageMeta page;

  factory _$FinancialReportPage([
    void Function(FinancialReportPageBuilder)? updates,
  ]) => (FinancialReportPageBuilder()..update(updates))._build();

  _$FinancialReportPage._({
    required this.report,
    required this.items,
    required this.page,
  }) : super._();
  @override
  FinancialReportPage rebuild(
    void Function(FinancialReportPageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  FinancialReportPageBuilder toBuilder() =>
      FinancialReportPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FinancialReportPage &&
        report == other.report &&
        items == other.items &&
        page == other.page;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, report.hashCode);
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, page.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'FinancialReportPage')
          ..add('report', report)
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class FinancialReportPageBuilder
    implements Builder<FinancialReportPage, FinancialReportPageBuilder> {
  _$FinancialReportPage? _$v;

  FinancialReportBuilder? _report;
  FinancialReportBuilder get report =>
      _$this._report ??= FinancialReportBuilder();
  set report(FinancialReportBuilder? report) => _$this._report = report;

  ListBuilder<JsonObject>? _items;
  ListBuilder<JsonObject> get items =>
      _$this._items ??= ListBuilder<JsonObject>();
  set items(ListBuilder<JsonObject>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  FinancialReportPageBuilder() {
    FinancialReportPage._defaults(this);
  }

  FinancialReportPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _report = $v.report.toBuilder();
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(FinancialReportPage other) {
    _$v = other as _$FinancialReportPage;
  }

  @override
  void update(void Function(FinancialReportPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  FinancialReportPage build() => _build();

  _$FinancialReportPage _build() {
    _$FinancialReportPage _$result;
    try {
      _$result =
          _$v ??
          _$FinancialReportPage._(
            report: report.build(),
            items: items.build(),
            page: page.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'report';
        report.build();
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'FinancialReportPage',
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
