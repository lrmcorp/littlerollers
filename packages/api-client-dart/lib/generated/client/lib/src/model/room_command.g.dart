// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'room_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RoomCommand extends RoomCommand {
  @override
  final String code;
  @override
  final String name;
  @override
  final int? capacity;

  factory _$RoomCommand([void Function(RoomCommandBuilder)? updates]) =>
      (RoomCommandBuilder()..update(updates))._build();

  _$RoomCommand._({required this.code, required this.name, this.capacity})
    : super._();
  @override
  RoomCommand rebuild(void Function(RoomCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RoomCommandBuilder toBuilder() => RoomCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RoomCommand &&
        code == other.code &&
        name == other.name &&
        capacity == other.capacity;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, capacity.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RoomCommand')
          ..add('code', code)
          ..add('name', name)
          ..add('capacity', capacity))
        .toString();
  }
}

class RoomCommandBuilder implements Builder<RoomCommand, RoomCommandBuilder> {
  _$RoomCommand? _$v;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  int? _capacity;
  int? get capacity => _$this._capacity;
  set capacity(int? capacity) => _$this._capacity = capacity;

  RoomCommandBuilder() {
    RoomCommand._defaults(this);
  }

  RoomCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _code = $v.code;
      _name = $v.name;
      _capacity = $v.capacity;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RoomCommand other) {
    _$v = other as _$RoomCommand;
  }

  @override
  void update(void Function(RoomCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RoomCommand build() => _build();

  _$RoomCommand _build() {
    final _$result =
        _$v ??
        _$RoomCommand._(
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'RoomCommand',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'RoomCommand',
            'name',
          ),
          capacity: capacity,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
