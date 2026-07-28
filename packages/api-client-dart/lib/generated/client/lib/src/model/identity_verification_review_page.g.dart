// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'identity_verification_review_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$IdentityVerificationReviewPage extends IdentityVerificationReviewPage {
  @override
  final BuiltList<IdentityVerificationReviewCase> items;
  @override
  final IdentityVerificationReviewSummary summary;
  @override
  final CursorPageMeta page;
  @override
  final DateTime generatedAt;

  factory _$IdentityVerificationReviewPage([
    void Function(IdentityVerificationReviewPageBuilder)? updates,
  ]) => (IdentityVerificationReviewPageBuilder()..update(updates))._build();

  _$IdentityVerificationReviewPage._({
    required this.items,
    required this.summary,
    required this.page,
    required this.generatedAt,
  }) : super._();
  @override
  IdentityVerificationReviewPage rebuild(
    void Function(IdentityVerificationReviewPageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  IdentityVerificationReviewPageBuilder toBuilder() =>
      IdentityVerificationReviewPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is IdentityVerificationReviewPage &&
        items == other.items &&
        summary == other.summary &&
        page == other.page &&
        generatedAt == other.generatedAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, summary.hashCode);
    _$hash = $jc(_$hash, page.hashCode);
    _$hash = $jc(_$hash, generatedAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'IdentityVerificationReviewPage')
          ..add('items', items)
          ..add('summary', summary)
          ..add('page', page)
          ..add('generatedAt', generatedAt))
        .toString();
  }
}

class IdentityVerificationReviewPageBuilder
    implements
        Builder<
          IdentityVerificationReviewPage,
          IdentityVerificationReviewPageBuilder
        > {
  _$IdentityVerificationReviewPage? _$v;

  ListBuilder<IdentityVerificationReviewCase>? _items;
  ListBuilder<IdentityVerificationReviewCase> get items =>
      _$this._items ??= ListBuilder<IdentityVerificationReviewCase>();
  set items(ListBuilder<IdentityVerificationReviewCase>? items) =>
      _$this._items = items;

  IdentityVerificationReviewSummaryBuilder? _summary;
  IdentityVerificationReviewSummaryBuilder get summary =>
      _$this._summary ??= IdentityVerificationReviewSummaryBuilder();
  set summary(IdentityVerificationReviewSummaryBuilder? summary) =>
      _$this._summary = summary;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  DateTime? _generatedAt;
  DateTime? get generatedAt => _$this._generatedAt;
  set generatedAt(DateTime? generatedAt) => _$this._generatedAt = generatedAt;

  IdentityVerificationReviewPageBuilder() {
    IdentityVerificationReviewPage._defaults(this);
  }

  IdentityVerificationReviewPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _summary = $v.summary.toBuilder();
      _page = $v.page.toBuilder();
      _generatedAt = $v.generatedAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(IdentityVerificationReviewPage other) {
    _$v = other as _$IdentityVerificationReviewPage;
  }

  @override
  void update(void Function(IdentityVerificationReviewPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  IdentityVerificationReviewPage build() => _build();

  _$IdentityVerificationReviewPage _build() {
    _$IdentityVerificationReviewPage _$result;
    try {
      _$result =
          _$v ??
          _$IdentityVerificationReviewPage._(
            items: items.build(),
            summary: summary.build(),
            page: page.build(),
            generatedAt: BuiltValueNullFieldError.checkNotNull(
              generatedAt,
              r'IdentityVerificationReviewPage',
              'generatedAt',
            ),
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
          r'IdentityVerificationReviewPage',
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
