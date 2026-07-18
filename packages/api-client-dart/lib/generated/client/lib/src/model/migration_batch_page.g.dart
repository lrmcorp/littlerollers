// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'migration_batch_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$MigrationBatchPage extends MigrationBatchPage {
  @override
  final BuiltList<MigrationBatchResult> items;
  @override
  final CursorPageMeta page;

  factory _$MigrationBatchPage([
    void Function(MigrationBatchPageBuilder)? updates,
  ]) => (MigrationBatchPageBuilder()..update(updates))._build();

  _$MigrationBatchPage._({required this.items, required this.page}) : super._();
  @override
  MigrationBatchPage rebuild(
    void Function(MigrationBatchPageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  MigrationBatchPageBuilder toBuilder() =>
      MigrationBatchPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MigrationBatchPage &&
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
    return (newBuiltValueToStringHelper(r'MigrationBatchPage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class MigrationBatchPageBuilder
    implements Builder<MigrationBatchPage, MigrationBatchPageBuilder> {
  _$MigrationBatchPage? _$v;

  ListBuilder<MigrationBatchResult>? _items;
  ListBuilder<MigrationBatchResult> get items =>
      _$this._items ??= ListBuilder<MigrationBatchResult>();
  set items(ListBuilder<MigrationBatchResult>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  MigrationBatchPageBuilder() {
    MigrationBatchPage._defaults(this);
  }

  MigrationBatchPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MigrationBatchPage other) {
    _$v = other as _$MigrationBatchPage;
  }

  @override
  void update(void Function(MigrationBatchPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MigrationBatchPage build() => _build();

  _$MigrationBatchPage _build() {
    _$MigrationBatchPage _$result;
    try {
      _$result =
          _$v ??
          _$MigrationBatchPage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'MigrationBatchPage',
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
