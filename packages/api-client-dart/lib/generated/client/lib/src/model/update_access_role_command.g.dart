// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_access_role_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$UpdateAccessRoleCommand extends UpdateAccessRoleCommand {
  @override
  final String displayName;
  @override
  final String description;
  @override
  final int expectedVersion;
  @override
  final AccessReasonCode reasonCode;
  @override
  final String? note;

  factory _$UpdateAccessRoleCommand([
    void Function(UpdateAccessRoleCommandBuilder)? updates,
  ]) => (UpdateAccessRoleCommandBuilder()..update(updates))._build();

  _$UpdateAccessRoleCommand._({
    required this.displayName,
    required this.description,
    required this.expectedVersion,
    required this.reasonCode,
    this.note,
  }) : super._();
  @override
  UpdateAccessRoleCommand rebuild(
    void Function(UpdateAccessRoleCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  UpdateAccessRoleCommandBuilder toBuilder() =>
      UpdateAccessRoleCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UpdateAccessRoleCommand &&
        displayName == other.displayName &&
        description == other.description &&
        expectedVersion == other.expectedVersion &&
        reasonCode == other.reasonCode &&
        note == other.note;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, reasonCode.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UpdateAccessRoleCommand')
          ..add('displayName', displayName)
          ..add('description', description)
          ..add('expectedVersion', expectedVersion)
          ..add('reasonCode', reasonCode)
          ..add('note', note))
        .toString();
  }
}

class UpdateAccessRoleCommandBuilder
    implements
        Builder<UpdateAccessRoleCommand, UpdateAccessRoleCommandBuilder>,
        AccessReasonBuilder {
  _$UpdateAccessRoleCommand? _$v;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(covariant String? displayName) =>
      _$this._displayName = displayName;

  String? _description;
  String? get description => _$this._description;
  set description(covariant String? description) =>
      _$this._description = description;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(covariant int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  AccessReasonCode? _reasonCode;
  AccessReasonCode? get reasonCode => _$this._reasonCode;
  set reasonCode(covariant AccessReasonCode? reasonCode) =>
      _$this._reasonCode = reasonCode;

  String? _note;
  String? get note => _$this._note;
  set note(covariant String? note) => _$this._note = note;

  UpdateAccessRoleCommandBuilder() {
    UpdateAccessRoleCommand._defaults(this);
  }

  UpdateAccessRoleCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _displayName = $v.displayName;
      _description = $v.description;
      _expectedVersion = $v.expectedVersion;
      _reasonCode = $v.reasonCode;
      _note = $v.note;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant UpdateAccessRoleCommand other) {
    _$v = other as _$UpdateAccessRoleCommand;
  }

  @override
  void update(void Function(UpdateAccessRoleCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UpdateAccessRoleCommand build() => _build();

  _$UpdateAccessRoleCommand _build() {
    final _$result =
        _$v ??
        _$UpdateAccessRoleCommand._(
          displayName: BuiltValueNullFieldError.checkNotNull(
            displayName,
            r'UpdateAccessRoleCommand',
            'displayName',
          ),
          description: BuiltValueNullFieldError.checkNotNull(
            description,
            r'UpdateAccessRoleCommand',
            'description',
          ),
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'UpdateAccessRoleCommand',
            'expectedVersion',
          ),
          reasonCode: BuiltValueNullFieldError.checkNotNull(
            reasonCode,
            r'UpdateAccessRoleCommand',
            'reasonCode',
          ),
          note: note,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
