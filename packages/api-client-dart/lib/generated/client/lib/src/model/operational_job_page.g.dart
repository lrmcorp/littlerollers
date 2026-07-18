// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'operational_job_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$OperationalJobPage extends OperationalJobPage {
  @override
  final BuiltList<OperationalJob> items;
  @override
  final CursorPageMeta page;

  factory _$OperationalJobPage([
    void Function(OperationalJobPageBuilder)? updates,
  ]) => (OperationalJobPageBuilder()..update(updates))._build();

  _$OperationalJobPage._({required this.items, required this.page}) : super._();
  @override
  OperationalJobPage rebuild(
    void Function(OperationalJobPageBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  OperationalJobPageBuilder toBuilder() =>
      OperationalJobPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OperationalJobPage &&
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
    return (newBuiltValueToStringHelper(r'OperationalJobPage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class OperationalJobPageBuilder
    implements Builder<OperationalJobPage, OperationalJobPageBuilder> {
  _$OperationalJobPage? _$v;

  ListBuilder<OperationalJob>? _items;
  ListBuilder<OperationalJob> get items =>
      _$this._items ??= ListBuilder<OperationalJob>();
  set items(ListBuilder<OperationalJob>? items) => _$this._items = items;

  CursorPageMetaBuilder? _page;
  CursorPageMetaBuilder get page => _$this._page ??= CursorPageMetaBuilder();
  set page(CursorPageMetaBuilder? page) => _$this._page = page;

  OperationalJobPageBuilder() {
    OperationalJobPage._defaults(this);
  }

  OperationalJobPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OperationalJobPage other) {
    _$v = other as _$OperationalJobPage;
  }

  @override
  void update(void Function(OperationalJobPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OperationalJobPage build() => _build();

  _$OperationalJobPage _build() {
    _$OperationalJobPage _$result;
    try {
      _$result =
          _$v ??
          _$OperationalJobPage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'OperationalJobPage',
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
