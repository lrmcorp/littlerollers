// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'check_in_token_status_branch.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CheckInTokenStatusBranch extends CheckInTokenStatusBranch {
  @override
  final String code;
  @override
  final String name;
  @override
  final String timezone;

  factory _$CheckInTokenStatusBranch([
    void Function(CheckInTokenStatusBranchBuilder)? updates,
  ]) => (CheckInTokenStatusBranchBuilder()..update(updates))._build();

  _$CheckInTokenStatusBranch._({
    required this.code,
    required this.name,
    required this.timezone,
  }) : super._();
  @override
  CheckInTokenStatusBranch rebuild(
    void Function(CheckInTokenStatusBranchBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CheckInTokenStatusBranchBuilder toBuilder() =>
      CheckInTokenStatusBranchBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CheckInTokenStatusBranch &&
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
    return (newBuiltValueToStringHelper(r'CheckInTokenStatusBranch')
          ..add('code', code)
          ..add('name', name)
          ..add('timezone', timezone))
        .toString();
  }
}

class CheckInTokenStatusBranchBuilder
    implements
        Builder<CheckInTokenStatusBranch, CheckInTokenStatusBranchBuilder> {
  _$CheckInTokenStatusBranch? _$v;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _timezone;
  String? get timezone => _$this._timezone;
  set timezone(String? timezone) => _$this._timezone = timezone;

  CheckInTokenStatusBranchBuilder() {
    CheckInTokenStatusBranch._defaults(this);
  }

  CheckInTokenStatusBranchBuilder get _$this {
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
  void replace(CheckInTokenStatusBranch other) {
    _$v = other as _$CheckInTokenStatusBranch;
  }

  @override
  void update(void Function(CheckInTokenStatusBranchBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CheckInTokenStatusBranch build() => _build();

  _$CheckInTokenStatusBranch _build() {
    final _$result =
        _$v ??
        _$CheckInTokenStatusBranch._(
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'CheckInTokenStatusBranch',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'CheckInTokenStatusBranch',
            'name',
          ),
          timezone: BuiltValueNullFieldError.checkNotNull(
            timezone,
            r'CheckInTokenStatusBranch',
            'timezone',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
