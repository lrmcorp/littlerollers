// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'class_type_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ClassTypePage extends ClassTypePage {
  @override
  final BuiltList<ClassType> items;
  @override
  final CursorPageMeta page;

  factory _$ClassTypePage([void Function(ClassTypePageBuilder)? updates]) =>
      (ClassTypePageBuilder()..update(updates))._build();

  _$ClassTypePage._({required this.items, required this.page}) : super._();
  @override
  ClassTypePage rebuild(void Function(ClassTypePageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ClassTypePageBuilder toBuilder() => ClassTypePageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ClassTypePage && items == other.items && page == other.page;
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
    return (newBuiltValueToStringHelper(r'ClassTypePage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class ClassTypePageBuilder
    implements Builder<ClassTypePage, ClassTypePageBuilder> {
  _$ClassTypePage? _$v;

  ListBuilder<ClassType>? _items;
  ListBuilder<ClassType> get items =>
      _$this._items ??= ListBuilder<ClassType>();
  set items(ListBuilder<ClassType>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  ClassTypePageBuilder() {
    ClassTypePage._defaults(this);
  }

  ClassTypePageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ClassTypePage other) {
    _$v = other as _$ClassTypePage;
  }

  @override
  void update(void Function(ClassTypePageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ClassTypePage build() => _build();

  _$ClassTypePage _build() {
    _$ClassTypePage _$result;
    try {
      _$result =
          _$v ?? _$ClassTypePage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'ClassTypePage',
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
