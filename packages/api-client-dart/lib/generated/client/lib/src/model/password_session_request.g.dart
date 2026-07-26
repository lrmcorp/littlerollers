// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'password_session_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PasswordSessionRequestChannelEnum
_$passwordSessionRequestChannelEnum_WEB =
    const PasswordSessionRequestChannelEnum._('WEB');
const PasswordSessionRequestChannelEnum
_$passwordSessionRequestChannelEnum_MOBILE =
    const PasswordSessionRequestChannelEnum._('MOBILE');

PasswordSessionRequestChannelEnum _$passwordSessionRequestChannelEnumValueOf(
  String name,
) {
  switch (name) {
    case 'WEB':
      return _$passwordSessionRequestChannelEnum_WEB;
    case 'MOBILE':
      return _$passwordSessionRequestChannelEnum_MOBILE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PasswordSessionRequestChannelEnum>
_$passwordSessionRequestChannelEnumValues =
    BuiltSet<PasswordSessionRequestChannelEnum>(
      const <PasswordSessionRequestChannelEnum>[
        _$passwordSessionRequestChannelEnum_WEB,
        _$passwordSessionRequestChannelEnum_MOBILE,
      ],
    );

Serializer<PasswordSessionRequestChannelEnum>
_$passwordSessionRequestChannelEnumSerializer =
    _$PasswordSessionRequestChannelEnumSerializer();

class _$PasswordSessionRequestChannelEnumSerializer
    implements PrimitiveSerializer<PasswordSessionRequestChannelEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'WEB': 'WEB',
    'MOBILE': 'MOBILE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'WEB': 'WEB',
    'MOBILE': 'MOBILE',
  };

  @override
  final Iterable<Type> types = const <Type>[PasswordSessionRequestChannelEnum];
  @override
  final String wireName = 'PasswordSessionRequestChannelEnum';

  @override
  Object serialize(
    Serializers serializers,
    PasswordSessionRequestChannelEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PasswordSessionRequestChannelEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PasswordSessionRequestChannelEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$PasswordSessionRequest extends PasswordSessionRequest {
  @override
  final String email;
  @override
  final String password;
  @override
  final PasswordSessionRequestChannelEnum channel;

  factory _$PasswordSessionRequest([
    void Function(PasswordSessionRequestBuilder)? updates,
  ]) => (PasswordSessionRequestBuilder()..update(updates))._build();

  _$PasswordSessionRequest._({
    required this.email,
    required this.password,
    required this.channel,
  }) : super._();
  @override
  PasswordSessionRequest rebuild(
    void Function(PasswordSessionRequestBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PasswordSessionRequestBuilder toBuilder() =>
      PasswordSessionRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PasswordSessionRequest &&
        email == other.email &&
        password == other.password &&
        channel == other.channel;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, password.hashCode);
    _$hash = $jc(_$hash, channel.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PasswordSessionRequest')
          ..add('email', email)
          ..add('password', password)
          ..add('channel', channel))
        .toString();
  }
}

class PasswordSessionRequestBuilder
    implements Builder<PasswordSessionRequest, PasswordSessionRequestBuilder> {
  _$PasswordSessionRequest? _$v;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  String? _password;
  String? get password => _$this._password;
  set password(String? password) => _$this._password = password;

  PasswordSessionRequestChannelEnum? _channel;
  PasswordSessionRequestChannelEnum? get channel => _$this._channel;
  set channel(PasswordSessionRequestChannelEnum? channel) =>
      _$this._channel = channel;

  PasswordSessionRequestBuilder() {
    PasswordSessionRequest._defaults(this);
  }

  PasswordSessionRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _email = $v.email;
      _password = $v.password;
      _channel = $v.channel;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PasswordSessionRequest other) {
    _$v = other as _$PasswordSessionRequest;
  }

  @override
  void update(void Function(PasswordSessionRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PasswordSessionRequest build() => _build();

  _$PasswordSessionRequest _build() {
    final _$result =
        _$v ??
        _$PasswordSessionRequest._(
          email: BuiltValueNullFieldError.checkNotNull(
            email,
            r'PasswordSessionRequest',
            'email',
          ),
          password: BuiltValueNullFieldError.checkNotNull(
            password,
            r'PasswordSessionRequest',
            'password',
          ),
          channel: BuiltValueNullFieldError.checkNotNull(
            channel,
            r'PasswordSessionRequest',
            'channel',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
