// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'studio_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$StudioCommand extends StudioCommand {
  @override
  final String code;
  @override
  final String name;
  @override
  final String? equipmentText;
  @override
  final String? contactPhoneE164;

  factory _$StudioCommand([void Function(StudioCommandBuilder)? updates]) =>
      (StudioCommandBuilder()..update(updates))._build();

  _$StudioCommand._({
    required this.code,
    required this.name,
    this.equipmentText,
    this.contactPhoneE164,
  }) : super._();
  @override
  StudioCommand rebuild(void Function(StudioCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  StudioCommandBuilder toBuilder() => StudioCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is StudioCommand &&
        code == other.code &&
        name == other.name &&
        equipmentText == other.equipmentText &&
        contactPhoneE164 == other.contactPhoneE164;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, equipmentText.hashCode);
    _$hash = $jc(_$hash, contactPhoneE164.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'StudioCommand')
          ..add('code', code)
          ..add('name', name)
          ..add('equipmentText', equipmentText)
          ..add('contactPhoneE164', contactPhoneE164))
        .toString();
  }
}

class StudioCommandBuilder
    implements Builder<StudioCommand, StudioCommandBuilder> {
  _$StudioCommand? _$v;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _equipmentText;
  String? get equipmentText => _$this._equipmentText;
  set equipmentText(String? equipmentText) =>
      _$this._equipmentText = equipmentText;

  String? _contactPhoneE164;
  String? get contactPhoneE164 => _$this._contactPhoneE164;
  set contactPhoneE164(String? contactPhoneE164) =>
      _$this._contactPhoneE164 = contactPhoneE164;

  StudioCommandBuilder() {
    StudioCommand._defaults(this);
  }

  StudioCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _code = $v.code;
      _name = $v.name;
      _equipmentText = $v.equipmentText;
      _contactPhoneE164 = $v.contactPhoneE164;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(StudioCommand other) {
    _$v = other as _$StudioCommand;
  }

  @override
  void update(void Function(StudioCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  StudioCommand build() => _build();

  _$StudioCommand _build() {
    final _$result =
        _$v ??
        _$StudioCommand._(
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'StudioCommand',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'StudioCommand',
            'name',
          ),
          equipmentText: equipmentText,
          contactPhoneE164: contactPhoneE164,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
