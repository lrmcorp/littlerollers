// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_review_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PaymentReviewPage extends PaymentReviewPage {
  @override
  final BuiltList<PaymentReviewItem> items;
  @override
  final PaymentReviewSummary summary;
  @override
  final DateTime generatedAt;
  @override
  final CursorPageMeta page;

  factory _$PaymentReviewPage([
    void Function(PaymentReviewPageBuilder)? updates,
  ]) => (PaymentReviewPageBuilder()..update(updates))._build();

  _$PaymentReviewPage._({
    required this.items,
    required this.summary,
    required this.generatedAt,
    required this.page,
  }) : super._();
  @override
  PaymentReviewPage rebuild(void Function(PaymentReviewPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PaymentReviewPageBuilder toBuilder() =>
      PaymentReviewPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PaymentReviewPage &&
        items == other.items &&
        summary == other.summary &&
        generatedAt == other.generatedAt &&
        page == other.page;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, summary.hashCode);
    _$hash = $jc(_$hash, generatedAt.hashCode);
    _$hash = $jc(_$hash, page.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PaymentReviewPage')
          ..add('items', items)
          ..add('summary', summary)
          ..add('generatedAt', generatedAt)
          ..add('page', page))
        .toString();
  }
}

class PaymentReviewPageBuilder
    implements Builder<PaymentReviewPage, PaymentReviewPageBuilder> {
  _$PaymentReviewPage? _$v;

  ListBuilder<PaymentReviewItem>? _items;
  ListBuilder<PaymentReviewItem> get items =>
      _$this._items ??= ListBuilder<PaymentReviewItem>();
  set items(ListBuilder<PaymentReviewItem>? items) => _$this._items = items;

  PaymentReviewSummaryBuilder? _summary;
  PaymentReviewSummaryBuilder get summary =>
      _$this._summary ??= PaymentReviewSummaryBuilder();
  set summary(PaymentReviewSummaryBuilder? summary) =>
      _$this._summary = summary;

  DateTime? _generatedAt;
  DateTime? get generatedAt => _$this._generatedAt;
  set generatedAt(DateTime? generatedAt) => _$this._generatedAt = generatedAt;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  PaymentReviewPageBuilder() {
    PaymentReviewPage._defaults(this);
  }

  PaymentReviewPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _summary = $v.summary.toBuilder();
      _generatedAt = $v.generatedAt;
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PaymentReviewPage other) {
    _$v = other as _$PaymentReviewPage;
  }

  @override
  void update(void Function(PaymentReviewPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PaymentReviewPage build() => _build();

  _$PaymentReviewPage _build() {
    _$PaymentReviewPage _$result;
    try {
      _$result =
          _$v ??
          _$PaymentReviewPage._(
            items: items.build(),
            summary: summary.build(),
            generatedAt: BuiltValueNullFieldError.checkNotNull(
              generatedAt,
              r'PaymentReviewPage',
              'generatedAt',
            ),
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
          r'PaymentReviewPage',
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
