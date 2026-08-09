// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'check_in_token.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CheckInTokenPurposeEnum _$checkInTokenPurposeEnum_INSTRUCTOR_CHECK_IN =
    const CheckInTokenPurposeEnum._('INSTRUCTOR_CHECK_IN');
const CheckInTokenPurposeEnum _$checkInTokenPurposeEnum_CUSTOMER_CHECK_IN =
    const CheckInTokenPurposeEnum._('CUSTOMER_CHECK_IN');

CheckInTokenPurposeEnum _$checkInTokenPurposeEnumValueOf(String name) {
  switch (name) {
    case 'INSTRUCTOR_CHECK_IN':
      return _$checkInTokenPurposeEnum_INSTRUCTOR_CHECK_IN;
    case 'CUSTOMER_CHECK_IN':
      return _$checkInTokenPurposeEnum_CUSTOMER_CHECK_IN;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CheckInTokenPurposeEnum> _$checkInTokenPurposeEnumValues =
    BuiltSet<CheckInTokenPurposeEnum>(const <CheckInTokenPurposeEnum>[
      _$checkInTokenPurposeEnum_INSTRUCTOR_CHECK_IN,
      _$checkInTokenPurposeEnum_CUSTOMER_CHECK_IN,
    ]);

const CheckInTokenAudienceTypeEnum _$checkInTokenAudienceTypeEnum_USER =
    const CheckInTokenAudienceTypeEnum._('USER');
const CheckInTokenAudienceTypeEnum _$checkInTokenAudienceTypeEnum_BOOKING =
    const CheckInTokenAudienceTypeEnum._('BOOKING');

CheckInTokenAudienceTypeEnum _$checkInTokenAudienceTypeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'USER':
      return _$checkInTokenAudienceTypeEnum_USER;
    case 'BOOKING':
      return _$checkInTokenAudienceTypeEnum_BOOKING;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CheckInTokenAudienceTypeEnum>
_$checkInTokenAudienceTypeEnumValues = BuiltSet<CheckInTokenAudienceTypeEnum>(
  const <CheckInTokenAudienceTypeEnum>[
    _$checkInTokenAudienceTypeEnum_USER,
    _$checkInTokenAudienceTypeEnum_BOOKING,
  ],
);

const CheckInTokenResourceTypeEnum _$checkInTokenResourceTypeEnum_CLASS_SLOT =
    const CheckInTokenResourceTypeEnum._('CLASS_SLOT');
const CheckInTokenResourceTypeEnum _$checkInTokenResourceTypeEnum_BOOKING =
    const CheckInTokenResourceTypeEnum._('BOOKING');

CheckInTokenResourceTypeEnum _$checkInTokenResourceTypeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'CLASS_SLOT':
      return _$checkInTokenResourceTypeEnum_CLASS_SLOT;
    case 'BOOKING':
      return _$checkInTokenResourceTypeEnum_BOOKING;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CheckInTokenResourceTypeEnum>
_$checkInTokenResourceTypeEnumValues =
    BuiltSet<CheckInTokenResourceTypeEnum>(const <CheckInTokenResourceTypeEnum>[
      _$checkInTokenResourceTypeEnum_CLASS_SLOT,
      _$checkInTokenResourceTypeEnum_BOOKING,
    ]);

const CheckInTokenStatusEnum _$checkInTokenStatusEnum_ACTIVE =
    const CheckInTokenStatusEnum._('ACTIVE');
const CheckInTokenStatusEnum _$checkInTokenStatusEnum_USED =
    const CheckInTokenStatusEnum._('USED');
const CheckInTokenStatusEnum _$checkInTokenStatusEnum_REVOKED =
    const CheckInTokenStatusEnum._('REVOKED');
const CheckInTokenStatusEnum _$checkInTokenStatusEnum_EXPIRED =
    const CheckInTokenStatusEnum._('EXPIRED');

CheckInTokenStatusEnum _$checkInTokenStatusEnumValueOf(String name) {
  switch (name) {
    case 'ACTIVE':
      return _$checkInTokenStatusEnum_ACTIVE;
    case 'USED':
      return _$checkInTokenStatusEnum_USED;
    case 'REVOKED':
      return _$checkInTokenStatusEnum_REVOKED;
    case 'EXPIRED':
      return _$checkInTokenStatusEnum_EXPIRED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CheckInTokenStatusEnum> _$checkInTokenStatusEnumValues =
    BuiltSet<CheckInTokenStatusEnum>(const <CheckInTokenStatusEnum>[
      _$checkInTokenStatusEnum_ACTIVE,
      _$checkInTokenStatusEnum_USED,
      _$checkInTokenStatusEnum_REVOKED,
      _$checkInTokenStatusEnum_EXPIRED,
    ]);

Serializer<CheckInTokenPurposeEnum> _$checkInTokenPurposeEnumSerializer =
    _$CheckInTokenPurposeEnumSerializer();
Serializer<CheckInTokenAudienceTypeEnum>
_$checkInTokenAudienceTypeEnumSerializer =
    _$CheckInTokenAudienceTypeEnumSerializer();
Serializer<CheckInTokenResourceTypeEnum>
_$checkInTokenResourceTypeEnumSerializer =
    _$CheckInTokenResourceTypeEnumSerializer();
Serializer<CheckInTokenStatusEnum> _$checkInTokenStatusEnumSerializer =
    _$CheckInTokenStatusEnumSerializer();

class _$CheckInTokenPurposeEnumSerializer
    implements PrimitiveSerializer<CheckInTokenPurposeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'INSTRUCTOR_CHECK_IN': 'INSTRUCTOR_CHECK_IN',
    'CUSTOMER_CHECK_IN': 'CUSTOMER_CHECK_IN',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'INSTRUCTOR_CHECK_IN': 'INSTRUCTOR_CHECK_IN',
    'CUSTOMER_CHECK_IN': 'CUSTOMER_CHECK_IN',
  };

  @override
  final Iterable<Type> types = const <Type>[CheckInTokenPurposeEnum];
  @override
  final String wireName = 'CheckInTokenPurposeEnum';

  @override
  Object serialize(
    Serializers serializers,
    CheckInTokenPurposeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CheckInTokenPurposeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CheckInTokenPurposeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CheckInTokenAudienceTypeEnumSerializer
    implements PrimitiveSerializer<CheckInTokenAudienceTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'USER': 'USER',
    'BOOKING': 'BOOKING',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'USER': 'USER',
    'BOOKING': 'BOOKING',
  };

  @override
  final Iterable<Type> types = const <Type>[CheckInTokenAudienceTypeEnum];
  @override
  final String wireName = 'CheckInTokenAudienceTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    CheckInTokenAudienceTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CheckInTokenAudienceTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CheckInTokenAudienceTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CheckInTokenResourceTypeEnumSerializer
    implements PrimitiveSerializer<CheckInTokenResourceTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'CLASS_SLOT': 'CLASS_SLOT',
    'BOOKING': 'BOOKING',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'CLASS_SLOT': 'CLASS_SLOT',
    'BOOKING': 'BOOKING',
  };

  @override
  final Iterable<Type> types = const <Type>[CheckInTokenResourceTypeEnum];
  @override
  final String wireName = 'CheckInTokenResourceTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    CheckInTokenResourceTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CheckInTokenResourceTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CheckInTokenResourceTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CheckInTokenStatusEnumSerializer
    implements PrimitiveSerializer<CheckInTokenStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'USED': 'USED',
    'REVOKED': 'REVOKED',
    'EXPIRED': 'EXPIRED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'USED': 'USED',
    'REVOKED': 'REVOKED',
    'EXPIRED': 'EXPIRED',
  };

  @override
  final Iterable<Type> types = const <Type>[CheckInTokenStatusEnum];
  @override
  final String wireName = 'CheckInTokenStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    CheckInTokenStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CheckInTokenStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CheckInTokenStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CheckInToken extends CheckInToken {
  @override
  final String id;
  @override
  final CheckInTokenPurposeEnum purpose;
  @override
  final CheckInTokenAudienceTypeEnum audienceType;
  @override
  final CheckInTokenResourceTypeEnum resourceType;
  @override
  final String resourceId;
  @override
  final DateTime notBeforeAt;
  @override
  final DateTime expiresAt;
  @override
  final CheckInTokenStatusEnum status;
  @override
  final int version;
  @override
  final String? token;
  @override
  final bool idempotentReplay;

  factory _$CheckInToken([void Function(CheckInTokenBuilder)? updates]) =>
      (CheckInTokenBuilder()..update(updates))._build();

  _$CheckInToken._({
    required this.id,
    required this.purpose,
    required this.audienceType,
    required this.resourceType,
    required this.resourceId,
    required this.notBeforeAt,
    required this.expiresAt,
    required this.status,
    required this.version,
    this.token,
    required this.idempotentReplay,
  }) : super._();
  @override
  CheckInToken rebuild(void Function(CheckInTokenBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CheckInTokenBuilder toBuilder() => CheckInTokenBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CheckInToken &&
        id == other.id &&
        purpose == other.purpose &&
        audienceType == other.audienceType &&
        resourceType == other.resourceType &&
        resourceId == other.resourceId &&
        notBeforeAt == other.notBeforeAt &&
        expiresAt == other.expiresAt &&
        status == other.status &&
        version == other.version &&
        token == other.token &&
        idempotentReplay == other.idempotentReplay;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, purpose.hashCode);
    _$hash = $jc(_$hash, audienceType.hashCode);
    _$hash = $jc(_$hash, resourceType.hashCode);
    _$hash = $jc(_$hash, resourceId.hashCode);
    _$hash = $jc(_$hash, notBeforeAt.hashCode);
    _$hash = $jc(_$hash, expiresAt.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jc(_$hash, token.hashCode);
    _$hash = $jc(_$hash, idempotentReplay.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CheckInToken')
          ..add('id', id)
          ..add('purpose', purpose)
          ..add('audienceType', audienceType)
          ..add('resourceType', resourceType)
          ..add('resourceId', resourceId)
          ..add('notBeforeAt', notBeforeAt)
          ..add('expiresAt', expiresAt)
          ..add('status', status)
          ..add('version', version)
          ..add('token', token)
          ..add('idempotentReplay', idempotentReplay))
        .toString();
  }
}

class CheckInTokenBuilder
    implements Builder<CheckInToken, CheckInTokenBuilder> {
  _$CheckInToken? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  CheckInTokenPurposeEnum? _purpose;
  CheckInTokenPurposeEnum? get purpose => _$this._purpose;
  set purpose(CheckInTokenPurposeEnum? purpose) => _$this._purpose = purpose;

  CheckInTokenAudienceTypeEnum? _audienceType;
  CheckInTokenAudienceTypeEnum? get audienceType => _$this._audienceType;
  set audienceType(CheckInTokenAudienceTypeEnum? audienceType) =>
      _$this._audienceType = audienceType;

  CheckInTokenResourceTypeEnum? _resourceType;
  CheckInTokenResourceTypeEnum? get resourceType => _$this._resourceType;
  set resourceType(CheckInTokenResourceTypeEnum? resourceType) =>
      _$this._resourceType = resourceType;

  String? _resourceId;
  String? get resourceId => _$this._resourceId;
  set resourceId(String? resourceId) => _$this._resourceId = resourceId;

  DateTime? _notBeforeAt;
  DateTime? get notBeforeAt => _$this._notBeforeAt;
  set notBeforeAt(DateTime? notBeforeAt) => _$this._notBeforeAt = notBeforeAt;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  CheckInTokenStatusEnum? _status;
  CheckInTokenStatusEnum? get status => _$this._status;
  set status(CheckInTokenStatusEnum? status) => _$this._status = status;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  String? _token;
  String? get token => _$this._token;
  set token(String? token) => _$this._token = token;

  bool? _idempotentReplay;
  bool? get idempotentReplay => _$this._idempotentReplay;
  set idempotentReplay(bool? idempotentReplay) =>
      _$this._idempotentReplay = idempotentReplay;

  CheckInTokenBuilder() {
    CheckInToken._defaults(this);
  }

  CheckInTokenBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _purpose = $v.purpose;
      _audienceType = $v.audienceType;
      _resourceType = $v.resourceType;
      _resourceId = $v.resourceId;
      _notBeforeAt = $v.notBeforeAt;
      _expiresAt = $v.expiresAt;
      _status = $v.status;
      _version = $v.version;
      _token = $v.token;
      _idempotentReplay = $v.idempotentReplay;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CheckInToken other) {
    _$v = other as _$CheckInToken;
  }

  @override
  void update(void Function(CheckInTokenBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CheckInToken build() => _build();

  _$CheckInToken _build() {
    final _$result =
        _$v ??
        _$CheckInToken._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'CheckInToken', 'id'),
          purpose: BuiltValueNullFieldError.checkNotNull(
            purpose,
            r'CheckInToken',
            'purpose',
          ),
          audienceType: BuiltValueNullFieldError.checkNotNull(
            audienceType,
            r'CheckInToken',
            'audienceType',
          ),
          resourceType: BuiltValueNullFieldError.checkNotNull(
            resourceType,
            r'CheckInToken',
            'resourceType',
          ),
          resourceId: BuiltValueNullFieldError.checkNotNull(
            resourceId,
            r'CheckInToken',
            'resourceId',
          ),
          notBeforeAt: BuiltValueNullFieldError.checkNotNull(
            notBeforeAt,
            r'CheckInToken',
            'notBeforeAt',
          ),
          expiresAt: BuiltValueNullFieldError.checkNotNull(
            expiresAt,
            r'CheckInToken',
            'expiresAt',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'CheckInToken',
            'status',
          ),
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'CheckInToken',
            'version',
          ),
          token: token,
          idempotentReplay: BuiltValueNullFieldError.checkNotNull(
            idempotentReplay,
            r'CheckInToken',
            'idempotentReplay',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
