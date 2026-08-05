// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'room_update_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RoomUpdateCommand extends RoomUpdateCommand {
  @override
  final String name;
  @override
  final int? capacity;
  @override
  final bool? active;

  factory _$RoomUpdateCommand([
    void Function(RoomUpdateCommandBuilder)? updates,
  ]) => (RoomUpdateCommandBuilder()..update(updates))._build();

  _$RoomUpdateCommand._({required this.name, this.capacity, this.active})
    : super._();
  @override
  RoomUpdateCommand rebuild(void Function(RoomUpdateCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RoomUpdateCommandBuilder toBuilder() =>
      RoomUpdateCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RoomUpdateCommand &&
        name == other.name &&
        capacity == other.capacity &&
        active == other.active;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, capacity.hashCode);
    _$hash = $jc(_$hash, active.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RoomUpdateCommand')
          ..add('name', name)
          ..add('capacity', capacity)
          ..add('active', active))
        .toString();
  }
}

class RoomUpdateCommandBuilder
    implements Builder<RoomUpdateCommand, RoomUpdateCommandBuilder> {
  _$RoomUpdateCommand? _$v;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  int? _capacity;
  int? get capacity => _$this._capacity;
  set capacity(int? capacity) => _$this._capacity = capacity;

  bool? _active;
  bool? get active => _$this._active;
  set active(bool? active) => _$this._active = active;

  RoomUpdateCommandBuilder() {
    RoomUpdateCommand._defaults(this);
  }

  RoomUpdateCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _capacity = $v.capacity;
      _active = $v.active;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RoomUpdateCommand other) {
    _$v = other as _$RoomUpdateCommand;
  }

  @override
  void update(void Function(RoomUpdateCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RoomUpdateCommand build() => _build();

  _$RoomUpdateCommand _build() {
    final _$result =
        _$v ??
        _$RoomUpdateCommand._(
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'RoomUpdateCommand',
            'name',
          ),
          capacity: capacity,
          active: active,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
