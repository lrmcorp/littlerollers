// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'session.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const SessionAssuranceEnum _$sessionAssuranceEnum_BASE =
    const SessionAssuranceEnum._('BASE');
const SessionAssuranceEnum _$sessionAssuranceEnum_MFA =
    const SessionAssuranceEnum._('MFA');

SessionAssuranceEnum _$sessionAssuranceEnumValueOf(String name) {
  switch (name) {
    case 'BASE':
      return _$sessionAssuranceEnum_BASE;
    case 'MFA':
      return _$sessionAssuranceEnum_MFA;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<SessionAssuranceEnum> _$sessionAssuranceEnumValues =
    BuiltSet<SessionAssuranceEnum>(const <SessionAssuranceEnum>[
      _$sessionAssuranceEnum_BASE,
      _$sessionAssuranceEnum_MFA,
    ]);

const SessionChannelEnum _$sessionChannelEnum_WEB = const SessionChannelEnum._(
  'WEB',
);
const SessionChannelEnum _$sessionChannelEnum_MOBILE =
    const SessionChannelEnum._('MOBILE');

SessionChannelEnum _$sessionChannelEnumValueOf(String name) {
  switch (name) {
    case 'WEB':
      return _$sessionChannelEnum_WEB;
    case 'MOBILE':
      return _$sessionChannelEnum_MOBILE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<SessionChannelEnum> _$sessionChannelEnumValues =
    BuiltSet<SessionChannelEnum>(const <SessionChannelEnum>[
      _$sessionChannelEnum_WEB,
      _$sessionChannelEnum_MOBILE,
    ]);

Serializer<SessionAssuranceEnum> _$sessionAssuranceEnumSerializer =
    _$SessionAssuranceEnumSerializer();
Serializer<SessionChannelEnum> _$sessionChannelEnumSerializer =
    _$SessionChannelEnumSerializer();

class _$SessionAssuranceEnumSerializer
    implements PrimitiveSerializer<SessionAssuranceEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'BASE': 'BASE',
    'MFA': 'MFA',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'BASE': 'BASE',
    'MFA': 'MFA',
  };

  @override
  final Iterable<Type> types = const <Type>[SessionAssuranceEnum];
  @override
  final String wireName = 'SessionAssuranceEnum';

  @override
  Object serialize(
    Serializers serializers,
    SessionAssuranceEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  SessionAssuranceEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => SessionAssuranceEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$SessionChannelEnumSerializer
    implements PrimitiveSerializer<SessionChannelEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'WEB': 'WEB',
    'MOBILE': 'MOBILE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'WEB': 'WEB',
    'MOBILE': 'MOBILE',
  };

  @override
  final Iterable<Type> types = const <Type>[SessionChannelEnum];
  @override
  final String wireName = 'SessionChannelEnum';

  @override
  Object serialize(
    Serializers serializers,
    SessionChannelEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  SessionChannelEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => SessionChannelEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$Session extends Session {
  @override
  final String? accessToken;
  @override
  final String? refreshToken;
  @override
  final Me user;
  @override
  final SessionAssuranceEnum assurance;
  @override
  final SessionChannelEnum channel;
  @override
  final DateTime expiresAt;
  @override
  final DateTime? refreshExpiresAt;

  factory _$Session([void Function(SessionBuilder)? updates]) =>
      (SessionBuilder()..update(updates))._build();

  _$Session._({
    this.accessToken,
    this.refreshToken,
    required this.user,
    required this.assurance,
    required this.channel,
    required this.expiresAt,
    this.refreshExpiresAt,
  }) : super._();
  @override
  Session rebuild(void Function(SessionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SessionBuilder toBuilder() => SessionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Session &&
        accessToken == other.accessToken &&
        refreshToken == other.refreshToken &&
        user == other.user &&
        assurance == other.assurance &&
        channel == other.channel &&
        expiresAt == other.expiresAt &&
        refreshExpiresAt == other.refreshExpiresAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, accessToken.hashCode);
    _$hash = $jc(_$hash, refreshToken.hashCode);
    _$hash = $jc(_$hash, user.hashCode);
    _$hash = $jc(_$hash, assurance.hashCode);
    _$hash = $jc(_$hash, channel.hashCode);
    _$hash = $jc(_$hash, expiresAt.hashCode);
    _$hash = $jc(_$hash, refreshExpiresAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Session')
          ..add('accessToken', accessToken)
          ..add('refreshToken', refreshToken)
          ..add('user', user)
          ..add('assurance', assurance)
          ..add('channel', channel)
          ..add('expiresAt', expiresAt)
          ..add('refreshExpiresAt', refreshExpiresAt))
        .toString();
  }
}

class SessionBuilder implements Builder<Session, SessionBuilder> {
  _$Session? _$v;

  String? _accessToken;
  String? get accessToken => _$this._accessToken;
  set accessToken(String? accessToken) => _$this._accessToken = accessToken;

  String? _refreshToken;
  String? get refreshToken => _$this._refreshToken;
  set refreshToken(String? refreshToken) => _$this._refreshToken = refreshToken;

  MeBuilder? _user;
  MeBuilder get user => _$this._user ??= MeBuilder();
  set user(MeBuilder? user) => _$this._user = user;

  SessionAssuranceEnum? _assurance;
  SessionAssuranceEnum? get assurance => _$this._assurance;
  set assurance(SessionAssuranceEnum? assurance) =>
      _$this._assurance = assurance;

  SessionChannelEnum? _channel;
  SessionChannelEnum? get channel => _$this._channel;
  set channel(SessionChannelEnum? channel) => _$this._channel = channel;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  DateTime? _refreshExpiresAt;
  DateTime? get refreshExpiresAt => _$this._refreshExpiresAt;
  set refreshExpiresAt(DateTime? refreshExpiresAt) =>
      _$this._refreshExpiresAt = refreshExpiresAt;

  SessionBuilder() {
    Session._defaults(this);
  }

  SessionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _accessToken = $v.accessToken;
      _refreshToken = $v.refreshToken;
      _user = $v.user.toBuilder();
      _assurance = $v.assurance;
      _channel = $v.channel;
      _expiresAt = $v.expiresAt;
      _refreshExpiresAt = $v.refreshExpiresAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Session other) {
    _$v = other as _$Session;
  }

  @override
  void update(void Function(SessionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Session build() => _build();

  _$Session _build() {
    _$Session _$result;
    try {
      _$result =
          _$v ??
          _$Session._(
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: user.build(),
            assurance: BuiltValueNullFieldError.checkNotNull(
              assurance,
              r'Session',
              'assurance',
            ),
            channel: BuiltValueNullFieldError.checkNotNull(
              channel,
              r'Session',
              'channel',
            ),
            expiresAt: BuiltValueNullFieldError.checkNotNull(
              expiresAt,
              r'Session',
              'expiresAt',
            ),
            refreshExpiresAt: refreshExpiresAt,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'user';
        user.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'Session',
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
