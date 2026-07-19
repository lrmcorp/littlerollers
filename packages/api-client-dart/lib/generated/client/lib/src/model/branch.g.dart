// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'branch.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$Branch extends Branch {
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;
  @override
  final String timezone;
  @override
  final bool active;
  @override
  final int version;

  factory _$Branch([void Function(BranchBuilder)? updates]) =>
      (BranchBuilder()..update(updates))._build();

  _$Branch._({
    required this.id,
    required this.code,
    required this.name,
    required this.timezone,
    required this.active,
    required this.version,
  }) : super._();
  @override
  Branch rebuild(void Function(BranchBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  BranchBuilder toBuilder() => BranchBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Branch &&
        id == other.id &&
        code == other.code &&
        name == other.name &&
        timezone == other.timezone &&
        active == other.active &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, timezone.hashCode);
    _$hash = $jc(_$hash, active.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Branch')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name)
          ..add('timezone', timezone)
          ..add('active', active)
          ..add('version', version))
        .toString();
  }
}

class BranchBuilder implements Builder<Branch, BranchBuilder> {
  _$Branch? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _timezone;
  String? get timezone => _$this._timezone;
  set timezone(String? timezone) => _$this._timezone = timezone;

  bool? _active;
  bool? get active => _$this._active;
  set active(bool? active) => _$this._active = active;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  BranchBuilder() {
    Branch._defaults(this);
  }

  BranchBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _code = $v.code;
      _name = $v.name;
      _timezone = $v.timezone;
      _active = $v.active;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Branch other) {
    _$v = other as _$Branch;
  }

  @override
  void update(void Function(BranchBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Branch build() => _build();

  _$Branch _build() {
    final _$result =
        _$v ??
        _$Branch._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'Branch', 'id'),
          code: BuiltValueNullFieldError.checkNotNull(code, r'Branch', 'code'),
          name: BuiltValueNullFieldError.checkNotNull(name, r'Branch', 'name'),
          timezone: BuiltValueNullFieldError.checkNotNull(
            timezone,
            r'Branch',
            'timezone',
          ),
          active: BuiltValueNullFieldError.checkNotNull(
            active,
            r'Branch',
            'active',
          ),
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'Branch',
            'version',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
