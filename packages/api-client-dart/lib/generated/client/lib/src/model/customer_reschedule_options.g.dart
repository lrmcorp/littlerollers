// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_reschedule_options.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CustomerRescheduleOptionsUnavailableReasonEnum
_$customerRescheduleOptionsUnavailableReasonEnum_NO_ELIGIBLE_TARGET =
    const CustomerRescheduleOptionsUnavailableReasonEnum._(
      'NO_ELIGIBLE_TARGET',
    );
const CustomerRescheduleOptionsUnavailableReasonEnum
_$customerRescheduleOptionsUnavailableReasonEnum_RESCHEDULE_PENDING =
    const CustomerRescheduleOptionsUnavailableReasonEnum._(
      'RESCHEDULE_PENDING',
    );
const CustomerRescheduleOptionsUnavailableReasonEnum
_$customerRescheduleOptionsUnavailableReasonEnum_BOOKING_NOT_ACTIVE =
    const CustomerRescheduleOptionsUnavailableReasonEnum._(
      'BOOKING_NOT_ACTIVE',
    );
const CustomerRescheduleOptionsUnavailableReasonEnum
_$customerRescheduleOptionsUnavailableReasonEnum_RESCHEDULE_CUTOFF_PASSED =
    const CustomerRescheduleOptionsUnavailableReasonEnum._(
      'RESCHEDULE_CUTOFF_PASSED',
    );
const CustomerRescheduleOptionsUnavailableReasonEnum
_$customerRescheduleOptionsUnavailableReasonEnum_PACKAGE_INELIGIBLE =
    const CustomerRescheduleOptionsUnavailableReasonEnum._(
      'PACKAGE_INELIGIBLE',
    );

