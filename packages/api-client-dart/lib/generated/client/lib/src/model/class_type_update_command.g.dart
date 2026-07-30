// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'class_type_update_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ClassTypeUpdateCommand extends ClassTypeUpdateCommand {
  @override
  final String name;
  @override
  final int expectedVersion;
  @override
  final String reason;

  factory _$ClassTypeUpdateCommand([
    void Function(ClassTypeUpdateCommandBuilder)? updates,
  ]) => (ClassTypeUpdateCommandBuilder()..update(updates))._build();

  _$ClassTypeUpdateCommand._({
    required this.name,
    required this.expectedVersion,
    required this.reason,
  }) : super._();
  @override
  ClassTypeUpdateCommand rebuild(
    void Function(ClassTypeUpdateCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  ClassTypeUpdateCommandBuilder toBuilder() =>
      ClassTypeUpdateCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ClassTypeUpdateCommand &&
        name == other.name &&
        expectedVersion == other.expectedVersion &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ClassTypeUpdateCommand')
          ..add('name', name)
          ..add('expectedVersion', expectedVersion)
          ..add('reason', reason))
        .toString();
  }
}

class ClassTypeUpdateCommandBuilder
    implements Builder<ClassTypeUpdateCommand, ClassTypeUpdateCommandBuilder> {
  _$ClassTypeUpdateCommand? _$v;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  ClassTypeUpdateCommandBuilder() {
    ClassTypeUpdateCommand._defaults(this);
  }

  ClassTypeUpdateCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _expectedVersion = $v.expectedVersion;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ClassTypeUpdateCommand other) {
    _$v = other as _$ClassTypeUpdateCommand;
  }

  @override
  void update(void Function(ClassTypeUpdateCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ClassTypeUpdateCommand build() => _build();

  _$ClassTypeUpdateCommand _build() {
    final _$result =
        _$v ??
        _$ClassTypeUpdateCommand._(
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'ClassTypeUpdateCommand',
            'name',
          ),
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'ClassTypeUpdateCommand',
            'expectedVersion',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'ClassTypeUpdateCommand',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
