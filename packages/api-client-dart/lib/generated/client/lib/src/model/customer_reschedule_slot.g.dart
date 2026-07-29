// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_reschedule_slot.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CustomerRescheduleSlotStatusEnum
_$customerRescheduleSlotStatusEnum_DRAFT =
    const CustomerRescheduleSlotStatusEnum._('DRAFT');
const CustomerRescheduleSlotStatusEnum
_$customerRescheduleSlotStatusEnum_PUBLISHED =
    const CustomerRescheduleSlotStatusEnum._('PUBLISHED');
const CustomerRescheduleSlotStatusEnum
_$customerRescheduleSlotStatusEnum_CONFIRMED =
    const CustomerRescheduleSlotStatusEnum._('CONFIRMED');
const CustomerRescheduleSlotStatusEnum
_$customerRescheduleSlotStatusEnum_COMPLETED =
    const CustomerRescheduleSlotStatusEnum._('COMPLETED');
const CustomerRescheduleSlotStatusEnum
_$customerRescheduleSlotStatusEnum_AUTO_CANCELLED =
    const CustomerRescheduleSlotStatusEnum._('AUTO_CANCELLED');
const CustomerRescheduleSlotStatusEnum
_$customerRescheduleSlotStatusEnum_MANUAL_CANCELLED =
    const CustomerRescheduleSlotStatusEnum._('MANUAL_CANCELLED');

CustomerRescheduleSlotStatusEnum _$customerRescheduleSlotStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'DRAFT':
      return _$customerRescheduleSlotStatusEnum_DRAFT;
    case 'PUBLISHED':
      return _$customerRescheduleSlotStatusEnum_PUBLISHED;
    case 'CONFIRMED':
      return _$customerRescheduleSlotStatusEnum_CONFIRMED;
    case 'COMPLETED':
      return _$customerRescheduleSlotStatusEnum_COMPLETED;
    case 'AUTO_CANCELLED':
      return _$customerRescheduleSlotStatusEnum_AUTO_CANCELLED;
    case 'MANUAL_CANCELLED':
      return _$customerRescheduleSlotStatusEnum_MANUAL_CANCELLED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CustomerRescheduleSlotStatusEnum>
_$customerRescheduleSlotStatusEnumValues =
    BuiltSet<CustomerRescheduleSlotStatusEnum>(
      const <CustomerRescheduleSlotStatusEnum>[
        _$customerRescheduleSlotStatusEnum_DRAFT,
        _$customerRescheduleSlotStatusEnum_PUBLISHED,
        _$customerRescheduleSlotStatusEnum_CONFIRMED,
        _$customerRescheduleSlotStatusEnum_COMPLETED,
        _$customerRescheduleSlotStatusEnum_AUTO_CANCELLED,
        _$customerRescheduleSlotStatusEnum_MANUAL_CANCELLED,
      ],
    );

Serializer<CustomerRescheduleSlotStatusEnum>
_$customerRescheduleSlotStatusEnumSerializer =
    _$CustomerRescheduleSlotStatusEnumSerializer();

class _$CustomerRescheduleSlotStatusEnumSerializer
    implements PrimitiveSerializer<CustomerRescheduleSlotStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'DRAFT': 'DRAFT',
    'PUBLISHED': 'PUBLISHED',
    'CONFIRMED': 'CONFIRMED',
    'COMPLETED': 'COMPLETED',
    'AUTO_CANCELLED': 'AUTO_CANCELLED',
    'MANUAL_CANCELLED': 'MANUAL_CANCELLED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'DRAFT': 'DRAFT',
    'PUBLISHED': 'PUBLISHED',
    'CONFIRMED': 'CONFIRMED',
    'COMPLETED': 'COMPLETED',
    'AUTO_CANCELLED': 'AUTO_CANCELLED',
    'MANUAL_CANCELLED': 'MANUAL_CANCELLED',
  };

  @override
  final Iterable<Type> types = const <Type>[CustomerRescheduleSlotStatusEnum];
  @override
  final String wireName = 'CustomerRescheduleSlotStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    CustomerRescheduleSlotStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CustomerRescheduleSlotStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CustomerRescheduleSlotStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

abstract mixin class CustomerRescheduleSlotBuilder {
  void replace(CustomerRescheduleSlot other);
  void update(void Function(CustomerRescheduleSlotBuilder) updates);
  String? get id;
  set id(String? id);

  String? get branchId;
  set branchId(String? branchId);

  String? get classTypeId;
  set classTypeId(String? classTypeId);

  DateTime? get startAt;
  set startAt(DateTime? startAt);

  DateTime? get endAt;
  set endAt(DateTime? endAt);

  String? get timezone;
  set timezone(String? timezone);

  CustomerRescheduleSlotStatusEnum? get status;
  set status(CustomerRescheduleSlotStatusEnum? status);

  int? get capacity;
  set capacity(int? capacity);

  int? get bookedCount;
  set bookedCount(int? bookedCount);

  BookingBranchBuilder get branch;
  set branch(BookingBranchBuilder? branch);

  VoucherPackagesInnerBuilder get classType;
  set classType(VoucherPackagesInnerBuilder? classType);
}

class _$$CustomerRescheduleSlot extends $CustomerRescheduleSlot {
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
  final CustomerRescheduleSlotStatusEnum status;
  @override
  final int capacity;
  @override
  final int bookedCount;
  @override
  final BookingBranch branch;
  @override
  final VoucherPackagesInner classType;

