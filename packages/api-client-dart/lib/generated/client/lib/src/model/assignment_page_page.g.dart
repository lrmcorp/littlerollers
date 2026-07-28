// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assignment_page_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AssignmentPagePage extends AssignmentPagePage {
  @override
  final String? nextCursor;
  @override
  final bool hasMore;

  factory _$AssignmentPagePage([
    void Function(AssignmentPagePageBuilder)? updates,
  ]) => (AssignmentPagePageBuilder()..update(updates))._build();

  _$AssignmentPagePage._({this.nextCursor, required this.hasMore}) : super._();
  @override
  AssignmentPagePage rebuild(
    void Function(AssignmentPagePageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  AssignmentPagePageBuilder toBuilder() =>
      AssignmentPagePageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AssignmentPagePage &&
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
    return (newBuiltValueToStringHelper(r'AssignmentPagePage')
          ..add('nextCursor', nextCursor)
          ..add('hasMore', hasMore))
        .toString();
  }
}

class AssignmentPagePageBuilder
    implements Builder<AssignmentPagePage, AssignmentPagePageBuilder> {
  _$AssignmentPagePage? _$v;

  String? _nextCursor;
  String? get nextCursor => _$this._nextCursor;
  set nextCursor(String? nextCursor) => _$this._nextCursor = nextCursor;

  bool? _hasMore;
  bool? get hasMore => _$this._hasMore;
  set hasMore(bool? hasMore) => _$this._hasMore = hasMore;

  AssignmentPagePageBuilder() {
    AssignmentPagePage._defaults(this);
  }

  AssignmentPagePageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _nextCursor = $v.nextCursor;
      _hasMore = $v.hasMore;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AssignmentPagePage other) {
    _$v = other as _$AssignmentPagePage;
  }

  @override
  void update(void Function(AssignmentPagePageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AssignmentPagePage build() => _build();

  _$AssignmentPagePage _build() {
    final _$result =
        _$v ??
        _$AssignmentPagePage._(
          nextCursor: nextCursor,
          hasMore: BuiltValueNullFieldError.checkNotNull(
            hasMore,
            r'AssignmentPagePage',
            'hasMore',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
