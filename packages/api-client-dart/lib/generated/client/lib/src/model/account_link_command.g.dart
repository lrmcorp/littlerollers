// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'account_link_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const AccountLinkCommandProviderEnum _$accountLinkCommandProviderEnum_GOOGLE =
    const AccountLinkCommandProviderEnum._('GOOGLE');
const AccountLinkCommandProviderEnum
_$accountLinkCommandProviderEnum_WHATSAPP_PHONE =
    const AccountLinkCommandProviderEnum._('WHATSAPP_PHONE');

AccountLinkCommandProviderEnum _$accountLinkCommandProviderEnumValueOf(
  String name,
) {
  switch (name) {
    case 'GOOGLE':
      return _$accountLinkCommandProviderEnum_GOOGLE;
    case 'WHATSAPP_PHONE':
      return _$accountLinkCommandProviderEnum_WHATSAPP_PHONE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<AccountLinkCommandProviderEnum>
_$accountLinkCommandProviderEnumValues =
    BuiltSet<AccountLinkCommandProviderEnum>(
      const <AccountLinkCommandProviderEnum>[
        _$accountLinkCommandProviderEnum_GOOGLE,
        _$accountLinkCommandProviderEnum_WHATSAPP_PHONE,
      ],
    );

Serializer<AccountLinkCommandProviderEnum>
_$accountLinkCommandProviderEnumSerializer =
    _$AccountLinkCommandProviderEnumSerializer();

class _$AccountLinkCommandProviderEnumSerializer
    implements PrimitiveSerializer<AccountLinkCommandProviderEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'GOOGLE': 'GOOGLE',
    'WHATSAPP_PHONE': 'WHATSAPP_PHONE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'GOOGLE': 'GOOGLE',
    'WHATSAPP_PHONE': 'WHATSAPP_PHONE',
  };

  @override
  final Iterable<Type> types = const <Type>[AccountLinkCommandProviderEnum];
  @override
  final String wireName = 'AccountLinkCommandProviderEnum';

  @override
  Object serialize(
    Serializers serializers,
    AccountLinkCommandProviderEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  AccountLinkCommandProviderEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => AccountLinkCommandProviderEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$AccountLinkCommand extends AccountLinkCommand {
  @override
  final AccountLinkCommandProviderEnum provider;
  @override
  final String verifiedProviderToken;
  @override
  final String? expectedUserId;

  factory _$AccountLinkCommand([
    void Function(AccountLinkCommandBuilder)? updates,
  ]) => (AccountLinkCommandBuilder()..update(updates))._build();

  _$AccountLinkCommand._({
    required this.provider,
    required this.verifiedProviderToken,
    this.expectedUserId,
  }) : super._();
  @override
  AccountLinkCommand rebuild(
    void Function(AccountLinkCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  AccountLinkCommandBuilder toBuilder() =>
      AccountLinkCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AccountLinkCommand &&
        provider == other.provider &&
        verifiedProviderToken == other.verifiedProviderToken &&
        expectedUserId == other.expectedUserId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, provider.hashCode);
    _$hash = $jc(_$hash, verifiedProviderToken.hashCode);
    _$hash = $jc(_$hash, expectedUserId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AccountLinkCommand')
          ..add('provider', provider)
          ..add('verifiedProviderToken', verifiedProviderToken)
          ..add('expectedUserId', expectedUserId))
        .toString();
  }
}

class AccountLinkCommandBuilder
    implements Builder<AccountLinkCommand, AccountLinkCommandBuilder> {
  _$AccountLinkCommand? _$v;

  AccountLinkCommandProviderEnum? _provider;
  AccountLinkCommandProviderEnum? get provider => _$this._provider;
  set provider(AccountLinkCommandProviderEnum? provider) =>
      _$this._provider = provider;

  String? _verifiedProviderToken;
  String? get verifiedProviderToken => _$this._verifiedProviderToken;
  set verifiedProviderToken(String? verifiedProviderToken) =>
      _$this._verifiedProviderToken = verifiedProviderToken;

  String? _expectedUserId;
  String? get expectedUserId => _$this._expectedUserId;
  set expectedUserId(String? expectedUserId) =>
      _$this._expectedUserId = expectedUserId;

  AccountLinkCommandBuilder() {
    AccountLinkCommand._defaults(this);
  }

  AccountLinkCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _provider = $v.provider;
      _verifiedProviderToken = $v.verifiedProviderToken;
      _expectedUserId = $v.expectedUserId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AccountLinkCommand other) {
    _$v = other as _$AccountLinkCommand;
  }

  @override
  void update(void Function(AccountLinkCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AccountLinkCommand build() => _build();

  _$AccountLinkCommand _build() {
    final _$result =
        _$v ??
        _$AccountLinkCommand._(
          provider: BuiltValueNullFieldError.checkNotNull(
            provider,
            r'AccountLinkCommand',
            'provider',
          ),
          verifiedProviderToken: BuiltValueNullFieldError.checkNotNull(
            verifiedProviderToken,
            r'AccountLinkCommand',
            'verifiedProviderToken',
          ),
          expectedUserId: expectedUserId,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
