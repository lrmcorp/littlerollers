// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cursor_page_meta.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CursorPageMeta extends CursorPageMeta {
  @override
  final String? nextCursor;
  @override
  final bool hasMore;

  factory _$CursorPageMeta([void Function(CursorPageMetaBuilder)? updates]) =>
      (CursorPageMetaBuilder()..update(updates))._build();

  _$CursorPageMeta._({this.nextCursor, required this.hasMore}) : super._();
  @override
  CursorPageMeta rebuild(void Function(CursorPageMetaBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CursorPageMetaBuilder toBuilder() => CursorPageMetaBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CursorPageMeta &&
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
    return (newBuiltValueToStringHelper(r'CursorPageMeta')
          ..add('nextCursor', nextCursor)
          ..add('hasMore', hasMore))
        .toString();
  }
}

class CursorPageMetaBuilder
    implements Builder<CursorPageMeta, CursorPageMetaBuilder> {
  _$CursorPageMeta? _$v;

  String? _nextCursor;
  String? get nextCursor => _$this._nextCursor;
  set nextCursor(String? nextCursor) => _$this._nextCursor = nextCursor;

  bool? _hasMore;
  bool? get hasMore => _$this._hasMore;
  set hasMore(bool? hasMore) => _$this._hasMore = hasMore;

  CursorPageMetaBuilder() {
    CursorPageMeta._defaults(this);
  }

  CursorPageMetaBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _nextCursor = $v.nextCursor;
      _hasMore = $v.hasMore;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CursorPageMeta other) {
    _$v = other as _$CursorPageMeta;
  }

  @override
  void update(void Function(CursorPageMetaBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CursorPageMeta build() => _build();

  _$CursorPageMeta _build() {
    final _$result =
        _$v ??
        _$CursorPageMeta._(
          nextCursor: nextCursor,
          hasMore: BuiltValueNullFieldError.checkNotNull(
            hasMore,
            r'CursorPageMeta',
            'hasMore',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
