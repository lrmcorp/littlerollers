// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_booking_cancellation_options.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CustomerBookingCancellationOptionsUnavailableReasonEnum
_$customerBookingCancellationOptionsUnavailableReasonEnum_BOOKING_NOT_ACTIVE =
    const CustomerBookingCancellationOptionsUnavailableReasonEnum._(
      'BOOKING_NOT_ACTIVE',
    );
const CustomerBookingCancellationOptionsUnavailableReasonEnum
_$customerBookingCancellationOptionsUnavailableReasonEnum_CANCELLATION_CUTOFF_PASSED =
    const CustomerBookingCancellationOptionsUnavailableReasonEnum._(
      'CANCELLATION_CUTOFF_PASSED',
    );
const CustomerBookingCancellationOptionsUnavailableReasonEnum
_$customerBookingCancellationOptionsUnavailableReasonEnum_RESCHEDULE_PENDING =
    const CustomerBookingCancellationOptionsUnavailableReasonEnum._(
      'RESCHEDULE_PENDING',
    );
const CustomerBookingCancellationOptionsUnavailableReasonEnum
_$customerBookingCancellationOptionsUnavailableReasonEnum_ATTENDANCE_RECORDED =
    const CustomerBookingCancellationOptionsUnavailableReasonEnum._(
      'ATTENDANCE_RECORDED',
    );
const CustomerBookingCancellationOptionsUnavailableReasonEnum
_$customerBookingCancellationOptionsUnavailableReasonEnum_RESERVATION_NOT_ACTIVE =
    const CustomerBookingCancellationOptionsUnavailableReasonEnum._(
      'RESERVATION_NOT_ACTIVE',
    );
const CustomerBookingCancellationOptionsUnavailableReasonEnum
_$customerBookingCancellationOptionsUnavailableReasonEnum_CLASS_SLOT_UNAVAILABLE =
    const CustomerBookingCancellationOptionsUnavailableReasonEnum._(
      'CLASS_SLOT_UNAVAILABLE',
    );

