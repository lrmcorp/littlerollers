// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recovery_request_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const RecoveryRequestCommandRequestedChannelEnum
_$recoveryRequestCommandRequestedChannelEnum_WHATSAPP =
    const RecoveryRequestCommandRequestedChannelEnum._('WHATSAPP');
const RecoveryRequestCommandRequestedChannelEnum
_$recoveryRequestCommandRequestedChannelEnum_GOOGLE =
    const RecoveryRequestCommandRequestedChannelEnum._('GOOGLE');
const RecoveryRequestCommandRequestedChannelEnum
_$recoveryRequestCommandRequestedChannelEnum_SUPPORT =
    const RecoveryRequestCommandRequestedChannelEnum._('SUPPORT');

RecoveryRequestCommandRequestedChannelEnum
_$recoveryRequestCommandRequestedChannelEnumValueOf(String name) {
  switch (name) {
    case 'WHATSAPP':
      return _$recoveryRequestCommandRequestedChannelEnum_WHATSAPP;
    case 'GOOGLE':
      return _$recoveryRequestCommandRequestedChannelEnum_GOOGLE;
    case 'SUPPORT':
      return _$recoveryRequestCommandRequestedChannelEnum_SUPPORT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RecoveryRequestCommandRequestedChannelEnum>
_$recoveryRequestCommandRequestedChannelEnumValues =
    BuiltSet<RecoveryRequestCommandRequestedChannelEnum>(
      const <RecoveryRequestCommandRequestedChannelEnum>[
        _$recoveryRequestCommandRequestedChannelEnum_WHATSAPP,
        _$recoveryRequestCommandRequestedChannelEnum_GOOGLE,
        _$recoveryRequestCommandRequestedChannelEnum_SUPPORT,
      ],
    );

Serializer<RecoveryRequestCommandRequestedChannelEnum>
_$recoveryRequestCommandRequestedChannelEnumSerializer =
    _$RecoveryRequestCommandRequestedChannelEnumSerializer();

class _$RecoveryRequestCommandRequestedChannelEnumSerializer
    implements PrimitiveSerializer<RecoveryRequestCommandRequestedChannelEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'WHATSAPP': 'WHATSAPP',
    'GOOGLE': 'GOOGLE',
    'SUPPORT': 'SUPPORT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'WHATSAPP': 'WHATSAPP',
    'GOOGLE': 'GOOGLE',
    'SUPPORT': 'SUPPORT',
  };

  @override
  final Iterable<Type> types = const <Type>[
    RecoveryRequestCommandRequestedChannelEnum,
  ];
  @override
  final String wireName = 'RecoveryRequestCommandRequestedChannelEnum';

  @override
  Object serialize(
    Serializers serializers,
    RecoveryRequestCommandRequestedChannelEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  RecoveryRequestCommandRequestedChannelEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => RecoveryRequestCommandRequestedChannelEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$RecoveryRequestCommand extends RecoveryRequestCommand {
  @override
  final String identifier;
  @override
  final RecoveryRequestCommandRequestedChannelEnum requestedChannel;

  factory _$RecoveryRequestCommand([
    void Function(RecoveryRequestCommandBuilder)? updates,
  ]) => (RecoveryRequestCommandBuilder()..update(updates))._build();

  _$RecoveryRequestCommand._({
    required this.identifier,
    required this.requestedChannel,
  }) : super._();
  @override
  RecoveryRequestCommand rebuild(
    void Function(RecoveryRequestCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  RecoveryRequestCommandBuilder toBuilder() =>
      RecoveryRequestCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RecoveryRequestCommand &&
        identifier == other.identifier &&
        requestedChannel == other.requestedChannel;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, identifier.hashCode);
    _$hash = $jc(_$hash, requestedChannel.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RecoveryRequestCommand')
          ..add('identifier', identifier)
          ..add('requestedChannel', requestedChannel))
        .toString();
  }
}

class RecoveryRequestCommandBuilder
    implements Builder<RecoveryRequestCommand, RecoveryRequestCommandBuilder> {
  _$RecoveryRequestCommand? _$v;

  String? _identifier;
  String? get identifier => _$this._identifier;
  set identifier(String? identifier) => _$this._identifier = identifier;

  RecoveryRequestCommandRequestedChannelEnum? _requestedChannel;
  RecoveryRequestCommandRequestedChannelEnum? get requestedChannel =>
      _$this._requestedChannel;
  set requestedChannel(
    RecoveryRequestCommandRequestedChannelEnum? requestedChannel,
  ) => _$this._requestedChannel = requestedChannel;

  RecoveryRequestCommandBuilder() {
    RecoveryRequestCommand._defaults(this);
  }

  RecoveryRequestCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _identifier = $v.identifier;
      _requestedChannel = $v.requestedChannel;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RecoveryRequestCommand other) {
    _$v = other as _$RecoveryRequestCommand;
  }

  @override
  void update(void Function(RecoveryRequestCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RecoveryRequestCommand build() => _build();

  _$RecoveryRequestCommand _build() {
    final _$result =
        _$v ??
        _$RecoveryRequestCommand._(
          identifier: BuiltValueNullFieldError.checkNotNull(
            identifier,
            r'RecoveryRequestCommand',
            'identifier',
          ),
          requestedChannel: BuiltValueNullFieldError.checkNotNull(
            requestedChannel,
            r'RecoveryRequestCommand',
            'requestedChannel',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
