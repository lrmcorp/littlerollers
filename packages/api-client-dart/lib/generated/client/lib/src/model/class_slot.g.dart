// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'class_slot.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const ClassSlotStatusEnum _$classSlotStatusEnum_DRAFT =
    const ClassSlotStatusEnum._('DRAFT');
const ClassSlotStatusEnum _$classSlotStatusEnum_PUBLISHED =
    const ClassSlotStatusEnum._('PUBLISHED');
const ClassSlotStatusEnum _$classSlotStatusEnum_CONFIRMED =
    const ClassSlotStatusEnum._('CONFIRMED');
const ClassSlotStatusEnum _$classSlotStatusEnum_AUTO_CANCELLED =
    const ClassSlotStatusEnum._('AUTO_CANCELLED');
const ClassSlotStatusEnum _$classSlotStatusEnum_CANCELLED =
    const ClassSlotStatusEnum._('CANCELLED');
const ClassSlotStatusEnum _$classSlotStatusEnum_COMPLETED =
    const ClassSlotStatusEnum._('COMPLETED');

ClassSlotStatusEnum _$classSlotStatusEnumValueOf(String name) {
  switch (name) {
    case 'DRAFT':
      return _$classSlotStatusEnum_DRAFT;
    case 'PUBLISHED':
      return _$classSlotStatusEnum_PUBLISHED;
    case 'CONFIRMED':
      return _$classSlotStatusEnum_CONFIRMED;
    case 'AUTO_CANCELLED':
      return _$classSlotStatusEnum_AUTO_CANCELLED;
    case 'CANCELLED':
      return _$classSlotStatusEnum_CANCELLED;
    case 'COMPLETED':
      return _$classSlotStatusEnum_COMPLETED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<ClassSlotStatusEnum> _$classSlotStatusEnumValues =
    BuiltSet<ClassSlotStatusEnum>(const <ClassSlotStatusEnum>[
      _$classSlotStatusEnum_DRAFT,
      _$classSlotStatusEnum_PUBLISHED,
      _$classSlotStatusEnum_CONFIRMED,
      _$classSlotStatusEnum_AUTO_CANCELLED,
      _$classSlotStatusEnum_CANCELLED,
      _$classSlotStatusEnum_COMPLETED,
    ]);

Serializer<ClassSlotStatusEnum> _$classSlotStatusEnumSerializer =
    _$ClassSlotStatusEnumSerializer();

class _$ClassSlotStatusEnumSerializer
    implements PrimitiveSerializer<ClassSlotStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'DRAFT': 'DRAFT',
    'PUBLISHED': 'PUBLISHED',
    'CONFIRMED': 'CONFIRMED',
    'AUTO_CANCELLED': 'AUTO_CANCELLED',
    'CANCELLED': 'CANCELLED',
    'COMPLETED': 'COMPLETED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'DRAFT': 'DRAFT',
    'PUBLISHED': 'PUBLISHED',
    'CONFIRMED': 'CONFIRMED',
    'AUTO_CANCELLED': 'AUTO_CANCELLED',
    'CANCELLED': 'CANCELLED',
    'COMPLETED': 'COMPLETED',
  };

  @override
  final Iterable<Type> types = const <Type>[ClassSlotStatusEnum];
  @override
  final String wireName = 'ClassSlotStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    ClassSlotStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  ClassSlotStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => ClassSlotStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$ClassSlot extends ClassSlot {
  @override
  final String id;
  @override
  final String branchId;
  @override
  final String classTypeId;
  @override
  final String? instructorUserId;
  @override
  final DateTime startAt;
  @override
  final DateTime endAt;
  @override
  final String timezone;
  @override
  final ClassSlotStatusEnum status;
  @override
  final int capacity;
  @override
  final int bookedCount;
  @override
  final int version;

  factory _$ClassSlot([void Function(ClassSlotBuilder)? updates]) =>
      (ClassSlotBuilder()..update(updates))._build();

  _$ClassSlot._({
    required this.id,
    required this.branchId,
    required this.classTypeId,
    this.instructorUserId,
    required this.startAt,
    required this.endAt,
    required this.timezone,
    required this.status,
    required this.capacity,
    required this.bookedCount,
    required this.version,
  }) : super._();
  @override
  ClassSlot rebuild(void Function(ClassSlotBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ClassSlotBuilder toBuilder() => ClassSlotBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ClassSlot &&
        id == other.id &&
        branchId == other.branchId &&
        classTypeId == other.classTypeId &&
        instructorUserId == other.instructorUserId &&
        startAt == other.startAt &&
        endAt == other.endAt &&
        timezone == other.timezone &&
        status == other.status &&
        capacity == other.capacity &&
        bookedCount == other.bookedCount &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, classTypeId.hashCode);
    _$hash = $jc(_$hash, instructorUserId.hashCode);
    _$hash = $jc(_$hash, startAt.hashCode);
    _$hash = $jc(_$hash, endAt.hashCode);
    _$hash = $jc(_$hash, timezone.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, capacity.hashCode);
    _$hash = $jc(_$hash, bookedCount.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ClassSlot')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('classTypeId', classTypeId)
          ..add('instructorUserId', instructorUserId)
          ..add('startAt', startAt)
          ..add('endAt', endAt)
          ..add('timezone', timezone)
          ..add('status', status)
          ..add('capacity', capacity)
          ..add('bookedCount', bookedCount)
          ..add('version', version))
        .toString();
  }
}

