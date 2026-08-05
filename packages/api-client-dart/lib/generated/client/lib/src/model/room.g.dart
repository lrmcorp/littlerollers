// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'room.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$Room extends Room {
  @override
  final String id;
  @override
  final String studioId;
  @override
  final String code;
  @override
  final String name;
  @override
  final int? capacity;
  @override
  final bool active;

  factory _$Room([void Function(RoomBuilder)? updates]) =>
      (RoomBuilder()..update(updates))._build();

  _$Room._({
    required this.id,
    required this.studioId,
    required this.code,
    required this.name,
    this.capacity,
    required this.active,
  }) : super._();
  @override
  Room rebuild(void Function(RoomBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RoomBuilder toBuilder() => RoomBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Room &&
        id == other.id &&
        studioId == other.studioId &&
        code == other.code &&
        name == other.name &&
        capacity == other.capacity &&
        active == other.active;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, studioId.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, capacity.hashCode);
    _$hash = $jc(_$hash, active.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Room')
          ..add('id', id)
          ..add('studioId', studioId)
          ..add('code', code)
          ..add('name', name)
          ..add('capacity', capacity)
          ..add('active', active))
        .toString();
  }
}

class RoomBuilder implements Builder<Room, RoomBuilder> {
  _$Room? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _studioId;
  String? get studioId => _$this._studioId;
  set studioId(String? studioId) => _$this._studioId = studioId;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  int? _capacity;
  int? get capacity => _$this._capacity;
  set capacity(int? capacity) => _$this._capacity = capacity;

  bool? _active;
  bool? get active => _$this._active;
  set active(bool? active) => _$this._active = active;

  RoomBuilder() {
    Room._defaults(this);
  }

  RoomBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _studioId = $v.studioId;
      _code = $v.code;
      _name = $v.name;
      _capacity = $v.capacity;
      _active = $v.active;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Room other) {
    _$v = other as _$Room;
  }

  @override
  void update(void Function(RoomBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Room build() => _build();

  _$Room _build() {
    final _$result =
        _$v ??
        _$Room._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'Room', 'id'),
          studioId: BuiltValueNullFieldError.checkNotNull(
            studioId,
            r'Room',
            'studioId',
          ),
          code: BuiltValueNullFieldError.checkNotNull(code, r'Room', 'code'),
          name: BuiltValueNullFieldError.checkNotNull(name, r'Room', 'name'),
          capacity: capacity,
          active: BuiltValueNullFieldError.checkNotNull(
            active,
            r'Room',
            'active',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
