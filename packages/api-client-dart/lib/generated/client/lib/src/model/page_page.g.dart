// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'page_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PagePage extends PagePage {
  @override
  final String? nextCursor;
  @override
  final bool hasMore;

  factory _$PagePage([void Function(PagePageBuilder)? updates]) =>
      (PagePageBuilder()..update(updates))._build();

  _$PagePage._({this.nextCursor, required this.hasMore}) : super._();
  @override
  PagePage rebuild(void Function(PagePageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PagePageBuilder toBuilder() => PagePageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PagePage &&
        nextCursor == other.nextCursor &&
        hasMore == other.hasMore;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, nextCursor.hashCode);
    _$hash = $jc(_$hash, hasMore.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PagePage')
          ..add('nextCursor', nextCursor)
          ..add('hasMore', hasMore))
        .toString();
  }
}

class PagePageBuilder implements Builder<PagePage, PagePageBuilder> {
  _$PagePage? _$v;

  String? _nextCursor;
  String? get nextCursor => _$this._nextCursor;
  set nextCursor(String? nextCursor) => _$this._nextCursor = nextCursor;

  bool? _hasMore;
  bool? get hasMore => _$this._hasMore;
  set hasMore(bool? hasMore) => _$this._hasMore = hasMore;

  PagePageBuilder() {
    PagePage._defaults(this);
  }

  PagePageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _nextCursor = $v.nextCursor;
      _hasMore = $v.hasMore;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PagePage other) {
    _$v = other as _$PagePage;
  }

  @override
  void update(void Function(PagePageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PagePage build() => _build();

  _$PagePage _build() {
    final _$result =
        _$v ??
        _$PagePage._(
          nextCursor: nextCursor,
          hasMore: BuiltValueNullFieldError.checkNotNull(
            hasMore,
            r'PagePage',
            'hasMore',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
