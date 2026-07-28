// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_permission_override_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CreatePermissionOverrideCommandEffectEnum
_$createPermissionOverrideCommandEffectEnum_GRANT =
    const CreatePermissionOverrideCommandEffectEnum._('GRANT');
const CreatePermissionOverrideCommandEffectEnum
_$createPermissionOverrideCommandEffectEnum_DENY =
    const CreatePermissionOverrideCommandEffectEnum._('DENY');

CreatePermissionOverrideCommandEffectEnum
_$createPermissionOverrideCommandEffectEnumValueOf(String name) {
  switch (name) {
    case 'GRANT':
      return _$createPermissionOverrideCommandEffectEnum_GRANT;
    case 'DENY':
      return _$createPermissionOverrideCommandEffectEnum_DENY;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CreatePermissionOverrideCommandEffectEnum>
_$createPermissionOverrideCommandEffectEnumValues =
    BuiltSet<CreatePermissionOverrideCommandEffectEnum>(
      const <CreatePermissionOverrideCommandEffectEnum>[
        _$createPermissionOverrideCommandEffectEnum_GRANT,
        _$createPermissionOverrideCommandEffectEnum_DENY,
      ],
    );

Serializer<CreatePermissionOverrideCommandEffectEnum>
_$createPermissionOverrideCommandEffectEnumSerializer =
    _$CreatePermissionOverrideCommandEffectEnumSerializer();

class _$CreatePermissionOverrideCommandEffectEnumSerializer
    implements PrimitiveSerializer<CreatePermissionOverrideCommandEffectEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'GRANT': 'GRANT',
    'DENY': 'DENY',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'GRANT': 'GRANT',
    'DENY': 'DENY',
  };

  @override
  final Iterable<Type> types = const <Type>[
    CreatePermissionOverrideCommandEffectEnum,
  ];
  @override
  final String wireName = 'CreatePermissionOverrideCommandEffectEnum';

  @override
  Object serialize(
    Serializers serializers,
    CreatePermissionOverrideCommandEffectEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CreatePermissionOverrideCommandEffectEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CreatePermissionOverrideCommandEffectEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CreatePermissionOverrideCommand
    extends CreatePermissionOverrideCommand {
  @override
  final String? branchId;
  @override
  final String capabilityKey;
  @override
  final CreatePermissionOverrideCommandEffectEnum effect;
  @override
  final AccessReasonCode reasonCode;
  @override
  final String? note;

  factory _$CreatePermissionOverrideCommand([
    void Function(CreatePermissionOverrideCommandBuilder)? updates,
  ]) => (CreatePermissionOverrideCommandBuilder()..update(updates))._build();

  _$CreatePermissionOverrideCommand._({
    this.branchId,
    required this.capabilityKey,
    required this.effect,
    required this.reasonCode,
    this.note,
  }) : super._();
  @override
  CreatePermissionOverrideCommand rebuild(
    void Function(CreatePermissionOverrideCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CreatePermissionOverrideCommandBuilder toBuilder() =>
      CreatePermissionOverrideCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CreatePermissionOverrideCommand &&
        branchId == other.branchId &&
        capabilityKey == other.capabilityKey &&
        effect == other.effect &&
        reasonCode == other.reasonCode &&
        note == other.note;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, capabilityKey.hashCode);
    _$hash = $jc(_$hash, effect.hashCode);
    _$hash = $jc(_$hash, reasonCode.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CreatePermissionOverrideCommand')
          ..add('branchId', branchId)
          ..add('capabilityKey', capabilityKey)
          ..add('effect', effect)
          ..add('reasonCode', reasonCode)
          ..add('note', note))
        .toString();
  }
}

class CreatePermissionOverrideCommandBuilder
    implements
        Builder<
          CreatePermissionOverrideCommand,
          CreatePermissionOverrideCommandBuilder
        >,
        AccessReasonBuilder {
  _$CreatePermissionOverrideCommand? _$v;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(covariant String? branchId) => _$this._branchId = branchId;

  String? _capabilityKey;
  String? get capabilityKey => _$this._capabilityKey;
  set capabilityKey(covariant String? capabilityKey) =>
      _$this._capabilityKey = capabilityKey;

  CreatePermissionOverrideCommandEffectEnum? _effect;
  CreatePermissionOverrideCommandEffectEnum? get effect => _$this._effect;
  set effect(covariant CreatePermissionOverrideCommandEffectEnum? effect) =>
      _$this._effect = effect;

  AccessReasonCode? _reasonCode;
  AccessReasonCode? get reasonCode => _$this._reasonCode;
  set reasonCode(covariant AccessReasonCode? reasonCode) =>
      _$this._reasonCode = reasonCode;

  String? _note;
  String? get note => _$this._note;
  set note(covariant String? note) => _$this._note = note;

  CreatePermissionOverrideCommandBuilder() {
    CreatePermissionOverrideCommand._defaults(this);
  }

  CreatePermissionOverrideCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branchId = $v.branchId;
      _capabilityKey = $v.capabilityKey;
      _effect = $v.effect;
      _reasonCode = $v.reasonCode;
      _note = $v.note;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant CreatePermissionOverrideCommand other) {
    _$v = other as _$CreatePermissionOverrideCommand;
  }

  @override
  void update(void Function(CreatePermissionOverrideCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CreatePermissionOverrideCommand build() => _build();

  _$CreatePermissionOverrideCommand _build() {
    final _$result =
        _$v ??
        _$CreatePermissionOverrideCommand._(
          branchId: branchId,
          capabilityKey: BuiltValueNullFieldError.checkNotNull(
            capabilityKey,
            r'CreatePermissionOverrideCommand',
            'capabilityKey',
          ),
          effect: BuiltValueNullFieldError.checkNotNull(
            effect,
            r'CreatePermissionOverrideCommand',
            'effect',
          ),
          reasonCode: BuiltValueNullFieldError.checkNotNull(
            reasonCode,
            r'CreatePermissionOverrideCommand',
            'reasonCode',
          ),
          note: note,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
