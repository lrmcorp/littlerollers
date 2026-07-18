// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'class_slot_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ClassSlotPage extends ClassSlotPage {
  @override
  final BuiltList<ClassSlot> items;
  @override
  final CursorPageMeta page;

  factory _$ClassSlotPage([void Function(ClassSlotPageBuilder)? updates]) =>
      (ClassSlotPageBuilder()..update(updates))._build();

  _$ClassSlotPage._({required this.items, required this.page}) : super._();
  @override
  ClassSlotPage rebuild(void Function(ClassSlotPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ClassSlotPageBuilder toBuilder() => ClassSlotPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ClassSlotPage && items == other.items && page == other.page;
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
    return (newBuiltValueToStringHelper(r'ClassSlotPage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class ClassSlotPageBuilder
    implements Builder<ClassSlotPage, ClassSlotPageBuilder> {
  _$ClassSlotPage? _$v;

  ListBuilder<ClassSlot>? _items;
  ListBuilder<ClassSlot> get items =>
      _$this._items ??= ListBuilder<ClassSlot>();
  set items(ListBuilder<ClassSlot>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  ClassSlotPageBuilder() {
    ClassSlotPage._defaults(this);
  }

  ClassSlotPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ClassSlotPage other) {
    _$v = other as _$ClassSlotPage;
  }

  @override
  void update(void Function(ClassSlotPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ClassSlotPage build() => _build();

  _$ClassSlotPage _build() {
    _$ClassSlotPage _$result;
    try {
      _$result =
          _$v ?? _$ClassSlotPage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'ClassSlotPage',
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
