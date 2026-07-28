// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BookingPage extends BookingPage {
  @override
  final BuiltList<Booking> items;
  @override
  final BookingManagementSummary summary;
  @override
  final CursorPageMeta page;

  factory _$BookingPage([void Function(BookingPageBuilder)? updates]) =>
      (BookingPageBuilder()..update(updates))._build();

  _$BookingPage._({
    required this.items,
    required this.summary,
    required this.page,
  }) : super._();
  @override
  BookingPage rebuild(void Function(BookingPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  BookingPageBuilder toBuilder() => BookingPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BookingPage &&
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
    return (newBuiltValueToStringHelper(r'BookingPage')
          ..add('items', items)
          ..add('summary', summary)
          ..add('page', page))
        .toString();
  }
}

class BookingPageBuilder implements Builder<BookingPage, BookingPageBuilder> {
  _$BookingPage? _$v;

  ListBuilder<Booking>? _items;
  ListBuilder<Booking> get items => _$this._items ??= ListBuilder<Booking>();
  set items(ListBuilder<Booking>? items) => _$this._items = items;

  BookingManagementSummaryBuilder? _summary;
  BookingManagementSummaryBuilder get summary =>
      _$this._summary ??= BookingManagementSummaryBuilder();
  set summary(BookingManagementSummaryBuilder? summary) =>
      _$this._summary = summary;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  BookingPageBuilder() {
    BookingPage._defaults(this);
  }

  BookingPageBuilder get _$this {
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
  void replace(BookingPage other) {
    _$v = other as _$BookingPage;
  }

  @override
  void update(void Function(BookingPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BookingPage build() => _build();

  _$BookingPage _build() {
    _$BookingPage _$result;
    try {
      _$result =
          _$v ??
          _$BookingPage._(
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
          r'BookingPage',
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
