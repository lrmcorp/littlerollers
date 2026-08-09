// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'package_branch_scope_branch.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PackageBranchScopeBranch extends PackageBranchScopeBranch {
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;

  factory _$PackageBranchScopeBranch([
    void Function(PackageBranchScopeBranchBuilder)? updates,
  ]) => (PackageBranchScopeBranchBuilder()..update(updates))._build();

  _$PackageBranchScopeBranch._({
    required this.id,
    required this.code,
    required this.name,
  }) : super._();
  @override
  PackageBranchScopeBranch rebuild(
    void Function(PackageBranchScopeBranchBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PackageBranchScopeBranchBuilder toBuilder() =>
      PackageBranchScopeBranchBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PackageBranchScopeBranch &&
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
    return (newBuiltValueToStringHelper(r'PackageBranchScopeBranch')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name))
        .toString();
  }
}

class PackageBranchScopeBranchBuilder
    implements
        Builder<PackageBranchScopeBranch, PackageBranchScopeBranchBuilder> {
  _$PackageBranchScopeBranch? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  PackageBranchScopeBranchBuilder() {
    PackageBranchScopeBranch._defaults(this);
  }

  PackageBranchScopeBranchBuilder get _$this {
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
  void replace(PackageBranchScopeBranch other) {
    _$v = other as _$PackageBranchScopeBranch;
  }

  @override
  void update(void Function(PackageBranchScopeBranchBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PackageBranchScopeBranch build() => _build();

  _$PackageBranchScopeBranch _build() {
    final _$result =
        _$v ??
        _$PackageBranchScopeBranch._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'PackageBranchScopeBranch',
            'id',
          ),
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'PackageBranchScopeBranch',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'PackageBranchScopeBranch',
            'name',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
