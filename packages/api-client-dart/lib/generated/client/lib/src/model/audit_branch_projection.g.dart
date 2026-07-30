// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'audit_branch_projection.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AuditBranchProjection extends AuditBranchProjection {
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;

  factory _$AuditBranchProjection([
    void Function(AuditBranchProjectionBuilder)? updates,
  ]) => (AuditBranchProjectionBuilder()..update(updates))._build();

  _$AuditBranchProjection._({
    required this.id,
    required this.code,
    required this.name,
  }) : super._();
  @override
  AuditBranchProjection rebuild(
    void Function(AuditBranchProjectionBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  AuditBranchProjectionBuilder toBuilder() =>
      AuditBranchProjectionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AuditBranchProjection &&
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
    return (newBuiltValueToStringHelper(r'AuditBranchProjection')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name))
        .toString();
  }
}

class AuditBranchProjectionBuilder
    implements Builder<AuditBranchProjection, AuditBranchProjectionBuilder> {
  _$AuditBranchProjection? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  AuditBranchProjectionBuilder() {
    AuditBranchProjection._defaults(this);
  }

  AuditBranchProjectionBuilder get _$this {
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
  void replace(AuditBranchProjection other) {
    _$v = other as _$AuditBranchProjection;
  }

  @override
  void update(void Function(AuditBranchProjectionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AuditBranchProjection build() => _build();

  _$AuditBranchProjection _build() {
    final _$result =
        _$v ??
        _$AuditBranchProjection._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'AuditBranchProjection',
            'id',
          ),
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'AuditBranchProjection',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'AuditBranchProjection',
            'name',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
