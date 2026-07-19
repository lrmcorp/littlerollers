// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'class_type_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ClassTypeCommand extends ClassTypeCommand {
  @override
  final String branchId;
  @override
  final String code;
  @override
  final String name;

  factory _$ClassTypeCommand([
    void Function(ClassTypeCommandBuilder)? updates,
  ]) => (ClassTypeCommandBuilder()..update(updates))._build();

  _$ClassTypeCommand._({
    required this.branchId,
    required this.code,
    required this.name,
  }) : super._();
  @override
  ClassTypeCommand rebuild(void Function(ClassTypeCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ClassTypeCommandBuilder toBuilder() =>
      ClassTypeCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ClassTypeCommand &&
        branchId == other.branchId &&
        code == other.code &&
        name == other.name;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ClassTypeCommand')
          ..add('branchId', branchId)
          ..add('code', code)
          ..add('name', name))
        .toString();
  }
}

class ClassTypeCommandBuilder
    implements Builder<ClassTypeCommand, ClassTypeCommandBuilder> {
  _$ClassTypeCommand? _$v;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  ClassTypeCommandBuilder() {
    ClassTypeCommand._defaults(this);
  }

  ClassTypeCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branchId = $v.branchId;
      _code = $v.code;
      _name = $v.name;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ClassTypeCommand other) {
    _$v = other as _$ClassTypeCommand;
  }

  @override
  void update(void Function(ClassTypeCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ClassTypeCommand build() => _build();

  _$ClassTypeCommand _build() {
    final _$result =
        _$v ??
        _$ClassTypeCommand._(
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'ClassTypeCommand',
            'branchId',
          ),
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'ClassTypeCommand',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'ClassTypeCommand',
            'name',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
