// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_class_type_ref.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PublicClassTypeRef extends PublicClassTypeRef {
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;

  factory _$PublicClassTypeRef([
    void Function(PublicClassTypeRefBuilder)? updates,
  ]) => (PublicClassTypeRefBuilder()..update(updates))._build();

  _$PublicClassTypeRef._({
    required this.id,
    required this.code,
    required this.name,
  }) : super._();
  @override
  PublicClassTypeRef rebuild(
    void Function(PublicClassTypeRefBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PublicClassTypeRefBuilder toBuilder() =>
      PublicClassTypeRefBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PublicClassTypeRef &&
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
    return (newBuiltValueToStringHelper(r'PublicClassTypeRef')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name))
        .toString();
  }
}

class PublicClassTypeRefBuilder
    implements Builder<PublicClassTypeRef, PublicClassTypeRefBuilder> {
  _$PublicClassTypeRef? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  PublicClassTypeRefBuilder() {
    PublicClassTypeRef._defaults(this);
  }

  PublicClassTypeRefBuilder get _$this {
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
  void replace(PublicClassTypeRef other) {
    _$v = other as _$PublicClassTypeRef;
  }

  @override
  void update(void Function(PublicClassTypeRefBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PublicClassTypeRef build() => _build();

  _$PublicClassTypeRef _build() {
    final _$result =
        _$v ??
        _$PublicClassTypeRef._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'PublicClassTypeRef',
            'id',
          ),
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'PublicClassTypeRef',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'PublicClassTypeRef',
            'name',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
