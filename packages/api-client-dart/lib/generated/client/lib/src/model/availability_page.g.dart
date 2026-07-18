// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'availability_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AvailabilityPage extends AvailabilityPage {
  @override
  final BuiltList<Availability> items;
  @override
  final CursorPageMeta page;

  factory _$AvailabilityPage([
    void Function(AvailabilityPageBuilder)? updates,
  ]) => (AvailabilityPageBuilder()..update(updates))._build();

  _$AvailabilityPage._({required this.items, required this.page}) : super._();
  @override
  AvailabilityPage rebuild(void Function(AvailabilityPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AvailabilityPageBuilder toBuilder() =>
      AvailabilityPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AvailabilityPage &&
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
    return (newBuiltValueToStringHelper(r'AvailabilityPage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class AvailabilityPageBuilder
    implements Builder<AvailabilityPage, AvailabilityPageBuilder> {
  _$AvailabilityPage? _$v;

  ListBuilder<Availability>? _items;
  ListBuilder<Availability> get items =>
      _$this._items ??= ListBuilder<Availability>();
  set items(ListBuilder<Availability>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  AvailabilityPageBuilder() {
    AvailabilityPage._defaults(this);
  }

  AvailabilityPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AvailabilityPage other) {
    _$v = other as _$AvailabilityPage;
  }

  @override
  void update(void Function(AvailabilityPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AvailabilityPage build() => _build();

  _$AvailabilityPage _build() {
    _$AvailabilityPage _$result;
    try {
      _$result =
          _$v ?? _$AvailabilityPage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'AvailabilityPage',
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
