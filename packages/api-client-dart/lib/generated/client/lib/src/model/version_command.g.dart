// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'version_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$VersionCommand extends VersionCommand {
  @override
  final int expectedVersion;

  factory _$VersionCommand([void Function(VersionCommandBuilder)? updates]) =>
      (VersionCommandBuilder()..update(updates))._build();

  _$VersionCommand._({required this.expectedVersion}) : super._();
  @override
  VersionCommand rebuild(void Function(VersionCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  VersionCommandBuilder toBuilder() => VersionCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is VersionCommand && expectedVersion == other.expectedVersion;
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
      r'VersionCommand',
    )..add('expectedVersion', expectedVersion)).toString();
  }
}

class VersionCommandBuilder
    implements Builder<VersionCommand, VersionCommandBuilder> {
  _$VersionCommand? _$v;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  VersionCommandBuilder() {
    VersionCommand._defaults(this);
  }

  VersionCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _expectedVersion = $v.expectedVersion;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(VersionCommand other) {
    _$v = other as _$VersionCommand;
  }

  @override
  void update(void Function(VersionCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  VersionCommand build() => _build();

  _$VersionCommand _build() {
    final _$result =
        _$v ??
        _$VersionCommand._(
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'VersionCommand',
            'expectedVersion',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
