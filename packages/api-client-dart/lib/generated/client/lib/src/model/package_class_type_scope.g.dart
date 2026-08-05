// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'package_class_type_scope.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PackageClassTypeScope extends PackageClassTypeScope {
  @override
  final String id;
  @override
  final String classTypeId;
  @override
  final bool active;
  @override
  final PackageBranchScopeBranch? classType;

  factory _$PackageClassTypeScope([
    void Function(PackageClassTypeScopeBuilder)? updates,
  ]) => (PackageClassTypeScopeBuilder()..update(updates))._build();

  _$PackageClassTypeScope._({
    required this.id,
    required this.classTypeId,
    required this.active,
    this.classType,
  }) : super._();
  @override
  PackageClassTypeScope rebuild(
    void Function(PackageClassTypeScopeBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PackageClassTypeScopeBuilder toBuilder() =>
      PackageClassTypeScopeBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PackageClassTypeScope &&
        id == other.id &&
        classTypeId == other.classTypeId &&
        active == other.active &&
        classType == other.classType;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, classTypeId.hashCode);
    _$hash = $jc(_$hash, active.hashCode);
    _$hash = $jc(_$hash, classType.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PackageClassTypeScope')
          ..add('id', id)
          ..add('classTypeId', classTypeId)
          ..add('active', active)
          ..add('classType', classType))
        .toString();
  }
}

class PackageClassTypeScopeBuilder
    implements Builder<PackageClassTypeScope, PackageClassTypeScopeBuilder> {
  _$PackageClassTypeScope? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _classTypeId;
  String? get classTypeId => _$this._classTypeId;
  set classTypeId(String? classTypeId) => _$this._classTypeId = classTypeId;

  bool? _active;
  bool? get active => _$this._active;
  set active(bool? active) => _$this._active = active;

  PackageBranchScopeBranchBuilder? _classType;
  PackageBranchScopeBranchBuilder get classType =>
      _$this._classType ??= PackageBranchScopeBranchBuilder();
  set classType(PackageBranchScopeBranchBuilder? classType) =>
      _$this._classType = classType;

  PackageClassTypeScopeBuilder() {
    PackageClassTypeScope._defaults(this);
  }

  PackageClassTypeScopeBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _classTypeId = $v.classTypeId;
      _active = $v.active;
      _classType = $v.classType?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PackageClassTypeScope other) {
    _$v = other as _$PackageClassTypeScope;
  }

  @override
  void update(void Function(PackageClassTypeScopeBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PackageClassTypeScope build() => _build();

  _$PackageClassTypeScope _build() {
    _$PackageClassTypeScope _$result;
    try {
      _$result =
          _$v ??
          _$PackageClassTypeScope._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'PackageClassTypeScope',
              'id',
            ),
            classTypeId: BuiltValueNullFieldError.checkNotNull(
              classTypeId,
              r'PackageClassTypeScope',
              'classTypeId',
            ),
            active: BuiltValueNullFieldError.checkNotNull(
              active,
              r'PackageClassTypeScope',
              'active',
            ),
            classType: _classType?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'classType';
        _classType?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PackageClassTypeScope',
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
