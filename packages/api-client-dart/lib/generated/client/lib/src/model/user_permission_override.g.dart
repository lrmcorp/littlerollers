// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_permission_override.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const UserPermissionOverrideEffectEnum
_$userPermissionOverrideEffectEnum_GRANT =
    const UserPermissionOverrideEffectEnum._('GRANT');
const UserPermissionOverrideEffectEnum _$userPermissionOverrideEffectEnum_DENY =
    const UserPermissionOverrideEffectEnum._('DENY');

UserPermissionOverrideEffectEnum _$userPermissionOverrideEffectEnumValueOf(
  String name,
) {
  switch (name) {
    case 'GRANT':
      return _$userPermissionOverrideEffectEnum_GRANT;
    case 'DENY':
      return _$userPermissionOverrideEffectEnum_DENY;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<UserPermissionOverrideEffectEnum>
_$userPermissionOverrideEffectEnumValues =
    BuiltSet<UserPermissionOverrideEffectEnum>(
      const <UserPermissionOverrideEffectEnum>[
        _$userPermissionOverrideEffectEnum_GRANT,
        _$userPermissionOverrideEffectEnum_DENY,
      ],
    );

Serializer<UserPermissionOverrideEffectEnum>
_$userPermissionOverrideEffectEnumSerializer =
    _$UserPermissionOverrideEffectEnumSerializer();

class _$UserPermissionOverrideEffectEnumSerializer
    implements PrimitiveSerializer<UserPermissionOverrideEffectEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'GRANT': 'GRANT',
    'DENY': 'DENY',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'GRANT': 'GRANT',
    'DENY': 'DENY',
  };

  @override
  final Iterable<Type> types = const <Type>[UserPermissionOverrideEffectEnum];
  @override
  final String wireName = 'UserPermissionOverrideEffectEnum';

  @override
  Object serialize(
    Serializers serializers,
    UserPermissionOverrideEffectEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  UserPermissionOverrideEffectEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => UserPermissionOverrideEffectEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$UserPermissionOverride extends UserPermissionOverride {
  @override
  final String id;
  @override
  final String capabilityKey;
  @override
  final String capabilityLabel;
  @override
  final UserPermissionOverrideEffectEnum effect;
  @override
  final String? branchId;
  @override
  final UserAccessRoleAssignmentBranch? branch;
  @override
  final AccessReasonCode reasonCode;
  @override
  final int version;
  @override
  final DateTime createdAt;

  factory _$UserPermissionOverride([
    void Function(UserPermissionOverrideBuilder)? updates,
  ]) => (UserPermissionOverrideBuilder()..update(updates))._build();

  _$UserPermissionOverride._({
    required this.id,
    required this.capabilityKey,
    required this.capabilityLabel,
    required this.effect,
    this.branchId,
    this.branch,
    required this.reasonCode,
    required this.version,
    required this.createdAt,
  }) : super._();
  @override
  UserPermissionOverride rebuild(
    void Function(UserPermissionOverrideBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  UserPermissionOverrideBuilder toBuilder() =>
      UserPermissionOverrideBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UserPermissionOverride &&
        id == other.id &&
        capabilityKey == other.capabilityKey &&
        capabilityLabel == other.capabilityLabel &&
        effect == other.effect &&
        branchId == other.branchId &&
        branch == other.branch &&
        reasonCode == other.reasonCode &&
        version == other.version &&
        createdAt == other.createdAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, capabilityKey.hashCode);
    _$hash = $jc(_$hash, capabilityLabel.hashCode);
    _$hash = $jc(_$hash, effect.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, branch.hashCode);
    _$hash = $jc(_$hash, reasonCode.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UserPermissionOverride')
          ..add('id', id)
          ..add('capabilityKey', capabilityKey)
          ..add('capabilityLabel', capabilityLabel)
          ..add('effect', effect)
          ..add('branchId', branchId)
          ..add('branch', branch)
          ..add('reasonCode', reasonCode)
          ..add('version', version)
          ..add('createdAt', createdAt))
        .toString();
  }
}

class UserPermissionOverrideBuilder
    implements Builder<UserPermissionOverride, UserPermissionOverrideBuilder> {
  _$UserPermissionOverride? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _capabilityKey;
  String? get capabilityKey => _$this._capabilityKey;
  set capabilityKey(String? capabilityKey) =>
      _$this._capabilityKey = capabilityKey;

  String? _capabilityLabel;
  String? get capabilityLabel => _$this._capabilityLabel;
  set capabilityLabel(String? capabilityLabel) =>
      _$this._capabilityLabel = capabilityLabel;

  UserPermissionOverrideEffectEnum? _effect;
  UserPermissionOverrideEffectEnum? get effect => _$this._effect;
  set effect(UserPermissionOverrideEffectEnum? effect) =>
      _$this._effect = effect;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  UserAccessRoleAssignmentBranchBuilder? _branch;
  UserAccessRoleAssignmentBranchBuilder get branch =>
      _$this._branch ??= UserAccessRoleAssignmentBranchBuilder();
  set branch(UserAccessRoleAssignmentBranchBuilder? branch) =>
      _$this._branch = branch;

  AccessReasonCode? _reasonCode;
  AccessReasonCode? get reasonCode => _$this._reasonCode;
  set reasonCode(AccessReasonCode? reasonCode) =>
      _$this._reasonCode = reasonCode;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  UserPermissionOverrideBuilder() {
    UserPermissionOverride._defaults(this);
  }

  UserPermissionOverrideBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _capabilityKey = $v.capabilityKey;
      _capabilityLabel = $v.capabilityLabel;
      _effect = $v.effect;
      _branchId = $v.branchId;
      _branch = $v.branch?.toBuilder();
      _reasonCode = $v.reasonCode;
      _version = $v.version;
      _createdAt = $v.createdAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UserPermissionOverride other) {
    _$v = other as _$UserPermissionOverride;
  }

  @override
  void update(void Function(UserPermissionOverrideBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UserPermissionOverride build() => _build();

  _$UserPermissionOverride _build() {
    _$UserPermissionOverride _$result;
    try {
      _$result =
          _$v ??
          _$UserPermissionOverride._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'UserPermissionOverride',
              'id',
            ),
            capabilityKey: BuiltValueNullFieldError.checkNotNull(
              capabilityKey,
              r'UserPermissionOverride',
              'capabilityKey',
            ),
            capabilityLabel: BuiltValueNullFieldError.checkNotNull(
              capabilityLabel,
              r'UserPermissionOverride',
              'capabilityLabel',
            ),
            effect: BuiltValueNullFieldError.checkNotNull(
              effect,
              r'UserPermissionOverride',
              'effect',
            ),
            branchId: branchId,
            branch: _branch?.build(),
            reasonCode: BuiltValueNullFieldError.checkNotNull(
              reasonCode,
              r'UserPermissionOverride',
              'reasonCode',
            ),
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'UserPermissionOverride',
              'version',
            ),
            createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt,
              r'UserPermissionOverride',
              'createdAt',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'branch';
        _branch?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'UserPermissionOverride',
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
