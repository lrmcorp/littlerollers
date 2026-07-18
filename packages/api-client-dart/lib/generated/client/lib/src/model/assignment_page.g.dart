// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assignment_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AssignmentPage extends AssignmentPage {
  @override
  final BuiltList<Assignment> items;
  @override
  final PagePage page;

  factory _$AssignmentPage([void Function(AssignmentPageBuilder)? updates]) =>
      (AssignmentPageBuilder()..update(updates))._build();

  _$AssignmentPage._({required this.items, required this.page}) : super._();
  @override
  AssignmentPage rebuild(void Function(AssignmentPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AssignmentPageBuilder toBuilder() => AssignmentPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AssignmentPage &&
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
    return (newBuiltValueToStringHelper(r'AssignmentPage')
          ..add('items', items)
          ..add('page', page))
        .toString();
  }
}

class AssignmentPageBuilder
    implements Builder<AssignmentPage, AssignmentPageBuilder> {
  _$AssignmentPage? _$v;

  ListBuilder<Assignment>? _items;
  ListBuilder<Assignment> get items =>
      _$this._items ??= ListBuilder<Assignment>();
  set items(ListBuilder<Assignment>? items) => _$this._items = items;

  PagePageBuilder? _page;
  PagePageBuilder get page => _$this._page ??= PagePageBuilder();
  set page(PagePageBuilder? page) => _$this._page = page;

  AssignmentPageBuilder() {
    AssignmentPage._defaults(this);
  }

  AssignmentPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AssignmentPage other) {
    _$v = other as _$AssignmentPage;
  }

  @override
  void update(void Function(AssignmentPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AssignmentPage build() => _build();

  _$AssignmentPage _build() {
    _$AssignmentPage _$result;
    try {
      _$result =
          _$v ?? _$AssignmentPage._(items: items.build(), page: page.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
        _$failedField = 'page';
        page.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'AssignmentPage',
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
