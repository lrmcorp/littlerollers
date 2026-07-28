// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'access_role_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AccessRolePage extends AccessRolePage {
  @override
  final BuiltList<AccessRoleDefinition> items;

  factory _$AccessRolePage([void Function(AccessRolePageBuilder)? updates]) =>
      (AccessRolePageBuilder()..update(updates))._build();

  _$AccessRolePage._({required this.items}) : super._();
  @override
  AccessRolePage rebuild(void Function(AccessRolePageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AccessRolePageBuilder toBuilder() => AccessRolePageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AccessRolePage && items == other.items;
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
      r'AccessRolePage',
    )..add('items', items)).toString();
  }
}

class AccessRolePageBuilder
    implements Builder<AccessRolePage, AccessRolePageBuilder> {
  _$AccessRolePage? _$v;

  ListBuilder<AccessRoleDefinition>? _items;
  ListBuilder<AccessRoleDefinition> get items =>
      _$this._items ??= ListBuilder<AccessRoleDefinition>();
  set items(ListBuilder<AccessRoleDefinition>? items) => _$this._items = items;

  AccessRolePageBuilder() {
    AccessRolePage._defaults(this);
  }

  AccessRolePageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AccessRolePage other) {
    _$v = other as _$AccessRolePage;
  }

  @override
  void update(void Function(AccessRolePageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AccessRolePage build() => _build();

  _$AccessRolePage _build() {
    _$AccessRolePage _$result;
    try {
      _$result = _$v ?? _$AccessRolePage._(items: items.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'AccessRolePage',
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
