// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'studio_update_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$StudioUpdateCommand extends StudioUpdateCommand {
  @override
  final String name;
  @override
  final String? equipmentText;
  @override
  final String? contactPhoneE164;
  @override
  final bool? active;

  factory _$StudioUpdateCommand([
    void Function(StudioUpdateCommandBuilder)? updates,
  ]) => (StudioUpdateCommandBuilder()..update(updates))._build();

  _$StudioUpdateCommand._({
    required this.name,
    this.equipmentText,
    this.contactPhoneE164,
    this.active,
  }) : super._();
  @override
  StudioUpdateCommand rebuild(
    void Function(StudioUpdateCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  StudioUpdateCommandBuilder toBuilder() =>
      StudioUpdateCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is StudioUpdateCommand &&
        name == other.name &&
        equipmentText == other.equipmentText &&
        contactPhoneE164 == other.contactPhoneE164 &&
        active == other.active;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, equipmentText.hashCode);
    _$hash = $jc(_$hash, contactPhoneE164.hashCode);
    _$hash = $jc(_$hash, active.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'StudioUpdateCommand')
          ..add('name', name)
          ..add('equipmentText', equipmentText)
          ..add('contactPhoneE164', contactPhoneE164)
          ..add('active', active))
        .toString();
  }
}

class StudioUpdateCommandBuilder
    implements Builder<StudioUpdateCommand, StudioUpdateCommandBuilder> {
  _$StudioUpdateCommand? _$v;

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

  bool? _active;
  bool? get active => _$this._active;
  set active(bool? active) => _$this._active = active;

  StudioUpdateCommandBuilder() {
    StudioUpdateCommand._defaults(this);
  }

  StudioUpdateCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _equipmentText = $v.equipmentText;
      _contactPhoneE164 = $v.contactPhoneE164;
      _active = $v.active;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(StudioUpdateCommand other) {
    _$v = other as _$StudioUpdateCommand;
  }

  @override
  void update(void Function(StudioUpdateCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  StudioUpdateCommand build() => _build();

  _$StudioUpdateCommand _build() {
    final _$result =
        _$v ??
        _$StudioUpdateCommand._(
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'StudioUpdateCommand',
            'name',
          ),
          equipmentText: equipmentText,
          contactPhoneE164: contactPhoneE164,
          active: active,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
