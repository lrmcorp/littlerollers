// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'mfa_challenge_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const MfaChallengeCommandPurposeEnum _$mfaChallengeCommandPurposeEnum_SIGN_IN =
    const MfaChallengeCommandPurposeEnum._('SIGN_IN');
const MfaChallengeCommandPurposeEnum _$mfaChallengeCommandPurposeEnum_STEP_UP =
    const MfaChallengeCommandPurposeEnum._('STEP_UP');
const MfaChallengeCommandPurposeEnum
_$mfaChallengeCommandPurposeEnum_ENROLLMENT =
    const MfaChallengeCommandPurposeEnum._('ENROLLMENT');
const MfaChallengeCommandPurposeEnum _$mfaChallengeCommandPurposeEnum_RECOVERY =
    const MfaChallengeCommandPurposeEnum._('RECOVERY');

MfaChallengeCommandPurposeEnum _$mfaChallengeCommandPurposeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'SIGN_IN':
      return _$mfaChallengeCommandPurposeEnum_SIGN_IN;
    case 'STEP_UP':
      return _$mfaChallengeCommandPurposeEnum_STEP_UP;
    case 'ENROLLMENT':
      return _$mfaChallengeCommandPurposeEnum_ENROLLMENT;
    case 'RECOVERY':
      return _$mfaChallengeCommandPurposeEnum_RECOVERY;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<MfaChallengeCommandPurposeEnum>
_$mfaChallengeCommandPurposeEnumValues =
    BuiltSet<MfaChallengeCommandPurposeEnum>(
      const <MfaChallengeCommandPurposeEnum>[
        _$mfaChallengeCommandPurposeEnum_SIGN_IN,
        _$mfaChallengeCommandPurposeEnum_STEP_UP,
        _$mfaChallengeCommandPurposeEnum_ENROLLMENT,
        _$mfaChallengeCommandPurposeEnum_RECOVERY,
      ],
    );

Serializer<MfaChallengeCommandPurposeEnum>
_$mfaChallengeCommandPurposeEnumSerializer =
    _$MfaChallengeCommandPurposeEnumSerializer();

class _$MfaChallengeCommandPurposeEnumSerializer
    implements PrimitiveSerializer<MfaChallengeCommandPurposeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'SIGN_IN': 'SIGN_IN',
    'STEP_UP': 'STEP_UP',
    'ENROLLMENT': 'ENROLLMENT',
    'RECOVERY': 'RECOVERY',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'SIGN_IN': 'SIGN_IN',
    'STEP_UP': 'STEP_UP',
    'ENROLLMENT': 'ENROLLMENT',
    'RECOVERY': 'RECOVERY',
  };

  @override
  final Iterable<Type> types = const <Type>[MfaChallengeCommandPurposeEnum];
  @override
  final String wireName = 'MfaChallengeCommandPurposeEnum';

  @override
  Object serialize(
    Serializers serializers,
    MfaChallengeCommandPurposeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  MfaChallengeCommandPurposeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => MfaChallengeCommandPurposeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$MfaChallengeCommand extends MfaChallengeCommand {
  @override
  final MfaChallengeCommandPurposeEnum purpose;
  @override
  final String? method;

  factory _$MfaChallengeCommand([
    void Function(MfaChallengeCommandBuilder)? updates,
  ]) => (MfaChallengeCommandBuilder()..update(updates))._build();

  _$MfaChallengeCommand._({required this.purpose, this.method}) : super._();
  @override
  MfaChallengeCommand rebuild(
    void Function(MfaChallengeCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  MfaChallengeCommandBuilder toBuilder() =>
      MfaChallengeCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MfaChallengeCommand &&
        purpose == other.purpose &&
        method == other.method;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, purpose.hashCode);
    _$hash = $jc(_$hash, method.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'MfaChallengeCommand')
          ..add('purpose', purpose)
          ..add('method', method))
        .toString();
  }
}

class MfaChallengeCommandBuilder
    implements Builder<MfaChallengeCommand, MfaChallengeCommandBuilder> {
  _$MfaChallengeCommand? _$v;

  MfaChallengeCommandPurposeEnum? _purpose;
  MfaChallengeCommandPurposeEnum? get purpose => _$this._purpose;
  set purpose(MfaChallengeCommandPurposeEnum? purpose) =>
      _$this._purpose = purpose;

  String? _method;
  String? get method => _$this._method;
  set method(String? method) => _$this._method = method;

  MfaChallengeCommandBuilder() {
    MfaChallengeCommand._defaults(this);
  }

  MfaChallengeCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _purpose = $v.purpose;
      _method = $v.method;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MfaChallengeCommand other) {
    _$v = other as _$MfaChallengeCommand;
  }

  @override
  void update(void Function(MfaChallengeCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MfaChallengeCommand build() => _build();

  _$MfaChallengeCommand _build() {
    final _$result =
        _$v ??
        _$MfaChallengeCommand._(
          purpose: BuiltValueNullFieldError.checkNotNull(
            purpose,
            r'MfaChallengeCommand',
            'purpose',
          ),
          method: method,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
