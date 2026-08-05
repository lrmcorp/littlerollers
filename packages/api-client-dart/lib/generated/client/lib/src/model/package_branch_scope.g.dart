// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'package_branch_scope.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PackageBranchScope extends PackageBranchScope {
  @override
  final String id;
  @override
  final String branchId;
  @override
  final bool active;
  @override
  final PackageBranchScopeBranch? branch;

  factory _$PackageBranchScope([
    void Function(PackageBranchScopeBuilder)? updates,
  ]) => (PackageBranchScopeBuilder()..update(updates))._build();

  _$PackageBranchScope._({
    required this.id,
    required this.branchId,
    required this.active,
    this.branch,
  }) : super._();
  @override
  PackageBranchScope rebuild(
    void Function(PackageBranchScopeBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PackageBranchScopeBuilder toBuilder() =>
      PackageBranchScopeBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PackageBranchScope &&
        id == other.id &&
        branchId == other.branchId &&
        active == other.active &&
        branch == other.branch;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, active.hashCode);
    _$hash = $jc(_$hash, branch.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PackageBranchScope')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('active', active)
          ..add('branch', branch))
        .toString();
  }
}

class PackageBranchScopeBuilder
    implements Builder<PackageBranchScope, PackageBranchScopeBuilder> {
  _$PackageBranchScope? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  bool? _active;
  bool? get active => _$this._active;
  set active(bool? active) => _$this._active = active;

  PackageBranchScopeBranchBuilder? _branch;
  PackageBranchScopeBranchBuilder get branch =>
      _$this._branch ??= PackageBranchScopeBranchBuilder();
  set branch(PackageBranchScopeBranchBuilder? branch) =>
      _$this._branch = branch;

  PackageBranchScopeBuilder() {
    PackageBranchScope._defaults(this);
  }

  PackageBranchScopeBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchId = $v.branchId;
      _active = $v.active;
      _branch = $v.branch?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PackageBranchScope other) {
    _$v = other as _$PackageBranchScope;
  }

  @override
  void update(void Function(PackageBranchScopeBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PackageBranchScope build() => _build();

  _$PackageBranchScope _build() {
    _$PackageBranchScope _$result;
    try {
      _$result =
          _$v ??
          _$PackageBranchScope._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'PackageBranchScope',
              'id',
            ),
            branchId: BuiltValueNullFieldError.checkNotNull(
              branchId,
              r'PackageBranchScope',
              'branchId',
            ),
            active: BuiltValueNullFieldError.checkNotNull(
              active,
              r'PackageBranchScope',
              'active',
            ),
            branch: _branch?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'branch';
        _branch?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PackageBranchScope',
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
