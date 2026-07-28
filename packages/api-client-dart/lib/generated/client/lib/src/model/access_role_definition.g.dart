// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'access_role_definition.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AccessRoleDefinition extends AccessRoleDefinition {
  @override
  final String id;
  @override
  final String code;
  @override
  final String displayName;
  @override
  final String description;
  @override
  final AccessRoleScope scope;
  @override
  final Role? systemRole;
  @override
  final bool system;
  @override
  final bool protected;
  @override
  final bool active;
  @override
  final int version;
  @override
  final int affectedUsers;
  @override
  final BuiltList<AccessRoleCapability> capabilities;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  factory _$AccessRoleDefinition([
    void Function(AccessRoleDefinitionBuilder)? updates,
  ]) => (AccessRoleDefinitionBuilder()..update(updates))._build();

  _$AccessRoleDefinition._({
    required this.id,
    required this.code,
    required this.displayName,
    required this.description,
    required this.scope,
    this.systemRole,
    required this.system,
    required this.protected,
    required this.active,
    required this.version,
    required this.affectedUsers,
    required this.capabilities,
    required this.createdAt,
    required this.updatedAt,
  }) : super._();
  @override
  AccessRoleDefinition rebuild(
    void Function(AccessRoleDefinitionBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  AccessRoleDefinitionBuilder toBuilder() =>
      AccessRoleDefinitionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AccessRoleDefinition &&
        id == other.id &&
        code == other.code &&
        displayName == other.displayName &&
        description == other.description &&
        scope == other.scope &&
        systemRole == other.systemRole &&
        system == other.system &&
        protected == other.protected &&
        active == other.active &&
        version == other.version &&
        affectedUsers == other.affectedUsers &&
        capabilities == other.capabilities &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, scope.hashCode);
    _$hash = $jc(_$hash, systemRole.hashCode);
    _$hash = $jc(_$hash, system.hashCode);
    _$hash = $jc(_$hash, protected.hashCode);
    _$hash = $jc(_$hash, active.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jc(_$hash, affectedUsers.hashCode);
    _$hash = $jc(_$hash, capabilities.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AccessRoleDefinition')
          ..add('id', id)
          ..add('code', code)
          ..add('displayName', displayName)
          ..add('description', description)
          ..add('scope', scope)
          ..add('systemRole', systemRole)
          ..add('system', system)
          ..add('protected', protected)
          ..add('active', active)
          ..add('version', version)
          ..add('affectedUsers', affectedUsers)
          ..add('capabilities', capabilities)
          ..add('createdAt', createdAt)
          ..add('updatedAt', updatedAt))
        .toString();
  }
}

class AccessRoleDefinitionBuilder
    implements Builder<AccessRoleDefinition, AccessRoleDefinitionBuilder> {
  _$AccessRoleDefinition? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  AccessRoleScope? _scope;
  AccessRoleScope? get scope => _$this._scope;
  set scope(AccessRoleScope? scope) => _$this._scope = scope;

  Role? _systemRole;
  Role? get systemRole => _$this._systemRole;
  set systemRole(Role? systemRole) => _$this._systemRole = systemRole;

  bool? _system;
  bool? get system => _$this._system;
  set system(bool? system) => _$this._system = system;

  bool? _protected;
  bool? get protected => _$this._protected;
  set protected(bool? protected) => _$this._protected = protected;

  bool? _active;
  bool? get active => _$this._active;
  set active(bool? active) => _$this._active = active;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  int? _affectedUsers;
  int? get affectedUsers => _$this._affectedUsers;
  set affectedUsers(int? affectedUsers) =>
      _$this._affectedUsers = affectedUsers;

  ListBuilder<AccessRoleCapability>? _capabilities;
  ListBuilder<AccessRoleCapability> get capabilities =>
      _$this._capabilities ??= ListBuilder<AccessRoleCapability>();
  set capabilities(ListBuilder<AccessRoleCapability>? capabilities) =>
      _$this._capabilities = capabilities;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  AccessRoleDefinitionBuilder() {
    AccessRoleDefinition._defaults(this);
  }

  AccessRoleDefinitionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _code = $v.code;
      _displayName = $v.displayName;
      _description = $v.description;
      _scope = $v.scope;
      _systemRole = $v.systemRole;
      _system = $v.system;
      _protected = $v.protected;
      _active = $v.active;
      _version = $v.version;
      _affectedUsers = $v.affectedUsers;
      _capabilities = $v.capabilities.toBuilder();
      _createdAt = $v.createdAt;
      _updatedAt = $v.updatedAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AccessRoleDefinition other) {
    _$v = other as _$AccessRoleDefinition;
  }

  @override
  void update(void Function(AccessRoleDefinitionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AccessRoleDefinition build() => _build();

  _$AccessRoleDefinition _build() {
    _$AccessRoleDefinition _$result;
    try {
      _$result =
          _$v ??
          _$AccessRoleDefinition._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'AccessRoleDefinition',
              'id',
            ),
            code: BuiltValueNullFieldError.checkNotNull(
              code,
              r'AccessRoleDefinition',
              'code',
            ),
            displayName: BuiltValueNullFieldError.checkNotNull(
              displayName,
              r'AccessRoleDefinition',
              'displayName',
            ),
            description: BuiltValueNullFieldError.checkNotNull(
              description,
              r'AccessRoleDefinition',
              'description',
            ),
            scope: BuiltValueNullFieldError.checkNotNull(
              scope,
              r'AccessRoleDefinition',
              'scope',
            ),
            systemRole: systemRole,
            system: BuiltValueNullFieldError.checkNotNull(
              system,
              r'AccessRoleDefinition',
              'system',
            ),
            protected: BuiltValueNullFieldError.checkNotNull(
              protected,
              r'AccessRoleDefinition',
              'protected',
            ),
            active: BuiltValueNullFieldError.checkNotNull(
              active,
              r'AccessRoleDefinition',
              'active',
            ),
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'AccessRoleDefinition',
              'version',
            ),
            affectedUsers: BuiltValueNullFieldError.checkNotNull(
              affectedUsers,
              r'AccessRoleDefinition',
              'affectedUsers',
            ),
            capabilities: capabilities.build(),
            createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt,
              r'AccessRoleDefinition',
              'createdAt',
            ),
            updatedAt: BuiltValueNullFieldError.checkNotNull(
              updatedAt,
              r'AccessRoleDefinition',
              'updatedAt',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'capabilities';
        capabilities.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'AccessRoleDefinition',
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
