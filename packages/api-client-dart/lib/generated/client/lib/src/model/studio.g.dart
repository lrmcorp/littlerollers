// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'studio.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$Studio extends Studio {
  @override
  final String id;
  @override
  final String branchId;
  @override
  final String code;
  @override
  final String name;
  @override
  final String? equipmentText;
  @override
  final String? contactPhoneE164;
  @override
  final bool active;
  @override
  final BuiltList<Room>? rooms;

  factory _$Studio([void Function(StudioBuilder)? updates]) =>
      (StudioBuilder()..update(updates))._build();

  _$Studio._({
    required this.id,
    required this.branchId,
    required this.code,
    required this.name,
    this.equipmentText,
    this.contactPhoneE164,
    required this.active,
    this.rooms,
  }) : super._();
  @override
  Studio rebuild(void Function(StudioBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  StudioBuilder toBuilder() => StudioBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Studio &&
        id == other.id &&
        branchId == other.branchId &&
        code == other.code &&
        name == other.name &&
        equipmentText == other.equipmentText &&
        contactPhoneE164 == other.contactPhoneE164 &&
        active == other.active &&
        rooms == other.rooms;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, equipmentText.hashCode);
    _$hash = $jc(_$hash, contactPhoneE164.hashCode);
    _$hash = $jc(_$hash, active.hashCode);
    _$hash = $jc(_$hash, rooms.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Studio')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('code', code)
          ..add('name', name)
          ..add('equipmentText', equipmentText)
          ..add('contactPhoneE164', contactPhoneE164)
          ..add('active', active)
          ..add('rooms', rooms))
        .toString();
  }
}

class StudioBuilder implements Builder<Studio, StudioBuilder> {
  _$Studio? _$v;

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

  String? _equipmentText;
  String? get equipmentText => _$this._equipmentText;
  set equipmentText(String? equipmentText) =>
      _$this._equipmentText = equipmentText;

  String? _contactPhoneE164;
  String? get contactPhoneE164 => _$this._contactPhoneE164;
  set contactPhoneE164(String? contactPhoneE164) =>
      _$this._contactPhoneE164 = contactPhoneE164;

  bool? _active;
  bool? get active => _$this._active;
  set active(bool? active) => _$this._active = active;

  ListBuilder<Room>? _rooms;
  ListBuilder<Room> get rooms => _$this._rooms ??= ListBuilder<Room>();
  set rooms(ListBuilder<Room>? rooms) => _$this._rooms = rooms;

  StudioBuilder() {
    Studio._defaults(this);
  }

  StudioBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchId = $v.branchId;
      _code = $v.code;
      _name = $v.name;
      _equipmentText = $v.equipmentText;
      _contactPhoneE164 = $v.contactPhoneE164;
      _active = $v.active;
      _rooms = $v.rooms?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Studio other) {
    _$v = other as _$Studio;
  }

  @override
  void update(void Function(StudioBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Studio build() => _build();

  _$Studio _build() {
    _$Studio _$result;
    try {
      _$result =
          _$v ??
          _$Studio._(
            id: BuiltValueNullFieldError.checkNotNull(id, r'Studio', 'id'),
            branchId: BuiltValueNullFieldError.checkNotNull(
              branchId,
              r'Studio',
              'branchId',
            ),
            code: BuiltValueNullFieldError.checkNotNull(
              code,
              r'Studio',
              'code',
            ),
            name: BuiltValueNullFieldError.checkNotNull(
              name,
              r'Studio',
              'name',
            ),
            equipmentText: equipmentText,
            contactPhoneE164: contactPhoneE164,
            active: BuiltValueNullFieldError.checkNotNull(
              active,
              r'Studio',
              'active',
            ),
            rooms: _rooms?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'rooms';
        _rooms?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'Studio',
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