  factory _$$CustomerRescheduleSlot([
    void Function($CustomerRescheduleSlotBuilder)? updates,
  ]) => ($CustomerRescheduleSlotBuilder()..update(updates))._build();

  _$$CustomerRescheduleSlot._({
    required this.id,
    required this.branchId,
    required this.classTypeId,
    required this.startAt,
    required this.endAt,
    required this.timezone,
    required this.status,
    required this.capacity,
    required this.bookedCount,
    required this.branch,
    required this.classType,
  }) : super._();
  @override
  $CustomerRescheduleSlot rebuild(
    void Function($CustomerRescheduleSlotBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  $CustomerRescheduleSlotBuilder toBuilder() =>
      $CustomerRescheduleSlotBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is $CustomerRescheduleSlot &&
        id == other.id &&
        branchId == other.branchId &&
        classTypeId == other.classTypeId &&
        startAt == other.startAt &&
        endAt == other.endAt &&
        timezone == other.timezone &&
        status == other.status &&
        capacity == other.capacity &&
        bookedCount == other.bookedCount &&
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
    _$hash = $jc(_$hash, branch.hashCode);
    _$hash = $jc(_$hash, classType.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'$CustomerRescheduleSlot')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('classTypeId', classTypeId)
          ..add('startAt', startAt)
          ..add('endAt', endAt)
          ..add('timezone', timezone)
          ..add('status', status)
          ..add('capacity', capacity)
          ..add('bookedCount', bookedCount)
          ..add('branch', branch)
          ..add('classType', classType))
        .toString();
  }
}

class $CustomerRescheduleSlotBuilder
    implements
        Builder<$CustomerRescheduleSlot, $CustomerRescheduleSlotBuilder>,
        CustomerRescheduleSlotBuilder {
  _$$CustomerRescheduleSlot? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(covariant String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(covariant String? branchId) => _$this._branchId = branchId;

  String? _classTypeId;
  String? get classTypeId => _$this._classTypeId;
  set classTypeId(covariant String? classTypeId) =>
      _$this._classTypeId = classTypeId;

  DateTime? _startAt;
  DateTime? get startAt => _$this._startAt;
  set startAt(covariant DateTime? startAt) => _$this._startAt = startAt;

  DateTime? _endAt;
  DateTime? get endAt => _$this._endAt;
  set endAt(covariant DateTime? endAt) => _$this._endAt = endAt;

  String? _timezone;
  String? get timezone => _$this._timezone;
  set timezone(covariant String? timezone) => _$this._timezone = timezone;

  CustomerRescheduleSlotStatusEnum? _status;
  CustomerRescheduleSlotStatusEnum? get status => _$this._status;
  set status(covariant CustomerRescheduleSlotStatusEnum? status) =>
      _$this._status = status;

  int? _capacity;
  int? get capacity => _$this._capacity;
  set capacity(covariant int? capacity) => _$this._capacity = capacity;

  int? _bookedCount;
  int? get bookedCount => _$this._bookedCount;
  set bookedCount(covariant int? bookedCount) =>
      _$this._bookedCount = bookedCount;

  BookingBranchBuilder? _branch;
  BookingBranchBuilder get branch => _$this._branch ??= BookingBranchBuilder();
  set branch(covariant BookingBranchBuilder? branch) => _$this._branch = branch;

  VoucherPackagesInnerBuilder? _classType;
  VoucherPackagesInnerBuilder get classType =>
      _$this._classType ??= VoucherPackagesInnerBuilder();
  set classType(covariant VoucherPackagesInnerBuilder? classType) =>
      _$this._classType = classType;

  $CustomerRescheduleSlotBuilder() {
    $CustomerRescheduleSlot._defaults(this);
  }

  $CustomerRescheduleSlotBuilder get _$this {
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
      _branch = $v.branch.toBuilder();
      _classType = $v.classType.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant $CustomerRescheduleSlot other) {
    _$v = other as _$$CustomerRescheduleSlot;
  }

  @override
  void update(void Function($CustomerRescheduleSlotBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  $CustomerRescheduleSlot build() => _build();

  _$$CustomerRescheduleSlot _build() {
    _$$CustomerRescheduleSlot _$result;
    try {
      _$result =
          _$v ??
          _$$CustomerRescheduleSlot._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'$CustomerRescheduleSlot',
              'id',
            ),
            branchId: BuiltValueNullFieldError.checkNotNull(
              branchId,
              r'$CustomerRescheduleSlot',
              'branchId',
            ),
            classTypeId: BuiltValueNullFieldError.checkNotNull(
              classTypeId,
              r'$CustomerRescheduleSlot',
              'classTypeId',
            ),
            startAt: BuiltValueNullFieldError.checkNotNull(
              startAt,
              r'$CustomerRescheduleSlot',
              'startAt',
            ),
            endAt: BuiltValueNullFieldError.checkNotNull(
              endAt,
              r'$CustomerRescheduleSlot',
              'endAt',
            ),
            timezone: BuiltValueNullFieldError.checkNotNull(
              timezone,
              r'$CustomerRescheduleSlot',
              'timezone',
            ),
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'$CustomerRescheduleSlot',
              'status',
            ),
            capacity: BuiltValueNullFieldError.checkNotNull(
              capacity,
              r'$CustomerRescheduleSlot',
              'capacity',
            ),
            bookedCount: BuiltValueNullFieldError.checkNotNull(
              bookedCount,
              r'$CustomerRescheduleSlot',
              'bookedCount',
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
          r'$CustomerRescheduleSlot',
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