CustomerBookingCancellationOptionsUnavailableReasonEnum
_$customerBookingCancellationOptionsUnavailableReasonEnumValueOf(String name) {
  switch (name) {
    case 'BOOKING_NOT_ACTIVE':
      return _$customerBookingCancellationOptionsUnavailableReasonEnum_BOOKING_NOT_ACTIVE;
    case 'CANCELLATION_CUTOFF_PASSED':
      return _$customerBookingCancellationOptionsUnavailableReasonEnum_CANCELLATION_CUTOFF_PASSED;
    case 'RESCHEDULE_PENDING':
      return _$customerBookingCancellationOptionsUnavailableReasonEnum_RESCHEDULE_PENDING;
    case 'ATTENDANCE_RECORDED':
      return _$customerBookingCancellationOptionsUnavailableReasonEnum_ATTENDANCE_RECORDED;
    case 'RESERVATION_NOT_ACTIVE':
      return _$customerBookingCancellationOptionsUnavailableReasonEnum_RESERVATION_NOT_ACTIVE;
    case 'CLASS_SLOT_UNAVAILABLE':
      return _$customerBookingCancellationOptionsUnavailableReasonEnum_CLASS_SLOT_UNAVAILABLE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CustomerBookingCancellationOptionsUnavailableReasonEnum>
_$customerBookingCancellationOptionsUnavailableReasonEnumValues =
    BuiltSet<CustomerBookingCancellationOptionsUnavailableReasonEnum>(const <
      CustomerBookingCancellationOptionsUnavailableReasonEnum
    >[
      _$customerBookingCancellationOptionsUnavailableReasonEnum_BOOKING_NOT_ACTIVE,
      _$customerBookingCancellationOptionsUnavailableReasonEnum_CANCELLATION_CUTOFF_PASSED,
      _$customerBookingCancellationOptionsUnavailableReasonEnum_RESCHEDULE_PENDING,
      _$customerBookingCancellationOptionsUnavailableReasonEnum_ATTENDANCE_RECORDED,
      _$customerBookingCancellationOptionsUnavailableReasonEnum_RESERVATION_NOT_ACTIVE,
      _$customerBookingCancellationOptionsUnavailableReasonEnum_CLASS_SLOT_UNAVAILABLE,
    ]);

const CustomerBookingCancellationOptionsSupportActionEnum
_$customerBookingCancellationOptionsSupportActionEnum_CONTACT_STUDIO =
    const CustomerBookingCancellationOptionsSupportActionEnum._(
      'CONTACT_STUDIO',
    );

CustomerBookingCancellationOptionsSupportActionEnum
_$customerBookingCancellationOptionsSupportActionEnumValueOf(String name) {
  switch (name) {
    case 'CONTACT_STUDIO':
      return _$customerBookingCancellationOptionsSupportActionEnum_CONTACT_STUDIO;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CustomerBookingCancellationOptionsSupportActionEnum>
_$customerBookingCancellationOptionsSupportActionEnumValues =
    BuiltSet<CustomerBookingCancellationOptionsSupportActionEnum>(
      const <CustomerBookingCancellationOptionsSupportActionEnum>[
        _$customerBookingCancellationOptionsSupportActionEnum_CONTACT_STUDIO,
      ],
    );

Serializer<CustomerBookingCancellationOptionsUnavailableReasonEnum>
_$customerBookingCancellationOptionsUnavailableReasonEnumSerializer =
    _$CustomerBookingCancellationOptionsUnavailableReasonEnumSerializer();
Serializer<CustomerBookingCancellationOptionsSupportActionEnum>
_$customerBookingCancellationOptionsSupportActionEnumSerializer =
    _$CustomerBookingCancellationOptionsSupportActionEnumSerializer();

class _$CustomerBookingCancellationOptionsUnavailableReasonEnumSerializer
    implements
        PrimitiveSerializer<
          CustomerBookingCancellationOptionsUnavailableReasonEnum
        > {
  static const Map<String, Object> _toWire = const <String, Object>{
    'BOOKING_NOT_ACTIVE': 'BOOKING_NOT_ACTIVE',
    'CANCELLATION_CUTOFF_PASSED': 'CANCELLATION_CUTOFF_PASSED',
    'RESCHEDULE_PENDING': 'RESCHEDULE_PENDING',
    'ATTENDANCE_RECORDED': 'ATTENDANCE_RECORDED',
    'RESERVATION_NOT_ACTIVE': 'RESERVATION_NOT_ACTIVE',
    'CLASS_SLOT_UNAVAILABLE': 'CLASS_SLOT_UNAVAILABLE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'BOOKING_NOT_ACTIVE': 'BOOKING_NOT_ACTIVE',
    'CANCELLATION_CUTOFF_PASSED': 'CANCELLATION_CUTOFF_PASSED',
    'RESCHEDULE_PENDING': 'RESCHEDULE_PENDING',
    'ATTENDANCE_RECORDED': 'ATTENDANCE_RECORDED',
    'RESERVATION_NOT_ACTIVE': 'RESERVATION_NOT_ACTIVE',
    'CLASS_SLOT_UNAVAILABLE': 'CLASS_SLOT_UNAVAILABLE',
  };

  @override
  final Iterable<Type> types = const <Type>[
    CustomerBookingCancellationOptionsUnavailableReasonEnum,
  ];
  @override
  final String wireName =
      'CustomerBookingCancellationOptionsUnavailableReasonEnum';

  @override
  Object serialize(
    Serializers serializers,
    CustomerBookingCancellationOptionsUnavailableReasonEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CustomerBookingCancellationOptionsUnavailableReasonEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CustomerBookingCancellationOptionsUnavailableReasonEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CustomerBookingCancellationOptionsSupportActionEnumSerializer
    implements
        PrimitiveSerializer<
          CustomerBookingCancellationOptionsSupportActionEnum
        > {
  static const Map<String, Object> _toWire = const <String, Object>{
    'CONTACT_STUDIO': 'CONTACT_STUDIO',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'CONTACT_STUDIO': 'CONTACT_STUDIO',
  };

  @override
  final Iterable<Type> types = const <Type>[
    CustomerBookingCancellationOptionsSupportActionEnum,
  ];
  @override
  final String wireName = 'CustomerBookingCancellationOptionsSupportActionEnum';

  @override
  Object serialize(
    Serializers serializers,
    CustomerBookingCancellationOptionsSupportActionEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CustomerBookingCancellationOptionsSupportActionEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CustomerBookingCancellationOptionsSupportActionEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CustomerBookingCancellationOptions
    extends CustomerBookingCancellationOptions {
  @override
  final String bookingId;
  @override
  final int bookingVersion;
  @override
  final DateTime cutoffAt;
  @override
  final bool canCancel;
  @override
  final CustomerBookingCancellationOptionsUnavailableReasonEnum?
  unavailableReason;
  @override
  final CustomerBookingCancellationOptionsSupportActionEnum? supportAction;

  factory _$CustomerBookingCancellationOptions([
    void Function(CustomerBookingCancellationOptionsBuilder)? updates,
  ]) => (CustomerBookingCancellationOptionsBuilder()..update(updates))._build();

  _$CustomerBookingCancellationOptions._({
    required this.bookingId,
    required this.bookingVersion,
    required this.cutoffAt,
    required this.canCancel,
    this.unavailableReason,
    this.supportAction,
  }) : super._();
  @override
  CustomerBookingCancellationOptions rebuild(
    void Function(CustomerBookingCancellationOptionsBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerBookingCancellationOptionsBuilder toBuilder() =>
      CustomerBookingCancellationOptionsBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerBookingCancellationOptions &&
        bookingId == other.bookingId &&
        bookingVersion == other.bookingVersion &&
        cutoffAt == other.cutoffAt &&
        canCancel == other.canCancel &&
        unavailableReason == other.unavailableReason &&
        supportAction == other.supportAction;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, bookingId.hashCode);
    _$hash = $jc(_$hash, bookingVersion.hashCode);
    _$hash = $jc(_$hash, cutoffAt.hashCode);
    _$hash = $jc(_$hash, canCancel.hashCode);
    _$hash = $jc(_$hash, unavailableReason.hashCode);
    _$hash = $jc(_$hash, supportAction.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerBookingCancellationOptions')
          ..add('bookingId', bookingId)
          ..add('bookingVersion', bookingVersion)
          ..add('cutoffAt', cutoffAt)
          ..add('canCancel', canCancel)
          ..add('unavailableReason', unavailableReason)
          ..add('supportAction', supportAction))
        .toString();
  }
}

class CustomerBookingCancellationOptionsBuilder
    implements
        Builder<
          CustomerBookingCancellationOptions,
          CustomerBookingCancellationOptionsBuilder
        > {
  _$CustomerBookingCancellationOptions? _$v;

  String? _bookingId;
  String? get bookingId => _$this._bookingId;
  set bookingId(String? bookingId) => _$this._bookingId = bookingId;

  int? _bookingVersion;
  int? get bookingVersion => _$this._bookingVersion;
  set bookingVersion(int? bookingVersion) =>
      _$this._bookingVersion = bookingVersion;

  DateTime? _cutoffAt;
  DateTime? get cutoffAt => _$this._cutoffAt;
  set cutoffAt(DateTime? cutoffAt) => _$this._cutoffAt = cutoffAt;

  bool? _canCancel;
  bool? get canCancel => _$this._canCancel;
  set canCancel(bool? canCancel) => _$this._canCancel = canCancel;

  CustomerBookingCancellationOptionsUnavailableReasonEnum? _unavailableReason;
  CustomerBookingCancellationOptionsUnavailableReasonEnum?
  get unavailableReason => _$this._unavailableReason;
  set unavailableReason(
    CustomerBookingCancellationOptionsUnavailableReasonEnum? unavailableReason,
  ) => _$this._unavailableReason = unavailableReason;

  CustomerBookingCancellationOptionsSupportActionEnum? _supportAction;
  CustomerBookingCancellationOptionsSupportActionEnum? get supportAction =>
      _$this._supportAction;
  set supportAction(
    CustomerBookingCancellationOptionsSupportActionEnum? supportAction,
  ) => _$this._supportAction = supportAction;

  CustomerBookingCancellationOptionsBuilder() {
    CustomerBookingCancellationOptions._defaults(this);
  }

  CustomerBookingCancellationOptionsBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _bookingId = $v.bookingId;
      _bookingVersion = $v.bookingVersion;
      _cutoffAt = $v.cutoffAt;
      _canCancel = $v.canCancel;
      _unavailableReason = $v.unavailableReason;
      _supportAction = $v.supportAction;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerBookingCancellationOptions other) {
    _$v = other as _$CustomerBookingCancellationOptions;
  }

  @override
  void update(
    void Function(CustomerBookingCancellationOptionsBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  CustomerBookingCancellationOptions build() => _build();

  _$CustomerBookingCancellationOptions _build() {
    final _$result =
        _$v ??
        _$CustomerBookingCancellationOptions._(
          bookingId: BuiltValueNullFieldError.checkNotNull(
            bookingId,
            r'CustomerBookingCancellationOptions',
            'bookingId',
          ),
          bookingVersion: BuiltValueNullFieldError.checkNotNull(
            bookingVersion,
            r'CustomerBookingCancellationOptions',
            'bookingVersion',
          ),
          cutoffAt: BuiltValueNullFieldError.checkNotNull(
            cutoffAt,
            r'CustomerBookingCancellationOptions',
            'cutoffAt',
          ),
          canCancel: BuiltValueNullFieldError.checkNotNull(
            canCancel,
            r'CustomerBookingCancellationOptions',
            'canCancel',
          ),
          unavailableReason: unavailableReason,
          supportAction: supportAction,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
