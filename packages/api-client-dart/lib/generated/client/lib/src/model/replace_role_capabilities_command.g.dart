// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'replace_role_capabilities_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ReplaceRoleCapabilitiesCommand extends ReplaceRoleCapabilitiesCommand {
  @override
  final BuiltSet<String> capabilityKeys;
  @override
  final int expectedVersion;
  @override
  final AccessReasonCode reasonCode;
  @override
  final String? note;

  factory _$ReplaceRoleCapabilitiesCommand([
    void Function(ReplaceRoleCapabilitiesCommandBuilder)? updates,
  ]) => (ReplaceRoleCapabilitiesCommandBuilder()..update(updates))._build();

  _$ReplaceRoleCapabilitiesCommand._({
    required this.capabilityKeys,
    required this.expectedVersion,
    required this.reasonCode,
    this.note,
  }) : super._();
  @override
  ReplaceRoleCapabilitiesCommand rebuild(
    void Function(ReplaceRoleCapabilitiesCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  ReplaceRoleCapabilitiesCommandBuilder toBuilder() =>
      ReplaceRoleCapabilitiesCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ReplaceRoleCapabilitiesCommand &&
        capabilityKeys == other.capabilityKeys &&
        expectedVersion == other.expectedVersion &&
        reasonCode == other.reasonCode &&
        note == other.note;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, capabilityKeys.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, reasonCode.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ReplaceRoleCapabilitiesCommand')
          ..add('capabilityKeys', capabilityKeys)
          ..add('expectedVersion', expectedVersion)
          ..add('reasonCode', reasonCode)
          ..add('note', note))
        .toString();
  }
}

class ReplaceRoleCapabilitiesCommandBuilder
    implements
        Builder<
          ReplaceRoleCapabilitiesCommand,
          ReplaceRoleCapabilitiesCommandBuilder
        >,
        AccessReasonBuilder {
  _$ReplaceRoleCapabilitiesCommand? _$v;

  SetBuilder<String>? _capabilityKeys;
  SetBuilder<String> get capabilityKeys =>
      _$this._capabilityKeys ??= SetBuilder<String>();
  set capabilityKeys(covariant SetBuilder<String>? capabilityKeys) =>
      _$this._capabilityKeys = capabilityKeys;

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

  ReplaceRoleCapabilitiesCommandBuilder() {
    ReplaceRoleCapabilitiesCommand._defaults(this);
  }

  ReplaceRoleCapabilitiesCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _capabilityKeys = $v.capabilityKeys.toBuilder();
      _expectedVersion = $v.expectedVersion;
      _reasonCode = $v.reasonCode;
      _note = $v.note;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant ReplaceRoleCapabilitiesCommand other) {
    _$v = other as _$ReplaceRoleCapabilitiesCommand;
  }

  @override
  void update(void Function(ReplaceRoleCapabilitiesCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ReplaceRoleCapabilitiesCommand build() => _build();

  _$ReplaceRoleCapabilitiesCommand _build() {
    _$ReplaceRoleCapabilitiesCommand _$result;
    try {
      _$result =
          _$v ??
          _$ReplaceRoleCapabilitiesCommand._(
            capabilityKeys: capabilityKeys.build(),
            expectedVersion: BuiltValueNullFieldError.checkNotNull(
              expectedVersion,
              r'ReplaceRoleCapabilitiesCommand',
              'expectedVersion',
            ),
            reasonCode: BuiltValueNullFieldError.checkNotNull(
              reasonCode,
              r'ReplaceRoleCapabilitiesCommand',
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
          r'ReplaceRoleCapabilitiesCommand',
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
