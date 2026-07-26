// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'role_catalog_item.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const RoleCatalogItemScopeEnum _$roleCatalogItemScopeEnum_GLOBAL =
    const RoleCatalogItemScopeEnum._('GLOBAL');
const RoleCatalogItemScopeEnum _$roleCatalogItemScopeEnum_BRANCH =
    const RoleCatalogItemScopeEnum._('BRANCH');

RoleCatalogItemScopeEnum _$roleCatalogItemScopeEnumValueOf(String name) {
  switch (name) {
    case 'GLOBAL':
      return _$roleCatalogItemScopeEnum_GLOBAL;
    case 'BRANCH':
      return _$roleCatalogItemScopeEnum_BRANCH;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RoleCatalogItemScopeEnum> _$roleCatalogItemScopeEnumValues =
    BuiltSet<RoleCatalogItemScopeEnum>(const <RoleCatalogItemScopeEnum>[
      _$roleCatalogItemScopeEnum_GLOBAL,
      _$roleCatalogItemScopeEnum_BRANCH,
    ]);

Serializer<RoleCatalogItemScopeEnum> _$roleCatalogItemScopeEnumSerializer =
    _$RoleCatalogItemScopeEnumSerializer();

class _$RoleCatalogItemScopeEnumSerializer
    implements PrimitiveSerializer<RoleCatalogItemScopeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'GLOBAL': 'GLOBAL',
    'BRANCH': 'BRANCH',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'GLOBAL': 'GLOBAL',
    'BRANCH': 'BRANCH',
  };

  @override
  final Iterable<Type> types = const <Type>[RoleCatalogItemScopeEnum];
  @override
  final String wireName = 'RoleCatalogItemScopeEnum';

  @override
  Object serialize(
    Serializers serializers,
    RoleCatalogItemScopeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  RoleCatalogItemScopeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => RoleCatalogItemScopeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$RoleCatalogItem extends RoleCatalogItem {
  @override
  final Role role;
  @override
  final BuiltList<String> capabilities;
  @override
  final bool assignable;
  @override
  final bool readOnly;
  @override
  final RoleCatalogItemScopeEnum scope;

  factory _$RoleCatalogItem([void Function(RoleCatalogItemBuilder)? updates]) =>
      (RoleCatalogItemBuilder()..update(updates))._build();

  _$RoleCatalogItem._({
    required this.role,
    required this.capabilities,
    required this.assignable,
    required this.readOnly,
    required this.scope,
  }) : super._();
  @override
  RoleCatalogItem rebuild(void Function(RoleCatalogItemBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RoleCatalogItemBuilder toBuilder() => RoleCatalogItemBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RoleCatalogItem &&
        role == other.role &&
        capabilities == other.capabilities &&
        assignable == other.assignable &&
        readOnly == other.readOnly &&
        scope == other.scope;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, role.hashCode);
    _$hash = $jc(_$hash, capabilities.hashCode);
    _$hash = $jc(_$hash, assignable.hashCode);
    _$hash = $jc(_$hash, readOnly.hashCode);
    _$hash = $jc(_$hash, scope.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RoleCatalogItem')
          ..add('role', role)
          ..add('capabilities', capabilities)
          ..add('assignable', assignable)
          ..add('readOnly', readOnly)
          ..add('scope', scope))
        .toString();
  }
}

class RoleCatalogItemBuilder
    implements Builder<RoleCatalogItem, RoleCatalogItemBuilder> {
  _$RoleCatalogItem? _$v;

  Role? _role;
  Role? get role => _$this._role;
  set role(Role? role) => _$this._role = role;

  ListBuilder<String>? _capabilities;
  ListBuilder<String> get capabilities =>
      _$this._capabilities ??= ListBuilder<String>();
  set capabilities(ListBuilder<String>? capabilities) =>
      _$this._capabilities = capabilities;

  bool? _assignable;
  bool? get assignable => _$this._assignable;
  set assignable(bool? assignable) => _$this._assignable = assignable;

  bool? _readOnly;
  bool? get readOnly => _$this._readOnly;
  set readOnly(bool? readOnly) => _$this._readOnly = readOnly;

  RoleCatalogItemScopeEnum? _scope;
  RoleCatalogItemScopeEnum? get scope => _$this._scope;
  set scope(RoleCatalogItemScopeEnum? scope) => _$this._scope = scope;

  RoleCatalogItemBuilder() {
    RoleCatalogItem._defaults(this);
  }

  RoleCatalogItemBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _role = $v.role;
      _capabilities = $v.capabilities.toBuilder();
      _assignable = $v.assignable;
      _readOnly = $v.readOnly;
      _scope = $v.scope;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RoleCatalogItem other) {
    _$v = other as _$RoleCatalogItem;
  }

  @override
  void update(void Function(RoleCatalogItemBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RoleCatalogItem build() => _build();

  _$RoleCatalogItem _build() {
    _$RoleCatalogItem _$result;
    try {
      _$result =
          _$v ??
          _$RoleCatalogItem._(
            role: BuiltValueNullFieldError.checkNotNull(
              role,
              r'RoleCatalogItem',
              'role',
            ),
            capabilities: capabilities.build(),
            assignable: BuiltValueNullFieldError.checkNotNull(
              assignable,
              r'RoleCatalogItem',
              'assignable',
            ),
            readOnly: BuiltValueNullFieldError.checkNotNull(
              readOnly,
              r'RoleCatalogItem',
              'readOnly',
            ),
            scope: BuiltValueNullFieldError.checkNotNull(
              scope,
              r'RoleCatalogItem',
              'scope',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'capabilities';
        capabilities.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'RoleCatalogItem',
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
