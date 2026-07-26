// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'me.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const MeIdentityVerificationStatusEnum
_$meIdentityVerificationStatusEnum_NOT_REQUIRED =
    const MeIdentityVerificationStatusEnum._('NOT_REQUIRED');
const MeIdentityVerificationStatusEnum
_$meIdentityVerificationStatusEnum_PENDING =
    const MeIdentityVerificationStatusEnum._('PENDING');
const MeIdentityVerificationStatusEnum
_$meIdentityVerificationStatusEnum_ACTION_REQUIRED =
    const MeIdentityVerificationStatusEnum._('ACTION_REQUIRED');
const MeIdentityVerificationStatusEnum
_$meIdentityVerificationStatusEnum_APPROVED =
    const MeIdentityVerificationStatusEnum._('APPROVED');

MeIdentityVerificationStatusEnum _$meIdentityVerificationStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'NOT_REQUIRED':
      return _$meIdentityVerificationStatusEnum_NOT_REQUIRED;
    case 'PENDING':
      return _$meIdentityVerificationStatusEnum_PENDING;
    case 'ACTION_REQUIRED':
      return _$meIdentityVerificationStatusEnum_ACTION_REQUIRED;
    case 'APPROVED':
      return _$meIdentityVerificationStatusEnum_APPROVED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<MeIdentityVerificationStatusEnum>
_$meIdentityVerificationStatusEnumValues =
    BuiltSet<MeIdentityVerificationStatusEnum>(
      const <MeIdentityVerificationStatusEnum>[
        _$meIdentityVerificationStatusEnum_NOT_REQUIRED,
        _$meIdentityVerificationStatusEnum_PENDING,
        _$meIdentityVerificationStatusEnum_ACTION_REQUIRED,
        _$meIdentityVerificationStatusEnum_APPROVED,
      ],
    );

Serializer<MeIdentityVerificationStatusEnum>
_$meIdentityVerificationStatusEnumSerializer =
    _$MeIdentityVerificationStatusEnumSerializer();

class _$MeIdentityVerificationStatusEnumSerializer
    implements PrimitiveSerializer<MeIdentityVerificationStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'NOT_REQUIRED': 'NOT_REQUIRED',
    'PENDING': 'PENDING',
    'ACTION_REQUIRED': 'ACTION_REQUIRED',
    'APPROVED': 'APPROVED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'NOT_REQUIRED': 'NOT_REQUIRED',
    'PENDING': 'PENDING',
    'ACTION_REQUIRED': 'ACTION_REQUIRED',
    'APPROVED': 'APPROVED',
  };

  @override
  final Iterable<Type> types = const <Type>[MeIdentityVerificationStatusEnum];
  @override
  final String wireName = 'MeIdentityVerificationStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    MeIdentityVerificationStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  MeIdentityVerificationStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => MeIdentityVerificationStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$Me extends Me {
  @override
  final String id;
  @override
  final String displayName;
  @override
  final BuiltList<Role> roles;
  @override
  final BuiltList<String> branchIds;
  @override
  final BuiltList<String> capabilities;
  @override
  final MeIdentityVerificationStatusEnum identityVerificationStatus;
  @override
  final DateTime sessionExpiresAt;
  @override
  final BuiltList<SessionBranch> branches;

  factory _$Me([void Function(MeBuilder)? updates]) =>
      (MeBuilder()..update(updates))._build();

  _$Me._({
    required this.id,
    required this.displayName,
    required this.roles,
    required this.branchIds,
    required this.capabilities,
    required this.identityVerificationStatus,
    required this.sessionExpiresAt,
    required this.branches,
  }) : super._();
  @override
  Me rebuild(void Function(MeBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  MeBuilder toBuilder() => MeBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Me &&
        id == other.id &&
        displayName == other.displayName &&
        roles == other.roles &&
        branchIds == other.branchIds &&
        capabilities == other.capabilities &&
        identityVerificationStatus == other.identityVerificationStatus &&
        sessionExpiresAt == other.sessionExpiresAt &&
        branches == other.branches;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jc(_$hash, roles.hashCode);
    _$hash = $jc(_$hash, branchIds.hashCode);
    _$hash = $jc(_$hash, capabilities.hashCode);
    _$hash = $jc(_$hash, identityVerificationStatus.hashCode);
    _$hash = $jc(_$hash, sessionExpiresAt.hashCode);
    _$hash = $jc(_$hash, branches.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Me')
          ..add('id', id)
          ..add('displayName', displayName)
          ..add('roles', roles)
          ..add('branchIds', branchIds)
          ..add('capabilities', capabilities)
          ..add('identityVerificationStatus', identityVerificationStatus)
          ..add('sessionExpiresAt', sessionExpiresAt)
          ..add('branches', branches))
        .toString();
  }
}

