// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const UserSummaryStatusEnum _$userSummaryStatusEnum_PENDING_ACTIVATION =
    const UserSummaryStatusEnum._('PENDING_ACTIVATION');
const UserSummaryStatusEnum _$userSummaryStatusEnum_ACTIVE =
    const UserSummaryStatusEnum._('ACTIVE');
const UserSummaryStatusEnum _$userSummaryStatusEnum_INACTIVE =
    const UserSummaryStatusEnum._('INACTIVE');

UserSummaryStatusEnum _$userSummaryStatusEnumValueOf(String name) {
  switch (name) {
    case 'PENDING_ACTIVATION':
      return _$userSummaryStatusEnum_PENDING_ACTIVATION;
    case 'ACTIVE':
      return _$userSummaryStatusEnum_ACTIVE;
    case 'INACTIVE':
      return _$userSummaryStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<UserSummaryStatusEnum> _$userSummaryStatusEnumValues =
    BuiltSet<UserSummaryStatusEnum>(const <UserSummaryStatusEnum>[
      _$userSummaryStatusEnum_PENDING_ACTIVATION,
      _$userSummaryStatusEnum_ACTIVE,
      _$userSummaryStatusEnum_INACTIVE,
    ]);

const UserSummaryAudienceEnum _$userSummaryAudienceEnum_STAFF =
    const UserSummaryAudienceEnum._('STAFF');
const UserSummaryAudienceEnum _$userSummaryAudienceEnum_CUSTOMER =
    const UserSummaryAudienceEnum._('CUSTOMER');

UserSummaryAudienceEnum _$userSummaryAudienceEnumValueOf(String name) {
  switch (name) {
    case 'STAFF':
      return _$userSummaryAudienceEnum_STAFF;
    case 'CUSTOMER':
      return _$userSummaryAudienceEnum_CUSTOMER;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<UserSummaryAudienceEnum> _$userSummaryAudienceEnumValues =
    BuiltSet<UserSummaryAudienceEnum>(const <UserSummaryAudienceEnum>[
      _$userSummaryAudienceEnum_STAFF,
      _$userSummaryAudienceEnum_CUSTOMER,
    ]);

Serializer<UserSummaryStatusEnum> _$userSummaryStatusEnumSerializer =
    _$UserSummaryStatusEnumSerializer();
Serializer<UserSummaryAudienceEnum> _$userSummaryAudienceEnumSerializer =
    _$UserSummaryAudienceEnumSerializer();

class _$UserSummaryStatusEnumSerializer
    implements PrimitiveSerializer<UserSummaryStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PENDING_ACTIVATION': 'PENDING_ACTIVATION',
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PENDING_ACTIVATION': 'PENDING_ACTIVATION',
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };

  @override
  final Iterable<Type> types = const <Type>[UserSummaryStatusEnum];
  @override
  final String wireName = 'UserSummaryStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    UserSummaryStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  UserSummaryStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => UserSummaryStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$UserSummaryAudienceEnumSerializer
    implements PrimitiveSerializer<UserSummaryAudienceEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'STAFF': 'STAFF',
    'CUSTOMER': 'CUSTOMER',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'STAFF': 'STAFF',
    'CUSTOMER': 'CUSTOMER',
  };

  @override
  final Iterable<Type> types = const <Type>[UserSummaryAudienceEnum];
  @override
  final String wireName = 'UserSummaryAudienceEnum';

  @override
  Object serialize(
    Serializers serializers,
    UserSummaryAudienceEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  UserSummaryAudienceEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => UserSummaryAudienceEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$UserSummary extends UserSummary {
  @override
  final String id;
  @override
  final String displayName;
  @override
  final String? phoneE164;
  @override
  final UserSummaryStatusEnum status;
  @override
  final int version;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  final BuiltList<UserRoleSummary> roles;
  @override
  final BuiltList<UserRoleSummary> directRoles;
  @override
  final BuiltList<UserRoleSummary> assignmentRoles;
  @override
  final BuiltList<String> effectiveCapabilities;
  @override
  final UserSummaryAudienceEnum audience;
  @override
  final UserVerificationSummary? identityVerification;

  factory _$UserSummary([void Function(UserSummaryBuilder)? updates]) =>
      (UserSummaryBuilder()..update(updates))._build();

  _$UserSummary._({
    required this.id,
    required this.displayName,
    this.phoneE164,
    required this.status,
    required this.version,
    required this.createdAt,
    required this.updatedAt,
    required this.roles,
    required this.directRoles,
    required this.assignmentRoles,
    required this.effectiveCapabilities,
    required this.audience,
    this.identityVerification,
  }) : super._();
  @override
  UserSummary rebuild(void Function(UserSummaryBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  UserSummaryBuilder toBuilder() => UserSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UserSummary &&
        id == other.id &&
        displayName == other.displayName &&
        phoneE164 == other.phoneE164 &&
        status == other.status &&
        version == other.version &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt &&
        roles == other.roles &&
        directRoles == other.directRoles &&
        assignmentRoles == other.assignmentRoles &&
        effectiveCapabilities == other.effectiveCapabilities &&
        audience == other.audience &&
        identityVerification == other.identityVerification;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jc(_$hash, phoneE164.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jc(_$hash, roles.hashCode);
    _$hash = $jc(_$hash, directRoles.hashCode);
    _$hash = $jc(_$hash, assignmentRoles.hashCode);
    _$hash = $jc(_$hash, effectiveCapabilities.hashCode);
    _$hash = $jc(_$hash, audience.hashCode);
    _$hash = $jc(_$hash, identityVerification.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UserSummary')
          ..add('id', id)
          ..add('displayName', displayName)
          ..add('phoneE164', phoneE164)
          ..add('status', status)
          ..add('version', version)
          ..add('createdAt', createdAt)
          ..add('updatedAt', updatedAt)
          ..add('roles', roles)
          ..add('directRoles', directRoles)
          ..add('assignmentRoles', assignmentRoles)
          ..add('effectiveCapabilities', effectiveCapabilities)
          ..add('audience', audience)
          ..add('identityVerification', identityVerification))
        .toString();
  }
}

class UserSummaryBuilder implements Builder<UserSummary, UserSummaryBuilder> {
  _$UserSummary? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  String? _phoneE164;
  String? get phoneE164 => _$this._phoneE164;
  set phoneE164(String? phoneE164) => _$this._phoneE164 = phoneE164;

  UserSummaryStatusEnum? _status;
  UserSummaryStatusEnum? get status => _$this._status;
  set status(UserSummaryStatusEnum? status) => _$this._status = status;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  ListBuilder<UserRoleSummary>? _roles;
  ListBuilder<UserRoleSummary> get roles =>
      _$this._roles ??= ListBuilder<UserRoleSummary>();
  set roles(ListBuilder<UserRoleSummary>? roles) => _$this._roles = roles;

  ListBuilder<UserRoleSummary>? _directRoles;
  ListBuilder<UserRoleSummary> get directRoles =>
      _$this._directRoles ??= ListBuilder<UserRoleSummary>();
  set directRoles(ListBuilder<UserRoleSummary>? directRoles) =>
      _$this._directRoles = directRoles;

  ListBuilder<UserRoleSummary>? _assignmentRoles;
  ListBuilder<UserRoleSummary> get assignmentRoles =>
      _$this._assignmentRoles ??= ListBuilder<UserRoleSummary>();
  set assignmentRoles(ListBuilder<UserRoleSummary>? assignmentRoles) =>
      _$this._assignmentRoles = assignmentRoles;

  ListBuilder<String>? _effectiveCapabilities;
  ListBuilder<String> get effectiveCapabilities =>
      _$this._effectiveCapabilities ??= ListBuilder<String>();
  set effectiveCapabilities(ListBuilder<String>? effectiveCapabilities) =>
      _$this._effectiveCapabilities = effectiveCapabilities;

  UserSummaryAudienceEnum? _audience;
  UserSummaryAudienceEnum? get audience => _$this._audience;
  set audience(UserSummaryAudienceEnum? audience) =>
      _$this._audience = audience;

  UserVerificationSummaryBuilder? _identityVerification;
  UserVerificationSummaryBuilder get identityVerification =>
      _$this._identityVerification ??= UserVerificationSummaryBuilder();
  set identityVerification(
    UserVerificationSummaryBuilder? identityVerification,
  ) => _$this._identityVerification = identityVerification;

  UserSummaryBuilder() {
    UserSummary._defaults(this);
  }

  UserSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _displayName = $v.displayName;
      _phoneE164 = $v.phoneE164;
      _status = $v.status;
      _version = $v.version;
      _createdAt = $v.createdAt;
      _updatedAt = $v.updatedAt;
      _roles = $v.roles.toBuilder();
      _directRoles = $v.directRoles.toBuilder();
      _assignmentRoles = $v.assignmentRoles.toBuilder();
      _effectiveCapabilities = $v.effectiveCapabilities.toBuilder();
      _audience = $v.audience;
      _identityVerification = $v.identityVerification?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UserSummary other) {
    _$v = other as _$UserSummary;
  }

  @override
  void update(void Function(UserSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UserSummary build() => _build();

  _$UserSummary _build() {
    _$UserSummary _$result;
    try {
      _$result =
          _$v ??
          _$UserSummary._(
            id: BuiltValueNullFieldError.checkNotNull(id, r'UserSummary', 'id'),
            displayName: BuiltValueNullFieldError.checkNotNull(
              displayName,
              r'UserSummary',
              'displayName',
            ),
            phoneE164: phoneE164,
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'UserSummary',
              'status',
            ),
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'UserSummary',
              'version',
            ),
            createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt,
              r'UserSummary',
              'createdAt',
            ),
            updatedAt: BuiltValueNullFieldError.checkNotNull(
              updatedAt,
              r'UserSummary',
              'updatedAt',
            ),
            roles: roles.build(),
            directRoles: directRoles.build(),
            assignmentRoles: assignmentRoles.build(),
            effectiveCapabilities: effectiveCapabilities.build(),
            audience: BuiltValueNullFieldError.checkNotNull(
              audience,
              r'UserSummary',
              'audience',
            ),
            identityVerification: _identityVerification?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'roles';
        roles.build();
        _$failedField = 'directRoles';
        directRoles.build();
        _$failedField = 'assignmentRoles';
        assignmentRoles.build();
        _$failedField = 'effectiveCapabilities';
        effectiveCapabilities.build();

        _$failedField = 'identityVerification';
        _identityVerification?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'UserSummary',
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
