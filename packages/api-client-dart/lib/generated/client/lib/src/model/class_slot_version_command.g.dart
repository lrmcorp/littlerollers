// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'class_slot_version_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ClassSlotVersionCommand extends ClassSlotVersionCommand {
  @override
  final int expectedVersion;

  factory _$ClassSlotVersionCommand([
    void Function(ClassSlotVersionCommandBuilder)? updates,
  ]) => (ClassSlotVersionCommandBuilder()..update(updates))._build();

  _$ClassSlotVersionCommand._({required this.expectedVersion}) : super._();
  @override
  ClassSlotVersionCommand rebuild(
    void Function(ClassSlotVersionCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  ClassSlotVersionCommandBuilder toBuilder() =>
      ClassSlotVersionCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ClassSlotVersionCommand &&
        expectedVersion == other.expectedVersion;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
      r'ClassSlotVersionCommand',
    )..add('expectedVersion', expectedVersion)).toString();
  }
}

class ClassSlotVersionCommandBuilder
    implements
        Builder<ClassSlotVersionCommand, ClassSlotVersionCommandBuilder> {
  _$ClassSlotVersionCommand? _$v;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  ClassSlotVersionCommandBuilder() {
    ClassSlotVersionCommand._defaults(this);
  }

  ClassSlotVersionCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _expectedVersion = $v.expectedVersion;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ClassSlotVersionCommand other) {
    _$v = other as _$ClassSlotVersionCommand;
  }

  @override
  void update(void Function(ClassSlotVersionCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ClassSlotVersionCommand build() => _build();

  _$ClassSlotVersionCommand _build() {
    final _$result =
        _$v ??
        _$ClassSlotVersionCommand._(
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'ClassSlotVersionCommand',
            'expectedVersion',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