class MeBuilder implements Builder<Me, MeBuilder> {
  _$Me? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  ListBuilder<Role>? _roles;
  ListBuilder<Role> get roles => _$this._roles ??= ListBuilder<Role>();
  set roles(ListBuilder<Role>? roles) => _$this._roles = roles;

  ListBuilder<String>? _branchIds;
  ListBuilder<String> get branchIds =>
      _$this._branchIds ??= ListBuilder<String>();
  set branchIds(ListBuilder<String>? branchIds) =>
      _$this._branchIds = branchIds;

  ListBuilder<String>? _capabilities;
  ListBuilder<String> get capabilities =>
      _$this._capabilities ??= ListBuilder<String>();
  set capabilities(ListBuilder<String>? capabilities) =>
      _$this._capabilities = capabilities;

  MeIdentityVerificationStatusEnum? _identityVerificationStatus;
  MeIdentityVerificationStatusEnum? get identityVerificationStatus =>
      _$this._identityVerificationStatus;
  set identityVerificationStatus(
    MeIdentityVerificationStatusEnum? identityVerificationStatus,
  ) => _$this._identityVerificationStatus = identityVerificationStatus;

  DateTime? _sessionExpiresAt;
  DateTime? get sessionExpiresAt => _$this._sessionExpiresAt;
  set sessionExpiresAt(DateTime? sessionExpiresAt) =>
      _$this._sessionExpiresAt = sessionExpiresAt;

  ListBuilder<SessionBranch>? _branches;
  ListBuilder<SessionBranch> get branches =>
      _$this._branches ??= ListBuilder<SessionBranch>();
  set branches(ListBuilder<SessionBranch>? branches) =>
      _$this._branches = branches;

  MeBuilder() {
    Me._defaults(this);
  }

  MeBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _displayName = $v.displayName;
      _roles = $v.roles.toBuilder();
      _branchIds = $v.branchIds.toBuilder();
      _capabilities = $v.capabilities.toBuilder();
      _identityVerificationStatus = $v.identityVerificationStatus;
      _sessionExpiresAt = $v.sessionExpiresAt;
      _branches = $v.branches.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Me other) {
    _$v = other as _$Me;
  }

  @override
  void update(void Function(MeBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Me build() => _build();

  _$Me _build() {
    _$Me _$result;
    try {
      _$result =
          _$v ??
          _$Me._(
            id: BuiltValueNullFieldError.checkNotNull(id, r'Me', 'id'),
            displayName: BuiltValueNullFieldError.checkNotNull(
              displayName,
              r'Me',
              'displayName',
            ),
            roles: roles.build(),
            branchIds: branchIds.build(),
            capabilities: capabilities.build(),
            identityVerificationStatus: BuiltValueNullFieldError.checkNotNull(
              identityVerificationStatus,
              r'Me',
              'identityVerificationStatus',
            ),
            sessionExpiresAt: BuiltValueNullFieldError.checkNotNull(
              sessionExpiresAt,
              r'Me',
              'sessionExpiresAt',
            ),
            branches: branches.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'roles';
        roles.build();
        _$failedField = 'branchIds';
        branchIds.build();
        _$failedField = 'capabilities';
        capabilities.build();

        _$failedField = 'branches';
        branches.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(r'Me', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
