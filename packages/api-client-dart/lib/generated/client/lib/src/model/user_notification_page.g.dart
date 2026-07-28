// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_notification_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$UserNotificationPage extends UserNotificationPage {
  @override
  final BuiltList<UserNotification> items;
  @override
  final CursorPageMeta page;

  factory _$UserNotificationPage([
    void Function(UserNotificationPageBuilder)? updates,
  ]) => (UserNotificationPageBuilder()..update(updates))._build();

  _$UserNotificationPage._({required this.items, required this.page})
    : super._();
  @override
  UserNotificationPage rebuild(
    void Function(UserNotificationPageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  UserNotificationPageBuilder toBuilder() =>
      UserNotificationPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UserNotificationPage &&
        items == other.items &&
        page == other.page;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, page.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UserNotificationPage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class UserNotificationPageBuilder
    implements Builder<UserNotificationPage, UserNotificationPageBuilder> {
  _$UserNotificationPage? _$v;

  ListBuilder<UserNotification>? _items;
  ListBuilder<UserNotification> get items =>
      _$this._items ??= ListBuilder<UserNotification>();
  set items(ListBuilder<UserNotification>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  UserNotificationPageBuilder() {
    UserNotificationPage._defaults(this);
  }

  UserNotificationPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UserNotificationPage other) {
    _$v = other as _$UserNotificationPage;
  }

  @override
  void update(void Function(UserNotificationPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UserNotificationPage build() => _build();

  _$UserNotificationPage _build() {
    _$UserNotificationPage _$result;
    try {
      _$result =
          _$v ??
          _$UserNotificationPage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'UserNotificationPage',
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
