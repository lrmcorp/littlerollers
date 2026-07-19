// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'class_type.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ClassType extends ClassType {
  @override
  final String id;
  @override
  final String branchId;
  @override
  final String code;
  @override
  final String name;
  @override
  final bool active;
  @override
  final int version;

  factory _$ClassType([void Function(ClassTypeBuilder)? updates]) =>
      (ClassTypeBuilder()..update(updates))._build();

  _$ClassType._({
    required this.id,
    required this.branchId,
    required this.code,
    required this.name,
    required this.active,
    required this.version,
  }) : super._();
  @override
  ClassType rebuild(void Function(ClassTypeBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ClassTypeBuilder toBuilder() => ClassTypeBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ClassType &&
        id == other.id &&
        branchId == other.branchId &&
        code == other.code &&
        name == other.name &&
        active == other.active &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, active.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ClassType')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('code', code)
          ..add('name', name)
          ..add('active', active)
          ..add('version', version))
        .toString();
  }
}

class ClassTypeBuilder implements Builder<ClassType, ClassTypeBuilder> {
  _$ClassType? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  bool? _active;
  bool? get active => _$this._active;
  set active(bool? active) => _$this._active = active;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  ClassTypeBuilder() {
    ClassType._defaults(this);
  }

  ClassTypeBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchId = $v.branchId;
      _code = $v.code;
      _name = $v.name;
      _active = $v.active;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ClassType other) {
    _$v = other as _$ClassType;
  }

  @override
  void update(void Function(ClassTypeBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ClassType build() => _build();

  _$ClassType _build() {
    final _$result =
        _$v ??
        _$ClassType._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'ClassType', 'id'),
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'ClassType',
            'branchId',
          ),
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'ClassType',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'ClassType',
            'name',
          ),
          active: BuiltValueNullFieldError.checkNotNull(
            active,
            r'ClassType',
            'active',
          ),
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'ClassType',
            'version',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
