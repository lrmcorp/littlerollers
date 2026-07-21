// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'session_adjustment_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SessionAdjustmentPage extends SessionAdjustmentPage {
  @override
  final BuiltList<SessionAdjustment> items;
  @override
  final CursorPageMeta page;

  factory _$SessionAdjustmentPage([
    void Function(SessionAdjustmentPageBuilder)? updates,
  ]) => (SessionAdjustmentPageBuilder()..update(updates))._build();

  _$SessionAdjustmentPage._({required this.items, required this.page})
    : super._();
  @override
  SessionAdjustmentPage rebuild(
    void Function(SessionAdjustmentPageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  SessionAdjustmentPageBuilder toBuilder() =>
      SessionAdjustmentPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SessionAdjustmentPage &&
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
    return (newBuiltValueToStringHelper(r'SessionAdjustmentPage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class SessionAdjustmentPageBuilder
    implements Builder<SessionAdjustmentPage, SessionAdjustmentPageBuilder> {
  _$SessionAdjustmentPage? _$v;

  ListBuilder<SessionAdjustment>? _items;
  ListBuilder<SessionAdjustment> get items =>
      _$this._items ??= ListBuilder<SessionAdjustment>();
  set items(ListBuilder<SessionAdjustment>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  SessionAdjustmentPageBuilder() {
    SessionAdjustmentPage._defaults(this);
  }

  SessionAdjustmentPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SessionAdjustmentPage other) {
    _$v = other as _$SessionAdjustmentPage;
  }

  @override
  void update(void Function(SessionAdjustmentPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SessionAdjustmentPage build() => _build();

  _$SessionAdjustmentPage _build() {
    _$SessionAdjustmentPage _$result;
    try {
      _$result =
          _$v ??
          _$SessionAdjustmentPage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'SessionAdjustmentPage',
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