CustomerRescheduleOptionsUnavailableReasonEnum
_$customerRescheduleOptionsUnavailableReasonEnumValueOf(String name) {
  switch (name) {
    case 'NO_ELIGIBLE_TARGET':
      return _$customerRescheduleOptionsUnavailableReasonEnum_NO_ELIGIBLE_TARGET;
    case 'RESCHEDULE_PENDING':
      return _$customerRescheduleOptionsUnavailableReasonEnum_RESCHEDULE_PENDING;
    case 'BOOKING_NOT_ACTIVE':
      return _$customerRescheduleOptionsUnavailableReasonEnum_BOOKING_NOT_ACTIVE;
    case 'RESCHEDULE_CUTOFF_PASSED':
      return _$customerRescheduleOptionsUnavailableReasonEnum_RESCHEDULE_CUTOFF_PASSED;
    case 'PACKAGE_INELIGIBLE':
      return _$customerRescheduleOptionsUnavailableReasonEnum_PACKAGE_INELIGIBLE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CustomerRescheduleOptionsUnavailableReasonEnum>
_$customerRescheduleOptionsUnavailableReasonEnumValues =
    BuiltSet<CustomerRescheduleOptionsUnavailableReasonEnum>(const <
      CustomerRescheduleOptionsUnavailableReasonEnum
    >[
      _$customerRescheduleOptionsUnavailableReasonEnum_NO_ELIGIBLE_TARGET,
      _$customerRescheduleOptionsUnavailableReasonEnum_RESCHEDULE_PENDING,
      _$customerRescheduleOptionsUnavailableReasonEnum_BOOKING_NOT_ACTIVE,
      _$customerRescheduleOptionsUnavailableReasonEnum_RESCHEDULE_CUTOFF_PASSED,
      _$customerRescheduleOptionsUnavailableReasonEnum_PACKAGE_INELIGIBLE,
    ]);

const CustomerRescheduleOptionsSupportActionEnum
_$customerRescheduleOptionsSupportActionEnum_CONTACT_STUDIO =
    const CustomerRescheduleOptionsSupportActionEnum._('CONTACT_STUDIO');

CustomerRescheduleOptionsSupportActionEnum
_$customerRescheduleOptionsSupportActionEnumValueOf(String name) {
  switch (name) {
    case 'CONTACT_STUDIO':
      return _$customerRescheduleOptionsSupportActionEnum_CONTACT_STUDIO;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CustomerRescheduleOptionsSupportActionEnum>
_$customerRescheduleOptionsSupportActionEnumValues =
    BuiltSet<CustomerRescheduleOptionsSupportActionEnum>(
      const <CustomerRescheduleOptionsSupportActionEnum>[
        _$customerRescheduleOptionsSupportActionEnum_CONTACT_STUDIO,
      ],
    );

Serializer<CustomerRescheduleOptionsUnavailableReasonEnum>
_$customerRescheduleOptionsUnavailableReasonEnumSerializer =
    _$CustomerRescheduleOptionsUnavailableReasonEnumSerializer();
Serializer<CustomerRescheduleOptionsSupportActionEnum>
_$customerRescheduleOptionsSupportActionEnumSerializer =
    _$CustomerRescheduleOptionsSupportActionEnumSerializer();

class _$CustomerRescheduleOptionsUnavailableReasonEnumSerializer
    implements
        PrimitiveSerializer<CustomerRescheduleOptionsUnavailableReasonEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'NO_ELIGIBLE_TARGET': 'NO_ELIGIBLE_TARGET',
    'RESCHEDULE_PENDING': 'RESCHEDULE_PENDING',
    'BOOKING_NOT_ACTIVE': 'BOOKING_NOT_ACTIVE',
    'RESCHEDULE_CUTOFF_PASSED': 'RESCHEDULE_CUTOFF_PASSED',
    'PACKAGE_INELIGIBLE': 'PACKAGE_INELIGIBLE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'NO_ELIGIBLE_TARGET': 'NO_ELIGIBLE_TARGET',
    'RESCHEDULE_PENDING': 'RESCHEDULE_PENDING',
    'BOOKING_NOT_ACTIVE': 'BOOKING_NOT_ACTIVE',
    'RESCHEDULE_CUTOFF_PASSED': 'RESCHEDULE_CUTOFF_PASSED',
    'PACKAGE_INELIGIBLE': 'PACKAGE_INELIGIBLE',
  };

  @override
  final Iterable<Type> types = const <Type>[
    CustomerRescheduleOptionsUnavailableReasonEnum,
  ];
  @override
  final String wireName = 'CustomerRescheduleOptionsUnavailableReasonEnum';

  @override
  Object serialize(
    Serializers serializers,
    CustomerRescheduleOptionsUnavailableReasonEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CustomerRescheduleOptionsUnavailableReasonEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CustomerRescheduleOptionsUnavailableReasonEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CustomerRescheduleOptionsSupportActionEnumSerializer
    implements PrimitiveSerializer<CustomerRescheduleOptionsSupportActionEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'CONTACT_STUDIO': 'CONTACT_STUDIO',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'CONTACT_STUDIO': 'CONTACT_STUDIO',
  };

  @override
  final Iterable<Type> types = const <Type>[
    CustomerRescheduleOptionsSupportActionEnum,
  ];
  @override
  final String wireName = 'CustomerRescheduleOptionsSupportActionEnum';

  @override
  Object serialize(
    Serializers serializers,
    CustomerRescheduleOptionsSupportActionEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CustomerRescheduleOptionsSupportActionEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CustomerRescheduleOptionsSupportActionEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CustomerRescheduleOptions extends CustomerRescheduleOptions {
  @override
  final String bookingId;
  @override
  final int bookingVersion;
  @override
  final String sourceClassSlotId;
  @override
  final DateTime cutoffAt;
  @override
  final bool canRequest;
  @override
  final CustomerRescheduleOptionsUnavailableReasonEnum? unavailableReason;
  @override
  final CustomerRescheduleOptionsSupportActionEnum? supportAction;
  @override
  final CustomerRescheduleSlot source_;
  @override
  final Reschedule? latestRequest;
  @override
  final BuiltList<CustomerRescheduleTarget> targets;

  factory _$CustomerRescheduleOptions([
    void Function(CustomerRescheduleOptionsBuilder)? updates,
  ]) => (CustomerRescheduleOptionsBuilder()..update(updates))._build();

  _$CustomerRescheduleOptions._({
    required this.bookingId,
    required this.bookingVersion,
    required this.sourceClassSlotId,
    required this.cutoffAt,
    required this.canRequest,
    this.unavailableReason,
    this.supportAction,
    required this.source_,
    this.latestRequest,
    required this.targets,
  }) : super._();
  @override
  CustomerRescheduleOptions rebuild(
    void Function(CustomerRescheduleOptionsBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerRescheduleOptionsBuilder toBuilder() =>
      CustomerRescheduleOptionsBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerRescheduleOptions &&
        bookingId == other.bookingId &&
        bookingVersion == other.bookingVersion &&
        sourceClassSlotId == other.sourceClassSlotId &&
        cutoffAt == other.cutoffAt &&
        canRequest == other.canRequest &&
        unavailableReason == other.unavailableReason &&
        supportAction == other.supportAction &&
        source_ == other.source_ &&
        latestRequest == other.latestRequest &&
        targets == other.targets;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, bookingId.hashCode);
    _$hash = $jc(_$hash, bookingVersion.hashCode);
    _$hash = $jc(_$hash, sourceClassSlotId.hashCode);
    _$hash = $jc(_$hash, cutoffAt.hashCode);
    _$hash = $jc(_$hash, canRequest.hashCode);
    _$hash = $jc(_$hash, unavailableReason.hashCode);
    _$hash = $jc(_$hash, supportAction.hashCode);
    _$hash = $jc(_$hash, source_.hashCode);
    _$hash = $jc(_$hash, latestRequest.hashCode);
    _$hash = $jc(_$hash, targets.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerRescheduleOptions')
          ..add('bookingId', bookingId)
          ..add('bookingVersion', bookingVersion)
          ..add('sourceClassSlotId', sourceClassSlotId)
          ..add('cutoffAt', cutoffAt)
          ..add('canRequest', canRequest)
          ..add('unavailableReason', unavailableReason)
          ..add('supportAction', supportAction)
          ..add('source_', source_)
          ..add('latestRequest', latestRequest)
          ..add('targets', targets))
        .toString();
  }
}

class CustomerRescheduleOptionsBuilder
    implements
        Builder<CustomerRescheduleOptions, CustomerRescheduleOptionsBuilder> {
  _$CustomerRescheduleOptions? _$v;

  String? _bookingId;
  String? get bookingId => _$this._bookingId;
  set bookingId(String? bookingId) => _$this._bookingId = bookingId;

  int? _bookingVersion;
  int? get bookingVersion => _$this._bookingVersion;
  set bookingVersion(int? bookingVersion) =>
      _$this._bookingVersion = bookingVersion;

  String? _sourceClassSlotId;
  String? get sourceClassSlotId => _$this._sourceClassSlotId;
  set sourceClassSlotId(String? sourceClassSlotId) =>
      _$this._sourceClassSlotId = sourceClassSlotId;

  DateTime? _cutoffAt;
  DateTime? get cutoffAt => _$this._cutoffAt;
  set cutoffAt(DateTime? cutoffAt) => _$this._cutoffAt = cutoffAt;

  bool? _canRequest;
  bool? get canRequest => _$this._canRequest;
  set canRequest(bool? canRequest) => _$this._canRequest = canRequest;

  CustomerRescheduleOptionsUnavailableReasonEnum? _unavailableReason;
  CustomerRescheduleOptionsUnavailableReasonEnum? get unavailableReason =>
      _$this._unavailableReason;
  set unavailableReason(
    CustomerRescheduleOptionsUnavailableReasonEnum? unavailableReason,
  ) => _$this._unavailableReason = unavailableReason;

  CustomerRescheduleOptionsSupportActionEnum? _supportAction;
  CustomerRescheduleOptionsSupportActionEnum? get supportAction =>
      _$this._supportAction;
  set supportAction(
    CustomerRescheduleOptionsSupportActionEnum? supportAction,
  ) => _$this._supportAction = supportAction;

  CustomerRescheduleSlot? _source_;
  CustomerRescheduleSlot? get source_ => _$this._source_;
  set source_(CustomerRescheduleSlot? source_) => _$this._source_ = source_;

  RescheduleBuilder? _latestRequest;
  RescheduleBuilder get latestRequest =>
      _$this._latestRequest ??= RescheduleBuilder();
  set latestRequest(RescheduleBuilder? latestRequest) =>
      _$this._latestRequest = latestRequest;

  ListBuilder<CustomerRescheduleTarget>? _targets;
  ListBuilder<CustomerRescheduleTarget> get targets =>
      _$this._targets ??= ListBuilder<CustomerRescheduleTarget>();
  set targets(ListBuilder<CustomerRescheduleTarget>? targets) =>
      _$this._targets = targets;

  CustomerRescheduleOptionsBuilder() {
    CustomerRescheduleOptions._defaults(this);
  }

  CustomerRescheduleOptionsBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _bookingId = $v.bookingId;
      _bookingVersion = $v.bookingVersion;
      _sourceClassSlotId = $v.sourceClassSlotId;
      _cutoffAt = $v.cutoffAt;
      _canRequest = $v.canRequest;
      _unavailableReason = $v.unavailableReason;
      _supportAction = $v.supportAction;
      _source_ = $v.source_;
      _latestRequest = $v.latestRequest?.toBuilder();
      _targets = $v.targets.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerRescheduleOptions other) {
    _$v = other as _$CustomerRescheduleOptions;
  }

  @override
  void update(void Function(CustomerRescheduleOptionsBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerRescheduleOptions build() => _build();

  _$CustomerRescheduleOptions _build() {
    _$CustomerRescheduleOptions _$result;
    try {
      _$result =
          _$v ??
          _$CustomerRescheduleOptions._(
            bookingId: BuiltValueNullFieldError.checkNotNull(
              bookingId,
              r'CustomerRescheduleOptions',
              'bookingId',
            ),
            bookingVersion: BuiltValueNullFieldError.checkNotNull(
              bookingVersion,
              r'CustomerRescheduleOptions',
              'bookingVersion',
            ),
            sourceClassSlotId: BuiltValueNullFieldError.checkNotNull(
              sourceClassSlotId,
              r'CustomerRescheduleOptions',
              'sourceClassSlotId',
            ),
            cutoffAt: BuiltValueNullFieldError.checkNotNull(
              cutoffAt,
              r'CustomerRescheduleOptions',
              'cutoffAt',
            ),
            canRequest: BuiltValueNullFieldError.checkNotNull(
              canRequest,
              r'CustomerRescheduleOptions',
              'canRequest',
            ),
            unavailableReason: unavailableReason,
            supportAction: supportAction,
            source_: BuiltValueNullFieldError.checkNotNull(
              source_,
              r'CustomerRescheduleOptions',
              'source_',
            ),
            latestRequest: _latestRequest?.build(),
            targets: targets.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'latestRequest';
        _latestRequest?.build();
        _$failedField = 'targets';
        targets.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'CustomerRescheduleOptions',
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
