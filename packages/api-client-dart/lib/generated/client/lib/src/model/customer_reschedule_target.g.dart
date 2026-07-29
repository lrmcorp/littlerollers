// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_reschedule_target.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CustomerRescheduleTargetStatusEnum
_$customerRescheduleTargetStatusEnum_DRAFT =
    const CustomerRescheduleTargetStatusEnum._('DRAFT');
const CustomerRescheduleTargetStatusEnum
_$customerRescheduleTargetStatusEnum_PUBLISHED =
    const CustomerRescheduleTargetStatusEnum._('PUBLISHED');
const CustomerRescheduleTargetStatusEnum
_$customerRescheduleTargetStatusEnum_CONFIRMED =
    const CustomerRescheduleTargetStatusEnum._('CONFIRMED');
const CustomerRescheduleTargetStatusEnum
_$customerRescheduleTargetStatusEnum_COMPLETED =
    const CustomerRescheduleTargetStatusEnum._('COMPLETED');
const CustomerRescheduleTargetStatusEnum
_$customerRescheduleTargetStatusEnum_AUTO_CANCELLED =
    const CustomerRescheduleTargetStatusEnum._('AUTO_CANCELLED');
const CustomerRescheduleTargetStatusEnum
_$customerRescheduleTargetStatusEnum_MANUAL_CANCELLED =
    const CustomerRescheduleTargetStatusEnum._('MANUAL_CANCELLED');

CustomerRescheduleTargetStatusEnum _$customerRescheduleTargetStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'DRAFT':
      return _$customerRescheduleTargetStatusEnum_DRAFT;
    case 'PUBLISHED':
      return _$customerRescheduleTargetStatusEnum_PUBLISHED;
    case 'CONFIRMED':
      return _$customerRescheduleTargetStatusEnum_CONFIRMED;
    case 'COMPLETED':
      return _$customerRescheduleTargetStatusEnum_COMPLETED;
    case 'AUTO_CANCELLED':
      return _$customerRescheduleTargetStatusEnum_AUTO_CANCELLED;
    case 'MANUAL_CANCELLED':
      return _$customerRescheduleTargetStatusEnum_MANUAL_CANCELLED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CustomerRescheduleTargetStatusEnum>
_$customerRescheduleTargetStatusEnumValues =
    BuiltSet<CustomerRescheduleTargetStatusEnum>(
      const <CustomerRescheduleTargetStatusEnum>[
        _$customerRescheduleTargetStatusEnum_DRAFT,
        _$customerRescheduleTargetStatusEnum_PUBLISHED,
        _$customerRescheduleTargetStatusEnum_CONFIRMED,
        _$customerRescheduleTargetStatusEnum_COMPLETED,
        _$customerRescheduleTargetStatusEnum_AUTO_CANCELLED,
        _$customerRescheduleTargetStatusEnum_MANUAL_CANCELLED,
      ],
    );

Serializer<CustomerRescheduleTargetStatusEnum>
_$customerRescheduleTargetStatusEnumSerializer =
    _$CustomerRescheduleTargetStatusEnumSerializer();

class _$CustomerRescheduleTargetStatusEnumSerializer
    implements PrimitiveSerializer<CustomerRescheduleTargetStatusEnum> {
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
  final Iterable<Type> types = const <Type>[CustomerRescheduleTargetStatusEnum];
  @override
  final String wireName = 'CustomerRescheduleTargetStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    CustomerRescheduleTargetStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CustomerRescheduleTargetStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CustomerRescheduleTargetStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CustomerRescheduleTarget extends CustomerRescheduleTarget {
  @override
  final int availableCapacity;
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

  factory _$CustomerRescheduleTarget([
    void Function(CustomerRescheduleTargetBuilder)? updates,
  ]) => (CustomerRescheduleTargetBuilder()..update(updates))._build();

  _$CustomerRescheduleTarget._({
    required this.availableCapacity,
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
  CustomerRescheduleTarget rebuild(
    void Function(CustomerRescheduleTargetBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerRescheduleTargetBuilder toBuilder() =>
      CustomerRescheduleTargetBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerRescheduleTarget &&
        availableCapacity == other.availableCapacity &&
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
    _$hash = $jc(_$hash, availableCapacity.hashCode);
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
    return (newBuiltValueToStringHelper(r'CustomerRescheduleTarget')
          ..add('availableCapacity', availableCapacity)
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

class CustomerRescheduleTargetBuilder
    implements
        Builder<CustomerRescheduleTarget, CustomerRescheduleTargetBuilder>,
        CustomerRescheduleSlotBuilder {
  _$CustomerRescheduleTarget? _$v;

  int? _availableCapacity;
  int? get availableCapacity => _$this._availableCapacity;
  set availableCapacity(covariant int? availableCapacity) =>
      _$this._availableCapacity = availableCapacity;

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

  CustomerRescheduleTargetBuilder() {
    CustomerRescheduleTarget._defaults(this);
  }

  CustomerRescheduleTargetBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _availableCapacity = $v.availableCapacity;
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
  void replace(covariant CustomerRescheduleTarget other) {
    _$v = other as _$CustomerRescheduleTarget;
  }

  @override
  void update(void Function(CustomerRescheduleTargetBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerRescheduleTarget build() => _build();

  _$CustomerRescheduleTarget _build() {
    _$CustomerRescheduleTarget _$result;
    try {
      _$result =
          _$v ??
          _$CustomerRescheduleTarget._(
            availableCapacity: BuiltValueNullFieldError.checkNotNull(
              availableCapacity,
              r'CustomerRescheduleTarget',
              'availableCapacity',
            ),
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'CustomerRescheduleTarget',
              'id',
            ),
            branchId: BuiltValueNullFieldError.checkNotNull(
              branchId,
              r'CustomerRescheduleTarget',
              'branchId',
            ),
            classTypeId: BuiltValueNullFieldError.checkNotNull(
              classTypeId,
              r'CustomerRescheduleTarget',
              'classTypeId',
            ),
            startAt: BuiltValueNullFieldError.checkNotNull(
              startAt,
              r'CustomerRescheduleTarget',
              'startAt',
            ),
            endAt: BuiltValueNullFieldError.checkNotNull(
              endAt,
              r'CustomerRescheduleTarget',
              'endAt',
            ),
            timezone: BuiltValueNullFieldError.checkNotNull(
              timezone,
              r'CustomerRescheduleTarget',
              'timezone',
            ),
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'CustomerRescheduleTarget',
              'status',
            ),
            capacity: BuiltValueNullFieldError.checkNotNull(
              capacity,
              r'CustomerRescheduleTarget',
              'capacity',
            ),
            bookedCount: BuiltValueNullFieldError.checkNotNull(
              bookedCount,
              r'CustomerRescheduleTarget',
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
          r'CustomerRescheduleTarget',
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
