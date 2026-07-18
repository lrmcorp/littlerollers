// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

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

Serializer<BookingStatusEnum> _$bookingStatusEnumSerializer =
    _$BookingStatusEnumSerializer();

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
  final BookingStatusEnum status;
  @override
  final int reservedQuantity;
  @override
  final int version;
  @override
  final bool idempotentReplay;

  factory _$Booking([void Function(BookingBuilder)? updates]) =>
      (BookingBuilder()..update(updates))._build();

  _$Booking._({
    required this.id,
    required this.branchId,
    required this.classSlotId,
    required this.customerUserId,
    required this.customerPackageId,
    required this.status,
    required this.reservedQuantity,
    required this.version,
    required this.idempotentReplay,
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
        status == other.status &&
        reservedQuantity == other.reservedQuantity &&
        version == other.version &&
        idempotentReplay == other.idempotentReplay;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, classSlotId.hashCode);
    _$hash = $jc(_$hash, customerUserId.hashCode);
    _$hash = $jc(_$hash, customerPackageId.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, reservedQuantity.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jc(_$hash, idempotentReplay.hashCode);
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
          ..add('status', status)
          ..add('reservedQuantity', reservedQuantity)
          ..add('version', version)
          ..add('idempotentReplay', idempotentReplay))
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

  BookingStatusEnum? _status;
  BookingStatusEnum? get status => _$this._status;
  set status(BookingStatusEnum? status) => _$this._status = status;

  int? _reservedQuantity;
  int? get reservedQuantity => _$this._reservedQuantity;
  set reservedQuantity(int? reservedQuantity) =>
      _$this._reservedQuantity = reservedQuantity;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  bool? _idempotentReplay;
  bool? get idempotentReplay => _$this._idempotentReplay;
  set idempotentReplay(bool? idempotentReplay) =>
      _$this._idempotentReplay = idempotentReplay;

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
      _status = $v.status;
      _reservedQuantity = $v.reservedQuantity;
      _version = $v.version;
      _idempotentReplay = $v.idempotentReplay;
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
    final _$result =
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
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
