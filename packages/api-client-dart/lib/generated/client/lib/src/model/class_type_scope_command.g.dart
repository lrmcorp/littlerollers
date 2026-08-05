// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'class_type_scope_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ClassTypeScopeCommand extends ClassTypeScopeCommand {
  @override
  final BuiltSet<String> branchIds;
  @override
  final int expectedVersion;
  @override
  final String reason;

  factory _$ClassTypeScopeCommand([
    void Function(ClassTypeScopeCommandBuilder)? updates,
  ]) => (ClassTypeScopeCommandBuilder()..update(updates))._build();

  _$ClassTypeScopeCommand._({
    required this.branchIds,
    required this.expectedVersion,
    required this.reason,
  }) : super._();
  @override
  ClassTypeScopeCommand rebuild(
    void Function(ClassTypeScopeCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  ClassTypeScopeCommandBuilder toBuilder() =>
      ClassTypeScopeCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ClassTypeScopeCommand &&
        branchIds == other.branchIds &&
        expectedVersion == other.expectedVersion &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branchIds.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ClassTypeScopeCommand')
          ..add('branchIds', branchIds)
          ..add('expectedVersion', expectedVersion)
          ..add('reason', reason))
        .toString();
  }
}

class ClassTypeScopeCommandBuilder
    implements Builder<ClassTypeScopeCommand, ClassTypeScopeCommandBuilder> {
  _$ClassTypeScopeCommand? _$v;

  SetBuilder<String>? _branchIds;
  SetBuilder<String> get branchIds =>
      _$this._branchIds ??= SetBuilder<String>();
  set branchIds(SetBuilder<String>? branchIds) => _$this._branchIds = branchIds;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  ClassTypeScopeCommandBuilder() {
    ClassTypeScopeCommand._defaults(this);
  }

  ClassTypeScopeCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branchIds = $v.branchIds.toBuilder();
      _expectedVersion = $v.expectedVersion;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ClassTypeScopeCommand other) {
    _$v = other as _$ClassTypeScopeCommand;
  }

  @override
  void update(void Function(ClassTypeScopeCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ClassTypeScopeCommand build() => _build();

  _$ClassTypeScopeCommand _build() {
    _$ClassTypeScopeCommand _$result;
    try {
      _$result =
          _$v ??
          _$ClassTypeScopeCommand._(
            branchIds: branchIds.build(),
            expectedVersion: BuiltValueNullFieldError.checkNotNull(
              expectedVersion,
              r'ClassTypeScopeCommand',
              'expectedVersion',
            ),
            reason: BuiltValueNullFieldError.checkNotNull(
              reason,
              r'ClassTypeScopeCommand',
              'reason',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'branchIds';
        branchIds.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'ClassTypeScopeCommand',
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
