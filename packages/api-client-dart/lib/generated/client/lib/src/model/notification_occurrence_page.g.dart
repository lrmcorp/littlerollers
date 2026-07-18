// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_occurrence_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$NotificationOccurrencePage extends NotificationOccurrencePage {
  @override
  final BuiltList<NotificationOccurrence> items;
  @override
  final CursorPageMeta page;

  factory _$NotificationOccurrencePage([
    void Function(NotificationOccurrencePageBuilder)? updates,
  ]) => (NotificationOccurrencePageBuilder()..update(updates))._build();

  _$NotificationOccurrencePage._({required this.items, required this.page})
    : super._();
  @override
  NotificationOccurrencePage rebuild(
    void Function(NotificationOccurrencePageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  NotificationOccurrencePageBuilder toBuilder() =>
      NotificationOccurrencePageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is NotificationOccurrencePage &&
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
    return (newBuiltValueToStringHelper(r'NotificationOccurrencePage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class NotificationOccurrencePageBuilder
    implements
        Builder<NotificationOccurrencePage, NotificationOccurrencePageBuilder> {
  _$NotificationOccurrencePage? _$v;

  ListBuilder<NotificationOccurrence>? _items;
  ListBuilder<NotificationOccurrence> get items =>
      _$this._items ??= ListBuilder<NotificationOccurrence>();
  set items(ListBuilder<NotificationOccurrence>? items) =>
      _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  NotificationOccurrencePageBuilder() {
    NotificationOccurrencePage._defaults(this);
  }

  NotificationOccurrencePageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(NotificationOccurrencePage other) {
    _$v = other as _$NotificationOccurrencePage;
  }

  @override
  void update(void Function(NotificationOccurrencePageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  NotificationOccurrencePage build() => _build();

  _$NotificationOccurrencePage _build() {
    _$NotificationOccurrencePage _$result;
    try {
      _$result =
          _$v ??
          _$NotificationOccurrencePage._(
            items: items.build(),
            page: page.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'NotificationOccurrencePage',
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
