// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_role_summary_branch.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$UserRoleSummaryBranch extends UserRoleSummaryBranch {
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;

  factory _$UserRoleSummaryBranch([
    void Function(UserRoleSummaryBranchBuilder)? updates,
  ]) => (UserRoleSummaryBranchBuilder()..update(updates))._build();

  _$UserRoleSummaryBranch._({
    required this.id,
    required this.code,
    required this.name,
  }) : super._();
  @override
  UserRoleSummaryBranch rebuild(
    void Function(UserRoleSummaryBranchBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  UserRoleSummaryBranchBuilder toBuilder() =>
      UserRoleSummaryBranchBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UserRoleSummaryBranch &&
        id == other.id &&
        code == other.code &&
        name == other.name;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UserRoleSummaryBranch')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name))
        .toString();
  }
}

class UserRoleSummaryBranchBuilder
    implements Builder<UserRoleSummaryBranch, UserRoleSummaryBranchBuilder> {
  _$UserRoleSummaryBranch? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  UserRoleSummaryBranchBuilder() {
    UserRoleSummaryBranch._defaults(this);
  }

  UserRoleSummaryBranchBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _code = $v.code;
      _name = $v.name;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UserRoleSummaryBranch other) {
    _$v = other as _$UserRoleSummaryBranch;
  }

  @override
  void update(void Function(UserRoleSummaryBranchBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UserRoleSummaryBranch build() => _build();

  _$UserRoleSummaryBranch _build() {
    final _$result =
        _$v ??
        _$UserRoleSummaryBranch._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'UserRoleSummaryBranch',
            'id',
          ),
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'UserRoleSummaryBranch',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'UserRoleSummaryBranch',
            'name',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
