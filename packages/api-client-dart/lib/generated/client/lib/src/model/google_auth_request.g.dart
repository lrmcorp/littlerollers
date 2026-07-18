// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'google_auth_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const GoogleAuthRequestChannelEnum _$googleAuthRequestChannelEnum_WEB =
    const GoogleAuthRequestChannelEnum._('WEB');
const GoogleAuthRequestChannelEnum _$googleAuthRequestChannelEnum_MOBILE =
    const GoogleAuthRequestChannelEnum._('MOBILE');

GoogleAuthRequestChannelEnum _$googleAuthRequestChannelEnumValueOf(
  String name,
) {
  switch (name) {
    case 'WEB':
      return _$googleAuthRequestChannelEnum_WEB;
    case 'MOBILE':
      return _$googleAuthRequestChannelEnum_MOBILE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<GoogleAuthRequestChannelEnum>
_$googleAuthRequestChannelEnumValues = BuiltSet<GoogleAuthRequestChannelEnum>(
  const <GoogleAuthRequestChannelEnum>[
    _$googleAuthRequestChannelEnum_WEB,
    _$googleAuthRequestChannelEnum_MOBILE,
  ],
);

Serializer<GoogleAuthRequestChannelEnum>
_$googleAuthRequestChannelEnumSerializer =
    _$GoogleAuthRequestChannelEnumSerializer();

class _$GoogleAuthRequestChannelEnumSerializer
    implements PrimitiveSerializer<GoogleAuthRequestChannelEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'WEB': 'WEB',
    'MOBILE': 'MOBILE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'WEB': 'WEB',
    'MOBILE': 'MOBILE',
  };

  @override
  final Iterable<Type> types = const <Type>[GoogleAuthRequestChannelEnum];
  @override
  final String wireName = 'GoogleAuthRequestChannelEnum';

  @override
  Object serialize(
    Serializers serializers,
    GoogleAuthRequestChannelEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  GoogleAuthRequestChannelEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => GoogleAuthRequestChannelEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$GoogleAuthRequest extends GoogleAuthRequest {
  @override
  final String idToken;
  @override
  final String nonce;
  @override
  final GoogleAuthRequestChannelEnum channel;

  factory _$GoogleAuthRequest([
    void Function(GoogleAuthRequestBuilder)? updates,
  ]) => (GoogleAuthRequestBuilder()..update(updates))._build();

  _$GoogleAuthRequest._({
    required this.idToken,
    required this.nonce,
    required this.channel,
  }) : super._();
  @override
  GoogleAuthRequest rebuild(void Function(GoogleAuthRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  GoogleAuthRequestBuilder toBuilder() =>
      GoogleAuthRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is GoogleAuthRequest &&
        idToken == other.idToken &&
        nonce == other.nonce &&
        channel == other.channel;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, idToken.hashCode);
    _$hash = $jc(_$hash, nonce.hashCode);
    _$hash = $jc(_$hash, channel.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'GoogleAuthRequest')
          ..add('idToken', idToken)
          ..add('nonce', nonce)
          ..add('channel', channel))
        .toString();
  }
}

class GoogleAuthRequestBuilder
    implements Builder<GoogleAuthRequest, GoogleAuthRequestBuilder> {
  _$GoogleAuthRequest? _$v;

  String? _idToken;
  String? get idToken => _$this._idToken;
  set idToken(String? idToken) => _$this._idToken = idToken;

  String? _nonce;
  String? get nonce => _$this._nonce;
  set nonce(String? nonce) => _$this._nonce = nonce;

  GoogleAuthRequestChannelEnum? _channel;
  GoogleAuthRequestChannelEnum? get channel => _$this._channel;
  set channel(GoogleAuthRequestChannelEnum? channel) =>
      _$this._channel = channel;

  GoogleAuthRequestBuilder() {
    GoogleAuthRequest._defaults(this);
  }

  GoogleAuthRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _idToken = $v.idToken;
      _nonce = $v.nonce;
      _channel = $v.channel;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(GoogleAuthRequest other) {
    _$v = other as _$GoogleAuthRequest;
  }

  @override
  void update(void Function(GoogleAuthRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  GoogleAuthRequest build() => _build();

  _$GoogleAuthRequest _build() {
    final _$result =
        _$v ??
        _$GoogleAuthRequest._(
          idToken: BuiltValueNullFieldError.checkNotNull(
            idToken,
            r'GoogleAuthRequest',
            'idToken',
          ),
          nonce: BuiltValueNullFieldError.checkNotNull(
            nonce,
            r'GoogleAuthRequest',
            'nonce',
          ),
          channel: BuiltValueNullFieldError.checkNotNull(
            channel,
            r'GoogleAuthRequest',
            'channel',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
