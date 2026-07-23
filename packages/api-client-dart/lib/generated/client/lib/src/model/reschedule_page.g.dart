// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reschedule_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ReschedulePage extends ReschedulePage {
  @override
  final BuiltList<Reschedule> items;
  @override
  final CursorPageMeta page;

  factory _$ReschedulePage([void Function(ReschedulePageBuilder)? updates]) =>
      (ReschedulePageBuilder()..update(updates))._build();

  _$ReschedulePage._({required this.items, required this.page}) : super._();
  @override
  ReschedulePage rebuild(void Function(ReschedulePageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ReschedulePageBuilder toBuilder() => ReschedulePageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ReschedulePage &&
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
    return (newBuiltValueToStringHelper(r'ReschedulePage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class ReschedulePageBuilder
    implements Builder<ReschedulePage, ReschedulePageBuilder> {
  _$ReschedulePage? _$v;

  ListBuilder<Reschedule>? _items;
  ListBuilder<Reschedule> get items =>
      _$this._items ??= ListBuilder<Reschedule>();
  set items(ListBuilder<Reschedule>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  ReschedulePageBuilder() {
    ReschedulePage._defaults(this);
  }

  ReschedulePageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ReschedulePage other) {
    _$v = other as _$ReschedulePage;
  }

  @override
  void update(void Function(ReschedulePageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ReschedulePage build() => _build();

  _$ReschedulePage _build() {
    _$ReschedulePage _$result;
    try {
      _$result =
          _$v ?? _$ReschedulePage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'ReschedulePage',
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