class ClassSlotBuilder implements Builder<ClassSlot, ClassSlotBuilder> {
  _$ClassSlot? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _classTypeId;
  String? get classTypeId => _$this._classTypeId;
  set classTypeId(String? classTypeId) => _$this._classTypeId = classTypeId;

  String? _instructorUserId;
  String? get instructorUserId => _$this._instructorUserId;
  set instructorUserId(String? instructorUserId) =>
      _$this._instructorUserId = instructorUserId;

  DateTime? _startAt;
  DateTime? get startAt => _$this._startAt;
  set startAt(DateTime? startAt) => _$this._startAt = startAt;

  DateTime? _endAt;
  DateTime? get endAt => _$this._endAt;
  set endAt(DateTime? endAt) => _$this._endAt = endAt;

  String? _timezone;
  String? get timezone => _$this._timezone;
  set timezone(String? timezone) => _$this._timezone = timezone;

  ClassSlotStatusEnum? _status;
  ClassSlotStatusEnum? get status => _$this._status;
  set status(ClassSlotStatusEnum? status) => _$this._status = status;

  int? _capacity;
  int? get capacity => _$this._capacity;
  set capacity(int? capacity) => _$this._capacity = capacity;

  int? _bookedCount;
  int? get bookedCount => _$this._bookedCount;
  set bookedCount(int? bookedCount) => _$this._bookedCount = bookedCount;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  ClassSlotBuilder() {
    ClassSlot._defaults(this);
  }

  ClassSlotBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchId = $v.branchId;
      _classTypeId = $v.classTypeId;
      _instructorUserId = $v.instructorUserId;
      _startAt = $v.startAt;
      _endAt = $v.endAt;
      _timezone = $v.timezone;
      _status = $v.status;
      _capacity = $v.capacity;
      _bookedCount = $v.bookedCount;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ClassSlot other) {
    _$v = other as _$ClassSlot;
  }

  @override
  void update(void Function(ClassSlotBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ClassSlot build() => _build();

  _$ClassSlot _build() {
    final _$result =
        _$v ??
        _$ClassSlot._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'ClassSlot', 'id'),
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'ClassSlot',
            'branchId',
          ),
          classTypeId: BuiltValueNullFieldError.checkNotNull(
            classTypeId,
            r'ClassSlot',
            'classTypeId',
          ),
          instructorUserId: instructorUserId,
          startAt: BuiltValueNullFieldError.checkNotNull(
            startAt,
            r'ClassSlot',
            'startAt',
          ),
          endAt: BuiltValueNullFieldError.checkNotNull(
            endAt,
            r'ClassSlot',
            'endAt',
          ),
          timezone: BuiltValueNullFieldError.checkNotNull(
            timezone,
            r'ClassSlot',
            'timezone',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'ClassSlot',
            'status',
          ),
          capacity: BuiltValueNullFieldError.checkNotNull(
            capacity,
            r'ClassSlot',
            'capacity',
          ),
          bookedCount: BuiltValueNullFieldError.checkNotNull(
            bookedCount,
            r'ClassSlot',
            'bookedCount',
          ),
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'ClassSlot',
            'version',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
