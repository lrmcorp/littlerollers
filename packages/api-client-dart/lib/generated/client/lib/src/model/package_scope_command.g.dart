// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'package_scope_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PackageScopeCommand extends PackageScopeCommand {
  @override
  final BuiltSet<String> branchIds;
  @override
  final BuiltSet<String> classTypeIds;
  @override
  final int expectedVersion;
  @override
  final String reason;

  factory _$PackageScopeCommand([
    void Function(PackageScopeCommandBuilder)? updates,
  ]) => (PackageScopeCommandBuilder()..update(updates))._build();

  _$PackageScopeCommand._({
    required this.branchIds,
    required this.classTypeIds,
    required this.expectedVersion,
    required this.reason,
  }) : super._();
  @override
  PackageScopeCommand rebuild(
    void Function(PackageScopeCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PackageScopeCommandBuilder toBuilder() =>
      PackageScopeCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PackageScopeCommand &&
        branchIds == other.branchIds &&
        classTypeIds == other.classTypeIds &&
        expectedVersion == other.expectedVersion &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branchIds.hashCode);
    _$hash = $jc(_$hash, classTypeIds.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PackageScopeCommand')
          ..add('branchIds', branchIds)
          ..add('classTypeIds', classTypeIds)
          ..add('expectedVersion', expectedVersion)
          ..add('reason', reason))
        .toString();
  }
}

class PackageScopeCommandBuilder
    implements Builder<PackageScopeCommand, PackageScopeCommandBuilder> {
  _$PackageScopeCommand? _$v;

  SetBuilder<String>? _branchIds;
  SetBuilder<String> get branchIds =>
      _$this._branchIds ??= SetBuilder<String>();
  set branchIds(SetBuilder<String>? branchIds) => _$this._branchIds = branchIds;

  SetBuilder<String>? _classTypeIds;
  SetBuilder<String> get classTypeIds =>
      _$this._classTypeIds ??= SetBuilder<String>();
  set classTypeIds(SetBuilder<String>? classTypeIds) =>
      _$this._classTypeIds = classTypeIds;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  PackageScopeCommandBuilder() {
    PackageScopeCommand._defaults(this);
  }

  PackageScopeCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branchIds = $v.branchIds.toBuilder();
      _classTypeIds = $v.classTypeIds.toBuilder();
      _expectedVersion = $v.expectedVersion;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PackageScopeCommand other) {
    _$v = other as _$PackageScopeCommand;
  }

  @override
  void update(void Function(PackageScopeCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PackageScopeCommand build() => _build();

  _$PackageScopeCommand _build() {
    _$PackageScopeCommand _$result;
    try {
      _$result =
          _$v ??
          _$PackageScopeCommand._(
            branchIds: branchIds.build(),
            classTypeIds: classTypeIds.build(),
            expectedVersion: BuiltValueNullFieldError.checkNotNull(
              expectedVersion,
              r'PackageScopeCommand',
              'expectedVersion',
            ),
            reason: BuiltValueNullFieldError.checkNotNull(
              reason,
              r'PackageScopeCommand',
              'reason',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'branchIds';
        branchIds.build();
        _$failedField = 'classTypeIds';
        classTypeIds.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PackageScopeCommand',
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
