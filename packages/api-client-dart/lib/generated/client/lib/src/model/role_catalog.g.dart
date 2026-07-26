// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'role_catalog.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RoleCatalog extends RoleCatalog {
  @override
  final BuiltList<RoleCatalogItem> items;

  factory _$RoleCatalog([void Function(RoleCatalogBuilder)? updates]) =>
      (RoleCatalogBuilder()..update(updates))._build();

  _$RoleCatalog._({required this.items}) : super._();
  @override
  RoleCatalog rebuild(void Function(RoleCatalogBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RoleCatalogBuilder toBuilder() => RoleCatalogBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RoleCatalog && items == other.items;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
      r'RoleCatalog',
    )..add('items', items)).toString();
  }
}

class RoleCatalogBuilder implements Builder<RoleCatalog, RoleCatalogBuilder> {
  _$RoleCatalog? _$v;

  ListBuilder<RoleCatalogItem>? _items;
  ListBuilder<RoleCatalogItem> get items =>
      _$this._items ??= ListBuilder<RoleCatalogItem>();
  set items(ListBuilder<RoleCatalogItem>? items) => _$this._items = items;

  RoleCatalogBuilder() {
    RoleCatalog._defaults(this);
  }

  RoleCatalogBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RoleCatalog other) {
    _$v = other as _$RoleCatalog;
  }

  @override
  void update(void Function(RoleCatalogBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RoleCatalog build() => _build();

  _$RoleCatalog _build() {
    _$RoleCatalog _$result;
    try {
      _$result = _$v ?? _$RoleCatalog._(items: items.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'RoleCatalog',
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
