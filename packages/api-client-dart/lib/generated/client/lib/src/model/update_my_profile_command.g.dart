// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_my_profile_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$UpdateMyProfileCommand extends UpdateMyProfileCommand {
  @override
  final String displayName;
  @override
  final String? preferredBranchId;
  @override
  final int expectedVersion;

  factory _$UpdateMyProfileCommand([
    void Function(UpdateMyProfileCommandBuilder)? updates,
  ]) => (UpdateMyProfileCommandBuilder()..update(updates))._build();

  _$UpdateMyProfileCommand._({
    required this.displayName,
    this.preferredBranchId,
    required this.expectedVersion,
  }) : super._();
  @override
  UpdateMyProfileCommand rebuild(
    void Function(UpdateMyProfileCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  UpdateMyProfileCommandBuilder toBuilder() =>
      UpdateMyProfileCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UpdateMyProfileCommand &&
        displayName == other.displayName &&
        preferredBranchId == other.preferredBranchId &&
        expectedVersion == other.expectedVersion;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jc(_$hash, preferredBranchId.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UpdateMyProfileCommand')
          ..add('displayName', displayName)
          ..add('preferredBranchId', preferredBranchId)
          ..add('expectedVersion', expectedVersion))
        .toString();
  }
}

class UpdateMyProfileCommandBuilder
    implements Builder<UpdateMyProfileCommand, UpdateMyProfileCommandBuilder> {
  _$UpdateMyProfileCommand? _$v;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  String? _preferredBranchId;
  String? get preferredBranchId => _$this._preferredBranchId;
  set preferredBranchId(String? preferredBranchId) =>
      _$this._preferredBranchId = preferredBranchId;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  UpdateMyProfileCommandBuilder() {
    UpdateMyProfileCommand._defaults(this);
  }

  UpdateMyProfileCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _displayName = $v.displayName;
      _preferredBranchId = $v.preferredBranchId;
      _expectedVersion = $v.expectedVersion;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UpdateMyProfileCommand other) {
    _$v = other as _$UpdateMyProfileCommand;
  }

  @override
  void update(void Function(UpdateMyProfileCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UpdateMyProfileCommand build() => _build();

  _$UpdateMyProfileCommand _build() {
    final _$result =
        _$v ??
        _$UpdateMyProfileCommand._(
          displayName: BuiltValueNullFieldError.checkNotNull(
            displayName,
            r'UpdateMyProfileCommand',
            'displayName',
          ),
          preferredBranchId: preferredBranchId,
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'UpdateMyProfileCommand',
            'expectedVersion',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
