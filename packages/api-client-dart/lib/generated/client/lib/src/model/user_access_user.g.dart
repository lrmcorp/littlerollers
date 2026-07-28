// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_access_user.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const UserAccessUserStatusEnum _$userAccessUserStatusEnum_PENDING_ACTIVATION =
    const UserAccessUserStatusEnum._('PENDING_ACTIVATION');
const UserAccessUserStatusEnum _$userAccessUserStatusEnum_ACTIVE =
    const UserAccessUserStatusEnum._('ACTIVE');
const UserAccessUserStatusEnum _$userAccessUserStatusEnum_INACTIVE =
    const UserAccessUserStatusEnum._('INACTIVE');

UserAccessUserStatusEnum _$userAccessUserStatusEnumValueOf(String name) {
  switch (name) {
    case 'PENDING_ACTIVATION':
      return _$userAccessUserStatusEnum_PENDING_ACTIVATION;
    case 'ACTIVE':
      return _$userAccessUserStatusEnum_ACTIVE;
    case 'INACTIVE':
      return _$userAccessUserStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<UserAccessUserStatusEnum> _$userAccessUserStatusEnumValues =
    BuiltSet<UserAccessUserStatusEnum>(const <UserAccessUserStatusEnum>[
      _$userAccessUserStatusEnum_PENDING_ACTIVATION,
      _$userAccessUserStatusEnum_ACTIVE,
      _$userAccessUserStatusEnum_INACTIVE,
    ]);

Serializer<UserAccessUserStatusEnum> _$userAccessUserStatusEnumSerializer =
    _$UserAccessUserStatusEnumSerializer();

class _$UserAccessUserStatusEnumSerializer
    implements PrimitiveSerializer<UserAccessUserStatusEnum> {
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
  final Iterable<Type> types = const <Type>[UserAccessUserStatusEnum];
  @override
  final String wireName = 'UserAccessUserStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    UserAccessUserStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  UserAccessUserStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => UserAccessUserStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$UserAccessUser extends UserAccessUser {
  @override
  final String id;
  @override
  final String displayName;
  @override
  final UserAccessUserStatusEnum status;
  @override
  final int version;

  factory _$UserAccessUser([void Function(UserAccessUserBuilder)? updates]) =>
      (UserAccessUserBuilder()..update(updates))._build();

  _$UserAccessUser._({
    required this.id,
    required this.displayName,
    required this.status,
    required this.version,
  }) : super._();
  @override
  UserAccessUser rebuild(void Function(UserAccessUserBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  UserAccessUserBuilder toBuilder() => UserAccessUserBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UserAccessUser &&
        id == other.id &&
        displayName == other.displayName &&
        status == other.status &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UserAccessUser')
          ..add('id', id)
          ..add('displayName', displayName)
          ..add('status', status)
          ..add('version', version))
        .toString();
  }
}

class UserAccessUserBuilder
    implements Builder<UserAccessUser, UserAccessUserBuilder> {
  _$UserAccessUser? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  UserAccessUserStatusEnum? _status;
  UserAccessUserStatusEnum? get status => _$this._status;
  set status(UserAccessUserStatusEnum? status) => _$this._status = status;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  UserAccessUserBuilder() {
    UserAccessUser._defaults(this);
  }

  UserAccessUserBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _displayName = $v.displayName;
      _status = $v.status;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UserAccessUser other) {
    _$v = other as _$UserAccessUser;
  }

  @override
  void update(void Function(UserAccessUserBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UserAccessUser build() => _build();

  _$UserAccessUser _build() {
    final _$result =
        _$v ??
        _$UserAccessUser._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'UserAccessUser',
            'id',
          ),
          displayName: BuiltValueNullFieldError.checkNotNull(
            displayName,
            r'UserAccessUser',
            'displayName',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'UserAccessUser',
            'status',
          ),
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'UserAccessUser',
            'version',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
