// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'replace_user_access_roles_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ReplaceUserAccessRolesCommand extends ReplaceUserAccessRolesCommand {
  @override
  final BuiltSet<AccessRoleAssignmentInput> roles;
  @override
  final int expectedVersion;
  @override
  final AccessReasonCode reasonCode;
  @override
  final String? note;

  factory _$ReplaceUserAccessRolesCommand([
    void Function(ReplaceUserAccessRolesCommandBuilder)? updates,
  ]) => (ReplaceUserAccessRolesCommandBuilder()..update(updates))._build();

  _$ReplaceUserAccessRolesCommand._({
    required this.roles,
    required this.expectedVersion,
    required this.reasonCode,
    this.note,
  }) : super._();
  @override
  ReplaceUserAccessRolesCommand rebuild(
    void Function(ReplaceUserAccessRolesCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  ReplaceUserAccessRolesCommandBuilder toBuilder() =>
      ReplaceUserAccessRolesCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ReplaceUserAccessRolesCommand &&
        roles == other.roles &&
        expectedVersion == other.expectedVersion &&
        reasonCode == other.reasonCode &&
        note == other.note;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, roles.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, reasonCode.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ReplaceUserAccessRolesCommand')
          ..add('roles', roles)
          ..add('expectedVersion', expectedVersion)
          ..add('reasonCode', reasonCode)
          ..add('note', note))
        .toString();
  }
}

class ReplaceUserAccessRolesCommandBuilder
    implements
        Builder<
          ReplaceUserAccessRolesCommand,
          ReplaceUserAccessRolesCommandBuilder
        >,
        AccessReasonBuilder {
  _$ReplaceUserAccessRolesCommand? _$v;

  SetBuilder<AccessRoleAssignmentInput>? _roles;
  SetBuilder<AccessRoleAssignmentInput> get roles =>
      _$this._roles ??= SetBuilder<AccessRoleAssignmentInput>();
  set roles(covariant SetBuilder<AccessRoleAssignmentInput>? roles) =>
      _$this._roles = roles;

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

  ReplaceUserAccessRolesCommandBuilder() {
    ReplaceUserAccessRolesCommand._defaults(this);
  }

  ReplaceUserAccessRolesCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _roles = $v.roles.toBuilder();
      _expectedVersion = $v.expectedVersion;
      _reasonCode = $v.reasonCode;
      _note = $v.note;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant ReplaceUserAccessRolesCommand other) {
    _$v = other as _$ReplaceUserAccessRolesCommand;
  }

  @override
  void update(void Function(ReplaceUserAccessRolesCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ReplaceUserAccessRolesCommand build() => _build();

  _$ReplaceUserAccessRolesCommand _build() {
    _$ReplaceUserAccessRolesCommand _$result;
    try {
      _$result =
          _$v ??
          _$ReplaceUserAccessRolesCommand._(
            roles: roles.build(),
            expectedVersion: BuiltValueNullFieldError.checkNotNull(
              expectedVersion,
              r'ReplaceUserAccessRolesCommand',
              'expectedVersion',
            ),
            reasonCode: BuiltValueNullFieldError.checkNotNull(
              reasonCode,
              r'ReplaceUserAccessRolesCommand',
              'reasonCode',
            ),
            note: note,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'roles';
        roles.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'ReplaceUserAccessRolesCommand',
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
