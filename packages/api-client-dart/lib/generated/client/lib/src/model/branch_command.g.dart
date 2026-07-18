// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'branch_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BranchCommand extends BranchCommand {
  @override
  final String code;
  @override
  final String name;
  @override
  final String timezone;

  factory _$BranchCommand([void Function(BranchCommandBuilder)? updates]) =>
      (BranchCommandBuilder()..update(updates))._build();

  _$BranchCommand._({
    required this.code,
    required this.name,
    required this.timezone,
  }) : super._();
  @override
  BranchCommand rebuild(void Function(BranchCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  BranchCommandBuilder toBuilder() => BranchCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BranchCommand &&
        code == other.code &&
        name == other.name &&
        timezone == other.timezone;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, timezone.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'BranchCommand')
          ..add('code', code)
          ..add('name', name)
          ..add('timezone', timezone))
        .toString();
  }
}

class BranchCommandBuilder
    implements Builder<BranchCommand, BranchCommandBuilder> {
  _$BranchCommand? _$v;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _timezone;
  String? get timezone => _$this._timezone;
  set timezone(String? timezone) => _$this._timezone = timezone;

  BranchCommandBuilder() {
    BranchCommand._defaults(this);
  }

  BranchCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _code = $v.code;
      _name = $v.name;
      _timezone = $v.timezone;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BranchCommand other) {
    _$v = other as _$BranchCommand;
  }

  @override
  void update(void Function(BranchCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BranchCommand build() => _build();

  _$BranchCommand _build() {
    final _$result =
        _$v ??
        _$BranchCommand._(
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'BranchCommand',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'BranchCommand',
            'name',
          ),
          timezone: BuiltValueNullFieldError.checkNotNull(
            timezone,
            r'BranchCommand',
            'timezone',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
