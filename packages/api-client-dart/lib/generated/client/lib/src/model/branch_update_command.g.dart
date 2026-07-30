// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'branch_update_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BranchUpdateCommand extends BranchUpdateCommand {
  @override
  final String name;
  @override
  final String timezone;
  @override
  final String? supportWhatsappE164;
  @override
  final int expectedVersion;
  @override
  final String reason;

  factory _$BranchUpdateCommand([
    void Function(BranchUpdateCommandBuilder)? updates,
  ]) => (BranchUpdateCommandBuilder()..update(updates))._build();

  _$BranchUpdateCommand._({
    required this.name,
    required this.timezone,
    this.supportWhatsappE164,
    required this.expectedVersion,
    required this.reason,
  }) : super._();
  @override
  BranchUpdateCommand rebuild(
    void Function(BranchUpdateCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  BranchUpdateCommandBuilder toBuilder() =>
      BranchUpdateCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BranchUpdateCommand &&
        name == other.name &&
        timezone == other.timezone &&
        supportWhatsappE164 == other.supportWhatsappE164 &&
        expectedVersion == other.expectedVersion &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, timezone.hashCode);
    _$hash = $jc(_$hash, supportWhatsappE164.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'BranchUpdateCommand')
          ..add('name', name)
          ..add('timezone', timezone)
          ..add('supportWhatsappE164', supportWhatsappE164)
          ..add('expectedVersion', expectedVersion)
          ..add('reason', reason))
        .toString();
  }
}

class BranchUpdateCommandBuilder
    implements Builder<BranchUpdateCommand, BranchUpdateCommandBuilder> {
  _$BranchUpdateCommand? _$v;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _timezone;
  String? get timezone => _$this._timezone;
  set timezone(String? timezone) => _$this._timezone = timezone;

  String? _supportWhatsappE164;
  String? get supportWhatsappE164 => _$this._supportWhatsappE164;
  set supportWhatsappE164(String? supportWhatsappE164) =>
      _$this._supportWhatsappE164 = supportWhatsappE164;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  BranchUpdateCommandBuilder() {
    BranchUpdateCommand._defaults(this);
  }

  BranchUpdateCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _timezone = $v.timezone;
      _supportWhatsappE164 = $v.supportWhatsappE164;
      _expectedVersion = $v.expectedVersion;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BranchUpdateCommand other) {
    _$v = other as _$BranchUpdateCommand;
  }

  @override
  void update(void Function(BranchUpdateCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BranchUpdateCommand build() => _build();

  _$BranchUpdateCommand _build() {
    final _$result =
        _$v ??
        _$BranchUpdateCommand._(
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'BranchUpdateCommand',
            'name',
          ),
          timezone: BuiltValueNullFieldError.checkNotNull(
            timezone,
            r'BranchUpdateCommand',
            'timezone',
          ),
          supportWhatsappE164: supportWhatsappE164,
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'BranchUpdateCommand',
            'expectedVersion',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'BranchUpdateCommand',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
