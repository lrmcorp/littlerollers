// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'room_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RoomPage extends RoomPage {
  @override
  final BuiltList<Room> items;
  @override
  final CursorPageMeta page;

  factory _$RoomPage([void Function(RoomPageBuilder)? updates]) =>
      (RoomPageBuilder()..update(updates))._build();

  _$RoomPage._({required this.items, required this.page}) : super._();
  @override
  RoomPage rebuild(void Function(RoomPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RoomPageBuilder toBuilder() => RoomPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RoomPage && items == other.items && page == other.page;
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
    return (newBuiltValueToStringHelper(r'RoomPage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class RoomPageBuilder implements Builder<RoomPage, RoomPageBuilder> {
  _$RoomPage? _$v;

  ListBuilder<Room>? _items;
  ListBuilder<Room> get items => _$this._items ??= ListBuilder<Room>();
  set items(ListBuilder<Room>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  RoomPageBuilder() {
    RoomPage._defaults(this);
  }

  RoomPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RoomPage other) {
    _$v = other as _$RoomPage;
  }

  @override
  void update(void Function(RoomPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RoomPage build() => _build();

  _$RoomPage _build() {
    _$RoomPage _$result;
    try {
      _$result = _$v ?? _$RoomPage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'RoomPage',
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
