// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assignment_management_branch.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AssignmentManagementBranch extends AssignmentManagementBranch {
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;

  factory _$AssignmentManagementBranch([
    void Function(AssignmentManagementBranchBuilder)? updates,
  ]) => (AssignmentManagementBranchBuilder()..update(updates))._build();

  _$AssignmentManagementBranch._({
    required this.id,
    required this.code,
    required this.name,
  }) : super._();
  @override
  AssignmentManagementBranch rebuild(
    void Function(AssignmentManagementBranchBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  AssignmentManagementBranchBuilder toBuilder() =>
      AssignmentManagementBranchBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AssignmentManagementBranch &&
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
    return (newBuiltValueToStringHelper(r'AssignmentManagementBranch')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name))
        .toString();
  }
}

class AssignmentManagementBranchBuilder
    implements
        Builder<AssignmentManagementBranch, AssignmentManagementBranchBuilder> {
  _$AssignmentManagementBranch? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  AssignmentManagementBranchBuilder() {
    AssignmentManagementBranch._defaults(this);
  }

  AssignmentManagementBranchBuilder get _$this {
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
  void replace(AssignmentManagementBranch other) {
    _$v = other as _$AssignmentManagementBranch;
  }

  @override
  void update(void Function(AssignmentManagementBranchBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AssignmentManagementBranch build() => _build();

  _$AssignmentManagementBranch _build() {
    final _$result =
        _$v ??
        _$AssignmentManagementBranch._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'AssignmentManagementBranch',
            'id',
          ),
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'AssignmentManagementBranch',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'AssignmentManagementBranch',
            'name',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
