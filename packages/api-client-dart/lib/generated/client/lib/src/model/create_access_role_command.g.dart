// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_access_role_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CreateAccessRoleCommand extends CreateAccessRoleCommand {
  @override
  final String code;
  @override
  final String displayName;
  @override
  final AccessRoleScope scope;
  @override
  final String description;
  @override
  final BuiltSet<String> capabilityKeys;
  @override
  final AccessReasonCode reasonCode;
  @override
  final String? note;

  factory _$CreateAccessRoleCommand([
    void Function(CreateAccessRoleCommandBuilder)? updates,
  ]) => (CreateAccessRoleCommandBuilder()..update(updates))._build();

  _$CreateAccessRoleCommand._({
    required this.code,
    required this.displayName,
    required this.scope,
    required this.description,
    required this.capabilityKeys,
    required this.reasonCode,
    this.note,
  }) : super._();
  @override
  CreateAccessRoleCommand rebuild(
    void Function(CreateAccessRoleCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CreateAccessRoleCommandBuilder toBuilder() =>
      CreateAccessRoleCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CreateAccessRoleCommand &&
        code == other.code &&
        displayName == other.displayName &&
        scope == other.scope &&
        description == other.description &&
        capabilityKeys == other.capabilityKeys &&
        reasonCode == other.reasonCode &&
        note == other.note;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jc(_$hash, scope.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, capabilityKeys.hashCode);
    _$hash = $jc(_$hash, reasonCode.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CreateAccessRoleCommand')
          ..add('code', code)
          ..add('displayName', displayName)
          ..add('scope', scope)
          ..add('description', description)
          ..add('capabilityKeys', capabilityKeys)
          ..add('reasonCode', reasonCode)
          ..add('note', note))
        .toString();
  }
}

class CreateAccessRoleCommandBuilder
    implements
        Builder<CreateAccessRoleCommand, CreateAccessRoleCommandBuilder>,
        AccessReasonBuilder {
  _$CreateAccessRoleCommand? _$v;

  String? _code;
  String? get code => _$this._code;
  set code(covariant String? code) => _$this._code = code;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(covariant String? displayName) =>
      _$this._displayName = displayName;

  AccessRoleScope? _scope;
  AccessRoleScope? get scope => _$this._scope;
  set scope(covariant AccessRoleScope? scope) => _$this._scope = scope;

  String? _description;
  String? get description => _$this._description;
  set description(covariant String? description) =>
      _$this._description = description;

  SetBuilder<String>? _capabilityKeys;
  SetBuilder<String> get capabilityKeys =>
      _$this._capabilityKeys ??= SetBuilder<String>();
  set capabilityKeys(covariant SetBuilder<String>? capabilityKeys) =>
      _$this._capabilityKeys = capabilityKeys;

  AccessReasonCode? _reasonCode;
  AccessReasonCode? get reasonCode => _$this._reasonCode;
  set reasonCode(covariant AccessReasonCode? reasonCode) =>
      _$this._reasonCode = reasonCode;

  String? _note;
  String? get note => _$this._note;
  set note(covariant String? note) => _$this._note = note;

  CreateAccessRoleCommandBuilder() {
    CreateAccessRoleCommand._defaults(this);
  }

  CreateAccessRoleCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _code = $v.code;
      _displayName = $v.displayName;
      _scope = $v.scope;
      _description = $v.description;
      _capabilityKeys = $v.capabilityKeys.toBuilder();
      _reasonCode = $v.reasonCode;
      _note = $v.note;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant CreateAccessRoleCommand other) {
    _$v = other as _$CreateAccessRoleCommand;
  }

  @override
  void update(void Function(CreateAccessRoleCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CreateAccessRoleCommand build() => _build();

  _$CreateAccessRoleCommand _build() {
    _$CreateAccessRoleCommand _$result;
    try {
      _$result =
          _$v ??
          _$CreateAccessRoleCommand._(
            code: BuiltValueNullFieldError.checkNotNull(
              code,
              r'CreateAccessRoleCommand',
              'code',
            ),
            displayName: BuiltValueNullFieldError.checkNotNull(
              displayName,
              r'CreateAccessRoleCommand',
              'displayName',
            ),
            scope: BuiltValueNullFieldError.checkNotNull(
              scope,
              r'CreateAccessRoleCommand',
              'scope',
            ),
            description: BuiltValueNullFieldError.checkNotNull(
              description,
              r'CreateAccessRoleCommand',
              'description',
            ),
            capabilityKeys: capabilityKeys.build(),
            reasonCode: BuiltValueNullFieldError.checkNotNull(
              reasonCode,
              r'CreateAccessRoleCommand',
              'reasonCode',
            ),
            note: note,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'capabilityKeys';
        capabilityKeys.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'CreateAccessRoleCommand',
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
