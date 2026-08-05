// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'studio_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$StudioPage extends StudioPage {
  @override
  final BuiltList<Studio> items;
  @override
  final CursorPageMeta page;

  factory _$StudioPage([void Function(StudioPageBuilder)? updates]) =>
      (StudioPageBuilder()..update(updates))._build();

  _$StudioPage._({required this.items, required this.page}) : super._();
  @override
  StudioPage rebuild(void Function(StudioPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  StudioPageBuilder toBuilder() => StudioPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is StudioPage && items == other.items && page == other.page;
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
    return (newBuiltValueToStringHelper(r'StudioPage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class StudioPageBuilder implements Builder<StudioPage, StudioPageBuilder> {
  _$StudioPage? _$v;

  ListBuilder<Studio>? _items;
  ListBuilder<Studio> get items => _$this._items ??= ListBuilder<Studio>();
  set items(ListBuilder<Studio>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  StudioPageBuilder() {
    StudioPage._defaults(this);
  }

  StudioPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(StudioPage other) {
    _$v = other as _$StudioPage;
  }

  @override
  void update(void Function(StudioPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  StudioPage build() => _build();

  _$StudioPage _build() {
    _$StudioPage _$result;
    try {
      _$result =
          _$v ?? _$StudioPage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'StudioPage',
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
