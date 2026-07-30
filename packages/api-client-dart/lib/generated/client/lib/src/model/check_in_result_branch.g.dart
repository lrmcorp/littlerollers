// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'check_in_result_branch.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CheckInResultBranch extends CheckInResultBranch {
  @override
  final String code;
  @override
  final String name;
  @override
  final String timezone;

  factory _$CheckInResultBranch([
    void Function(CheckInResultBranchBuilder)? updates,
  ]) => (CheckInResultBranchBuilder()..update(updates))._build();

  _$CheckInResultBranch._({
    required this.code,
    required this.name,
    required this.timezone,
  }) : super._();
  @override
  CheckInResultBranch rebuild(
    void Function(CheckInResultBranchBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CheckInResultBranchBuilder toBuilder() =>
      CheckInResultBranchBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CheckInResultBranch &&
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
    return (newBuiltValueToStringHelper(r'CheckInResultBranch')
          ..add('code', code)
          ..add('name', name)
          ..add('timezone', timezone))
        .toString();
  }
}

class CheckInResultBranchBuilder
    implements Builder<CheckInResultBranch, CheckInResultBranchBuilder> {
  _$CheckInResultBranch? _$v;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _timezone;
  String? get timezone => _$this._timezone;
  set timezone(String? timezone) => _$this._timezone = timezone;

  CheckInResultBranchBuilder() {
    CheckInResultBranch._defaults(this);
  }

  CheckInResultBranchBuilder get _$this {
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
  void replace(CheckInResultBranch other) {
    _$v = other as _$CheckInResultBranch;
  }

  @override
  void update(void Function(CheckInResultBranchBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CheckInResultBranch build() => _build();

  _$CheckInResultBranch _build() {
    final _$result =
        _$v ??
        _$CheckInResultBranch._(
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'CheckInResultBranch',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'CheckInResultBranch',
            'name',
          ),
          timezone: BuiltValueNullFieldError.checkNotNull(
            timezone,
            r'CheckInResultBranch',
            'timezone',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
