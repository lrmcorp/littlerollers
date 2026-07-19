// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'effective_setting_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$EffectiveSettingPage extends EffectiveSettingPage {
  @override
  final BuiltList<EffectiveSetting> items;
  @override
  final CursorPageMeta page;

  factory _$EffectiveSettingPage([
    void Function(EffectiveSettingPageBuilder)? updates,
  ]) => (EffectiveSettingPageBuilder()..update(updates))._build();

  _$EffectiveSettingPage._({required this.items, required this.page})
    : super._();
  @override
  EffectiveSettingPage rebuild(
    void Function(EffectiveSettingPageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  EffectiveSettingPageBuilder toBuilder() =>
      EffectiveSettingPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is EffectiveSettingPage &&
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
    return (newBuiltValueToStringHelper(r'EffectiveSettingPage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class EffectiveSettingPageBuilder
    implements Builder<EffectiveSettingPage, EffectiveSettingPageBuilder> {
  _$EffectiveSettingPage? _$v;

  ListBuilder<EffectiveSetting>? _items;
  ListBuilder<EffectiveSetting> get items =>
      _$this._items ??= ListBuilder<EffectiveSetting>();
  set items(ListBuilder<EffectiveSetting>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  EffectiveSettingPageBuilder() {
    EffectiveSettingPage._defaults(this);
  }

  EffectiveSettingPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(EffectiveSettingPage other) {
    _$v = other as _$EffectiveSettingPage;
  }

  @override
  void update(void Function(EffectiveSettingPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  EffectiveSettingPage build() => _build();

  _$EffectiveSettingPage _build() {
    _$EffectiveSettingPage _$result;
    try {
      _$result =
          _$v ??
          _$EffectiveSettingPage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'EffectiveSettingPage',
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
