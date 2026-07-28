// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const BookingSource_Enum _$bookingSourceEnum_SELF = const BookingSource_Enum._(
  'SELF',
);
const BookingSource_Enum _$bookingSourceEnum_ADMIN_ASSISTED =
    const BookingSource_Enum._('ADMIN_ASSISTED');

BookingSource_Enum _$bookingSourceEnumValueOf(String name) {
  switch (name) {
    case 'SELF':
      return _$bookingSourceEnum_SELF;
    case 'ADMIN_ASSISTED':
      return _$bookingSourceEnum_ADMIN_ASSISTED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<BookingSource_Enum> _$bookingSourceEnumValues =
    BuiltSet<BookingSource_Enum>(const <BookingSource_Enum>[
      _$bookingSourceEnum_SELF,
      _$bookingSourceEnum_ADMIN_ASSISTED,
    ]);

const BookingStatusEnum _$bookingStatusEnum_BOOKED = const BookingStatusEnum._(
  'BOOKED',
);
const BookingStatusEnum _$bookingStatusEnum_RESCHEDULE_PENDING =
    const BookingStatusEnum._('RESCHEDULE_PENDING');
const BookingStatusEnum _$bookingStatusEnum_CANCELLED =
    const BookingStatusEnum._('CANCELLED');
const BookingStatusEnum _$bookingStatusEnum_ATTENDED =
    const BookingStatusEnum._('ATTENDED');
const BookingStatusEnum _$bookingStatusEnum_NO_SHOW = const BookingStatusEnum._(
  'NO_SHOW',
);

BookingStatusEnum _$bookingStatusEnumValueOf(String name) {
  switch (name) {
    case 'BOOKED':
      return _$bookingStatusEnum_BOOKED;
    case 'RESCHEDULE_PENDING':
      return _$bookingStatusEnum_RESCHEDULE_PENDING;
    case 'CANCELLED':
      return _$bookingStatusEnum_CANCELLED;
    case 'ATTENDED':
      return _$bookingStatusEnum_ATTENDED;
    case 'NO_SHOW':
      return _$bookingStatusEnum_NO_SHOW;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<BookingStatusEnum> _$bookingStatusEnumValues =
    BuiltSet<BookingStatusEnum>(const <BookingStatusEnum>[
      _$bookingStatusEnum_BOOKED,
      _$bookingStatusEnum_RESCHEDULE_PENDING,
      _$bookingStatusEnum_CANCELLED,
      _$bookingStatusEnum_ATTENDED,
      _$bookingStatusEnum_NO_SHOW,
    ]);

const BookingReservedQuantityEnum _$bookingReservedQuantityEnum_number1 =
    const BookingReservedQuantityEnum._('number1');

BookingReservedQuantityEnum _$bookingReservedQuantityEnumValueOf(String name) {
  switch (name) {
    case 'number1':
      return _$bookingReservedQuantityEnum_number1;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<BookingReservedQuantityEnum>
_$bookingReservedQuantityEnumValues = BuiltSet<BookingReservedQuantityEnum>(
  const <BookingReservedQuantityEnum>[_$bookingReservedQuantityEnum_number1],
);

Serializer<BookingSource_Enum> _$bookingSourceEnumSerializer =
    _$BookingSource_EnumSerializer();
Serializer<BookingStatusEnum> _$bookingStatusEnumSerializer =
    _$BookingStatusEnumSerializer();
Serializer<BookingReservedQuantityEnum>
_$bookingReservedQuantityEnumSerializer =
    _$BookingReservedQuantityEnumSerializer();

class _$BookingSource_EnumSerializer
    implements PrimitiveSerializer<BookingSource_Enum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'SELF': 'SELF',
    'ADMIN_ASSISTED': 'ADMIN_ASSISTED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'SELF': 'SELF',
    'ADMIN_ASSISTED': 'ADMIN_ASSISTED',
  };

  @override
  final Iterable<Type> types = const <Type>[BookingSource_Enum];
  @override
  final String wireName = 'BookingSource_Enum';

  @override
  Object serialize(
    Serializers serializers,
    BookingSource_Enum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  BookingSource_Enum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => BookingSource_Enum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$BookingStatusEnumSerializer
    implements PrimitiveSerializer<BookingStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'BOOKED': 'BOOKED',
    'RESCHEDULE_PENDING': 'RESCHEDULE_PENDING',
    'CANCELLED': 'CANCELLED',
    'ATTENDED': 'ATTENDED',
    'NO_SHOW': 'NO_SHOW',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'BOOKED': 'BOOKED',
    'RESCHEDULE_PENDING': 'RESCHEDULE_PENDING',
    'CANCELLED': 'CANCELLED',
    'ATTENDED': 'ATTENDED',
    'NO_SHOW': 'NO_SHOW',
  };

  @override
  final Iterable<Type> types = const <Type>[BookingStatusEnum];
  @override
  final String wireName = 'BookingStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    BookingStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  BookingStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => BookingStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$BookingReservedQuantityEnumSerializer
    implements PrimitiveSerializer<BookingReservedQuantityEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'number1': 1,
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    1: 'number1',
  };

  @override
  final Iterable<Type> types = const <Type>[BookingReservedQuantityEnum];
  @override
  final String wireName = 'BookingReservedQuantityEnum';

  @override
  Object serialize(
    Serializers serializers,
    BookingReservedQuantityEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  BookingReservedQuantityEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => BookingReservedQuantityEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$Booking extends Booking {
  @override
  final String id;
  @override
  final String branchId;
  @override
  final String classSlotId;
  @override
  final String customerUserId;
  @override
  final String customerPackageId;
  @override
  final String reservationId;
  @override
  final String createdById;
  @override
  final BookingSource_Enum source_;
  @override
  final BookingStatusEnum status;
  @override
  final BookingReservedQuantityEnum reservedQuantity;
  @override
  final DateTime createdAt;
  @override
  final int version;
  @override
  final bool idempotentReplay;
  @override
  final BookingCustomer? customer;
  @override
  final BookingSessionBalance? sessionBalance;
  @override
  final BookingBranch? branch;
  @override
  final BookingClassSlot? classSlot;
  @override
  final BookingClassSlotClassType? package;
  @override
  final BookingAttendance? attendance;

  factory _$Booking([void Function(BookingBuilder)? updates]) =>
      (BookingBuilder()..update(updates))._build();

  _$Booking._({
    required this.id,
    required this.branchId,
    required this.classSlotId,
    required this.customerUserId,
    required this.customerPackageId,
    required this.reservationId,
    required this.createdById,
    required this.source_,
    required this.status,
    required this.reservedQuantity,
    required this.createdAt,
    required this.version,
    required this.idempotentReplay,
    this.customer,
    this.sessionBalance,
    this.branch,
    this.classSlot,
    this.package,
    this.attendance,
  }) : super._();
  @override
  Booking rebuild(void Function(BookingBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  BookingBuilder toBuilder() => BookingBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Booking &&
        id == other.id &&
        branchId == other.branchId &&
        classSlotId == other.classSlotId &&
        customerUserId == other.customerUserId &&
        customerPackageId == other.customerPackageId &&
        reservationId == other.reservationId &&
        createdById == other.createdById &&
        source_ == other.source_ &&
        status == other.status &&
        reservedQuantity == other.reservedQuantity &&
        createdAt == other.createdAt &&
        version == other.version &&
        idempotentReplay == other.idempotentReplay &&
        customer == other.customer &&
        sessionBalance == other.sessionBalance &&
        branch == other.branch &&
        classSlot == other.classSlot &&
        package == other.package &&
        attendance == other.attendance;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, classSlotId.hashCode);
    _$hash = $jc(_$hash, customerUserId.hashCode);
    _$hash = $jc(_$hash, customerPackageId.hashCode);
    _$hash = $jc(_$hash, reservationId.hashCode);
    _$hash = $jc(_$hash, createdById.hashCode);
    _$hash = $jc(_$hash, source_.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, reservedQuantity.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jc(_$hash, idempotentReplay.hashCode);
    _$hash = $jc(_$hash, customer.hashCode);
    _$hash = $jc(_$hash, sessionBalance.hashCode);
    _$hash = $jc(_$hash, branch.hashCode);
    _$hash = $jc(_$hash, classSlot.hashCode);
    _$hash = $jc(_$hash, package.hashCode);
    _$hash = $jc(_$hash, attendance.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Booking')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('classSlotId', classSlotId)
          ..add('customerUserId', customerUserId)
          ..add('customerPackageId', customerPackageId)
          ..add('reservationId', reservationId)
          ..add('createdById', createdById)
          ..add('source_', source_)
          ..add('status', status)
          ..add('reservedQuantity', reservedQuantity)
          ..add('createdAt', createdAt)
          ..add('version', version)
          ..add('idempotentReplay', idempotentReplay)
          ..add('customer', customer)
          ..add('sessionBalance', sessionBalance)
          ..add('branch', branch)
          ..add('classSlot', classSlot)
          ..add('package', package)
          ..add('attendance', attendance))
        .toString();
  }
}

class BookingBuilder implements Builder<Booking, BookingBuilder> {
  _$Booking? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _classSlotId;
  String? get classSlotId => _$this._classSlotId;
  set classSlotId(String? classSlotId) => _$this._classSlotId = classSlotId;

  String? _customerUserId;
  String? get customerUserId => _$this._customerUserId;
  set customerUserId(String? customerUserId) =>
      _$this._customerUserId = customerUserId;

  String? _customerPackageId;
  String? get customerPackageId => _$this._customerPackageId;
  set customerPackageId(String? customerPackageId) =>
      _$this._customerPackageId = customerPackageId;

  String? _reservationId;
  String? get reservationId => _$this._reservationId;
  set reservationId(String? reservationId) =>
      _$this._reservationId = reservationId;

  String? _createdById;
  String? get createdById => _$this._createdById;
  set createdById(String? createdById) => _$this._createdById = createdById;

  BookingSource_Enum? _source_;
  BookingSource_Enum? get source_ => _$this._source_;
  set source_(BookingSource_Enum? source_) => _$this._source_ = source_;

  BookingStatusEnum? _status;
  BookingStatusEnum? get status => _$this._status;
  set status(BookingStatusEnum? status) => _$this._status = status;

  BookingReservedQuantityEnum? _reservedQuantity;
  BookingReservedQuantityEnum? get reservedQuantity => _$this._reservedQuantity;
  set reservedQuantity(BookingReservedQuantityEnum? reservedQuantity) =>
      _$this._reservedQuantity = reservedQuantity;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  bool? _idempotentReplay;
  bool? get idempotentReplay => _$this._idempotentReplay;
  set idempotentReplay(bool? idempotentReplay) =>
      _$this._idempotentReplay = idempotentReplay;

  BookingCustomerBuilder? _customer;
  BookingCustomerBuilder get customer =>
      _$this._customer ??= BookingCustomerBuilder();
  set customer(BookingCustomerBuilder? customer) => _$this._customer = customer;

  BookingSessionBalanceBuilder? _sessionBalance;
  BookingSessionBalanceBuilder get sessionBalance =>
      _$this._sessionBalance ??= BookingSessionBalanceBuilder();
  set sessionBalance(BookingSessionBalanceBuilder? sessionBalance) =>
      _$this._sessionBalance = sessionBalance;

  BookingBranchBuilder? _branch;
  BookingBranchBuilder get branch => _$this._branch ??= BookingBranchBuilder();
  set branch(BookingBranchBuilder? branch) => _$this._branch = branch;

  BookingClassSlotBuilder? _classSlot;
  BookingClassSlotBuilder get classSlot =>
      _$this._classSlot ??= BookingClassSlotBuilder();
  set classSlot(BookingClassSlotBuilder? classSlot) =>
      _$this._classSlot = classSlot;

  BookingClassSlotClassTypeBuilder? _package;
  BookingClassSlotClassTypeBuilder get package =>
      _$this._package ??= BookingClassSlotClassTypeBuilder();
  set package(BookingClassSlotClassTypeBuilder? package) =>
      _$this._package = package;

  BookingAttendanceBuilder? _attendance;
  BookingAttendanceBuilder get attendance =>
      _$this._attendance ??= BookingAttendanceBuilder();
  set attendance(BookingAttendanceBuilder? attendance) =>
      _$this._attendance = attendance;

  BookingBuilder() {
    Booking._defaults(this);
  }

  BookingBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchId = $v.branchId;
      _classSlotId = $v.classSlotId;
      _customerUserId = $v.customerUserId;
      _customerPackageId = $v.customerPackageId;
      _reservationId = $v.reservationId;
      _createdById = $v.createdById;
      _source_ = $v.source_;
      _status = $v.status;
      _reservedQuantity = $v.reservedQuantity;
      _createdAt = $v.createdAt;
      _version = $v.version;
      _idempotentReplay = $v.idempotentReplay;
      _customer = $v.customer?.toBuilder();
      _sessionBalance = $v.sessionBalance?.toBuilder();
      _branch = $v.branch?.toBuilder();
      _classSlot = $v.classSlot?.toBuilder();
      _package = $v.package?.toBuilder();
      _attendance = $v.attendance?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Booking other) {
    _$v = other as _$Booking;
  }

  @override
  void update(void Function(BookingBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Booking build() => _build();

  _$Booking _build() {
    _$Booking _$result;
    try {
      _$result =
          _$v ??
          _$Booking._(
            id: BuiltValueNullFieldError.checkNotNull(id, r'Booking', 'id'),
            branchId: BuiltValueNullFieldError.checkNotNull(
              branchId,
              r'Booking',
              'branchId',
            ),
            classSlotId: BuiltValueNullFieldError.checkNotNull(
              classSlotId,
              r'Booking',
              'classSlotId',
            ),
            customerUserId: BuiltValueNullFieldError.checkNotNull(
              customerUserId,
              r'Booking',
              'customerUserId',
            ),
            customerPackageId: BuiltValueNullFieldError.checkNotNull(
              customerPackageId,
              r'Booking',
              'customerPackageId',
            ),
            reservationId: BuiltValueNullFieldError.checkNotNull(
              reservationId,
              r'Booking',
              'reservationId',
            ),
            createdById: BuiltValueNullFieldError.checkNotNull(
              createdById,
              r'Booking',
              'createdById',
            ),
            source_: BuiltValueNullFieldError.checkNotNull(
              source_,
              r'Booking',
              'source_',
            ),
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'Booking',
              'status',
            ),
            reservedQuantity: BuiltValueNullFieldError.checkNotNull(
              reservedQuantity,
              r'Booking',
              'reservedQuantity',
            ),
            createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt,
              r'Booking',
              'createdAt',
            ),
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'Booking',
              'version',
            ),
            idempotentReplay: BuiltValueNullFieldError.checkNotNull(
              idempotentReplay,
              r'Booking',
              'idempotentReplay',
            ),
            customer: _customer?.build(),
            sessionBalance: _sessionBalance?.build(),
            branch: _branch?.build(),
            classSlot: _classSlot?.build(),
            package: _package?.build(),
            attendance: _attendance?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'customer';
        _customer?.build();
        _$failedField = 'sessionBalance';
        _sessionBalance?.build();
        _$failedField = 'branch';
        _branch?.build();
        _$failedField = 'classSlot';
        _classSlot?.build();
        _$failedField = 'package';
        _package?.build();
        _$failedField = 'attendance';
        _attendance?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'Booking',
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
