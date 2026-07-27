// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$UserPage extends UserPage {
  @override
  final BuiltList<UserSummary> items;
  @override
  final CursorPageMeta page;
  @override
  final UserListSummary summary;

  factory _$UserPage([void Function(UserPageBuilder)? updates]) =>
      (UserPageBuilder()..update(updates))._build();

  _$UserPage._({required this.items, required this.page, required this.summary}) : super._();
  @override
  UserPage rebuild(void Function(UserPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  UserPageBuilder toBuilder() => UserPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UserPage && items == other.items && page == other.page && summary == other.summary;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, page.hashCode);
    _$hash = $jc(_$hash, summary.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UserPage')
          ..add('items', items)
          ..add('page', page)
          ..add('summary', summary))
        .toString();
  }
}

class UserPageBuilder implements Builder<UserPage, UserPageBuilder> {
  _$UserPage? _$v;

  ListBuilder<UserSummary>? _items;
  ListBuilder<UserSummary> get items =>
      _$this._items ??= ListBuilder<UserSummary>();
  set items(ListBuilder<UserSummary>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  UserListSummaryBuilder? _summary;
  UserListSummaryBuilder get summary => _$this._summary ??= UserListSummaryBuilder();
  set summary(UserListSummaryBuilder? summary) => _$this._summary = summary;

  UserPageBuilder() {
    UserPage._defaults(this);
  }

  UserPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _summary = $v.summary.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UserPage other) {
    _$v = other as _$UserPage;
  }

  @override
  void update(void Function(UserPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UserPage build() => _build();

  _$UserPage _build() {
    _$UserPage _$result;
    try {
      _$result = _$v ?? _$UserPage._(items: items.build(), page: page.build(), summary: summary.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
        _$failedField = 'summary';
        summary.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'UserPage',
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
