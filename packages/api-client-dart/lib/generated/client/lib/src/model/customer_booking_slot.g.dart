// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_booking_slot.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CustomerBookingSlotStatusEnum _$customerBookingSlotStatusEnum_PUBLISHED =
    const CustomerBookingSlotStatusEnum._('PUBLISHED');
const CustomerBookingSlotStatusEnum _$customerBookingSlotStatusEnum_CONFIRMED =
    const CustomerBookingSlotStatusEnum._('CONFIRMED');

CustomerBookingSlotStatusEnum _$customerBookingSlotStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'PUBLISHED':
      return _$customerBookingSlotStatusEnum_PUBLISHED;
    case 'CONFIRMED':
      return _$customerBookingSlotStatusEnum_CONFIRMED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CustomerBookingSlotStatusEnum>
_$customerBookingSlotStatusEnumValues = BuiltSet<CustomerBookingSlotStatusEnum>(
  const <CustomerBookingSlotStatusEnum>[
    _$customerBookingSlotStatusEnum_PUBLISHED,
    _$customerBookingSlotStatusEnum_CONFIRMED,
  ],
);

Serializer<CustomerBookingSlotStatusEnum>
_$customerBookingSlotStatusEnumSerializer =
    _$CustomerBookingSlotStatusEnumSerializer();

class _$CustomerBookingSlotStatusEnumSerializer
    implements PrimitiveSerializer<CustomerBookingSlotStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PUBLISHED': 'PUBLISHED',
    'CONFIRMED': 'CONFIRMED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PUBLISHED': 'PUBLISHED',
    'CONFIRMED': 'CONFIRMED',
  };

  @override
  final Iterable<Type> types = const <Type>[CustomerBookingSlotStatusEnum];
  @override
  final String wireName = 'CustomerBookingSlotStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    CustomerBookingSlotStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CustomerBookingSlotStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CustomerBookingSlotStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CustomerBookingSlot extends CustomerBookingSlot {
  @override
  final String id;
  @override
  final String branchId;
  @override
  final String classTypeId;
  @override
  final DateTime startAt;
  @override
  final DateTime endAt;
  @override
  final String timezone;
  @override
  final CustomerBookingSlotStatusEnum status;
  @override
  final int capacity;
  @override
  final int bookedCount;
  @override
  final int available;
  @override
  final CustomerBookingSlotBranch branch;
  @override
  final CustomerBookingSlotClassType classType;

  factory _$CustomerBookingSlot([
    void Function(CustomerBookingSlotBuilder)? updates,
  ]) => (CustomerBookingSlotBuilder()..update(updates))._build();

  _$CustomerBookingSlot._({
    required this.id,
    required this.branchId,
    required this.classTypeId,
    required this.startAt,
    required this.endAt,
    required this.timezone,
    required this.status,
    required this.capacity,
    required this.bookedCount,
    required this.available,
    required this.branch,
    required this.classType,
  }) : super._();
  @override
  CustomerBookingSlot rebuild(
    void Function(CustomerBookingSlotBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerBookingSlotBuilder toBuilder() =>
      CustomerBookingSlotBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerBookingSlot &&
        id == other.id &&
        branchId == other.branchId &&
        classTypeId == other.classTypeId &&
        startAt == other.startAt &&
        endAt == other.endAt &&
        timezone == other.timezone &&
        status == other.status &&
        capacity == other.capacity &&
        bookedCount == other.bookedCount &&
        available == other.available &&
        branch == other.branch &&
        classType == other.classType;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, classTypeId.hashCode);
    _$hash = $jc(_$hash, startAt.hashCode);
    _$hash = $jc(_$hash, endAt.hashCode);
    _$hash = $jc(_$hash, timezone.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, capacity.hashCode);
    _$hash = $jc(_$hash, bookedCount.hashCode);
    _$hash = $jc(_$hash, available.hashCode);
    _$hash = $jc(_$hash, branch.hashCode);
    _$hash = $jc(_$hash, classType.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerBookingSlot')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('classTypeId', classTypeId)
          ..add('startAt', startAt)
          ..add('endAt', endAt)
          ..add('timezone', timezone)
          ..add('status', status)
          ..add('capacity', capacity)
          ..add('bookedCount', bookedCount)
          ..add('available', available)
          ..add('branch', branch)
          ..add('classType', classType))
        .toString();
  }
}

