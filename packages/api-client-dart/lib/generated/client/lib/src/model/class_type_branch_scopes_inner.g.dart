// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'class_type_branch_scopes_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ClassTypeBranchScopesInner extends ClassTypeBranchScopesInner {
  @override
  final String branchId;
  @override
  final bool active;
  @override
  final Branch? branch;

  factory _$ClassTypeBranchScopesInner([
    void Function(ClassTypeBranchScopesInnerBuilder)? updates,
  ]) => (ClassTypeBranchScopesInnerBuilder()..update(updates))._build();

  _$ClassTypeBranchScopesInner._({
    required this.branchId,
    required this.active,
    this.branch,
  }) : super._();
  @override
  ClassTypeBranchScopesInner rebuild(
    void Function(ClassTypeBranchScopesInnerBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  ClassTypeBranchScopesInnerBuilder toBuilder() =>
      ClassTypeBranchScopesInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ClassTypeBranchScopesInner &&
        branchId == other.branchId &&
        active == other.active &&
        branch == other.branch;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, active.hashCode);
    _$hash = $jc(_$hash, branch.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ClassTypeBranchScopesInner')
          ..add('branchId', branchId)
          ..add('active', active)
          ..add('branch', branch))
        .toString();
  }
}

class ClassTypeBranchScopesInnerBuilder
    implements
        Builder<ClassTypeBranchScopesInner, ClassTypeBranchScopesInnerBuilder> {
  _$ClassTypeBranchScopesInner? _$v;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  bool? _active;
  bool? get active => _$this._active;
  set active(bool? active) => _$this._active = active;

  Branch? _branch;
  Branch? get branch => _$this._branch;
  set branch(Branch? branch) => _$this._branch = branch;

  ClassTypeBranchScopesInnerBuilder() {
    ClassTypeBranchScopesInner._defaults(this);
  }

  ClassTypeBranchScopesInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branchId = $v.branchId;
      _active = $v.active;
      _branch = $v.branch;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ClassTypeBranchScopesInner other) {
    _$v = other as _$ClassTypeBranchScopesInner;
  }

  @override
  void update(void Function(ClassTypeBranchScopesInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ClassTypeBranchScopesInner build() => _build();

  _$ClassTypeBranchScopesInner _build() {
    final _$result =
        _$v ??
        _$ClassTypeBranchScopesInner._(
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'ClassTypeBranchScopesInner',
            'branchId',
          ),
          active: BuiltValueNullFieldError.checkNotNull(
            active,
            r'ClassTypeBranchScopesInner',
            'active',
          ),
          branch: branch,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