class CustomerBookingSlotBuilder
    implements Builder<CustomerBookingSlot, CustomerBookingSlotBuilder> {
  _$CustomerBookingSlot? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _classTypeId;
  String? get classTypeId => _$this._classTypeId;
  set classTypeId(String? classTypeId) => _$this._classTypeId = classTypeId;

  DateTime? _startAt;
  DateTime? get startAt => _$this._startAt;
  set startAt(DateTime? startAt) => _$this._startAt = startAt;

  DateTime? _endAt;
  DateTime? get endAt => _$this._endAt;
  set endAt(DateTime? endAt) => _$this._endAt = endAt;

  String? _timezone;
  String? get timezone => _$this._timezone;
  set timezone(String? timezone) => _$this._timezone = timezone;

  CustomerBookingSlotStatusEnum? _status;
  CustomerBookingSlotStatusEnum? get status => _$this._status;
  set status(CustomerBookingSlotStatusEnum? status) => _$this._status = status;

  int? _capacity;
  int? get capacity => _$this._capacity;
  set capacity(int? capacity) => _$this._capacity = capacity;

  int? _bookedCount;
  int? get bookedCount => _$this._bookedCount;
  set bookedCount(int? bookedCount) => _$this._bookedCount = bookedCount;

  int? _available;
  int? get available => _$this._available;
  set available(int? available) => _$this._available = available;

  CustomerBookingSlotBranchBuilder? _branch;
  CustomerBookingSlotBranchBuilder get branch =>
      _$this._branch ??= CustomerBookingSlotBranchBuilder();
  set branch(CustomerBookingSlotBranchBuilder? branch) =>
      _$this._branch = branch;

  CustomerBookingSlotClassTypeBuilder? _classType;
  CustomerBookingSlotClassTypeBuilder get classType =>
      _$this._classType ??= CustomerBookingSlotClassTypeBuilder();
  set classType(CustomerBookingSlotClassTypeBuilder? classType) =>
      _$this._classType = classType;

  CustomerBookingSlotBuilder() {
    CustomerBookingSlot._defaults(this);
  }

  CustomerBookingSlotBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchId = $v.branchId;
      _classTypeId = $v.classTypeId;
      _startAt = $v.startAt;
      _endAt = $v.endAt;
      _timezone = $v.timezone;
      _status = $v.status;
      _capacity = $v.capacity;
      _bookedCount = $v.bookedCount;
      _available = $v.available;
      _branch = $v.branch.toBuilder();
      _classType = $v.classType.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerBookingSlot other) {
    _$v = other as _$CustomerBookingSlot;
  }

  @override
  void update(void Function(CustomerBookingSlotBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerBookingSlot build() => _build();

  _$CustomerBookingSlot _build() {
    _$CustomerBookingSlot _$result;
    try {
      _$result =
          _$v ??
          _$CustomerBookingSlot._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'CustomerBookingSlot',
              'id',
            ),
            branchId: BuiltValueNullFieldError.checkNotNull(
              branchId,
              r'CustomerBookingSlot',
              'branchId',
            ),
            classTypeId: BuiltValueNullFieldError.checkNotNull(
              classTypeId,
              r'CustomerBookingSlot',
              'classTypeId',
            ),
            startAt: BuiltValueNullFieldError.checkNotNull(
              startAt,
              r'CustomerBookingSlot',
              'startAt',
            ),
            endAt: BuiltValueNullFieldError.checkNotNull(
              endAt,
              r'CustomerBookingSlot',
              'endAt',
            ),
            timezone: BuiltValueNullFieldError.checkNotNull(
              timezone,
              r'CustomerBookingSlot',
              'timezone',
            ),
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'CustomerBookingSlot',
              'status',
            ),
            capacity: BuiltValueNullFieldError.checkNotNull(
              capacity,
              r'CustomerBookingSlot',
              'capacity',
            ),
            bookedCount: BuiltValueNullFieldError.checkNotNull(
              bookedCount,
              r'CustomerBookingSlot',
              'bookedCount',
            ),
            available: BuiltValueNullFieldError.checkNotNull(
              available,
              r'CustomerBookingSlot',
              'available',
            ),
            branch: branch.build(),
            classType: classType.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'branch';
        branch.build();
        _$failedField = 'classType';
        classType.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'CustomerBookingSlot',
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
