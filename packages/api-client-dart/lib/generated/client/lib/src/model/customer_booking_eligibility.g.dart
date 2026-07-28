// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_booking_eligibility.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CustomerBookingEligibilityReasonCodeEnum
_$customerBookingEligibilityReasonCodeEnum_IDENTITY_VERIFICATION_REQUIRED =
    const CustomerBookingEligibilityReasonCodeEnum._(
      'IDENTITY_VERIFICATION_REQUIRED',
    );
const CustomerBookingEligibilityReasonCodeEnum
_$customerBookingEligibilityReasonCodeEnum_MATCHING_PACKAGE_REQUIRED =
    const CustomerBookingEligibilityReasonCodeEnum._(
      'MATCHING_PACKAGE_REQUIRED',
    );
const CustomerBookingEligibilityReasonCodeEnum
_$customerBookingEligibilityReasonCodeEnum_INSUFFICIENT_AVAILABLE_SESSION =
    const CustomerBookingEligibilityReasonCodeEnum._(
      'INSUFFICIENT_AVAILABLE_SESSION',
    );
const CustomerBookingEligibilityReasonCodeEnum
_$customerBookingEligibilityReasonCodeEnum_SLOT_FULL =
    const CustomerBookingEligibilityReasonCodeEnum._('SLOT_FULL');
const CustomerBookingEligibilityReasonCodeEnum
_$customerBookingEligibilityReasonCodeEnum_SLOT_UNAVAILABLE =
    const CustomerBookingEligibilityReasonCodeEnum._('SLOT_UNAVAILABLE');
const CustomerBookingEligibilityReasonCodeEnum
_$customerBookingEligibilityReasonCodeEnum_BOOKING_CUTOFF_PASSED =
    const CustomerBookingEligibilityReasonCodeEnum._('BOOKING_CUTOFF_PASSED');

CustomerBookingEligibilityReasonCodeEnum
_$customerBookingEligibilityReasonCodeEnumValueOf(String name) {
  switch (name) {
    case 'IDENTITY_VERIFICATION_REQUIRED':
      return _$customerBookingEligibilityReasonCodeEnum_IDENTITY_VERIFICATION_REQUIRED;
    case 'MATCHING_PACKAGE_REQUIRED':
      return _$customerBookingEligibilityReasonCodeEnum_MATCHING_PACKAGE_REQUIRED;
    case 'INSUFFICIENT_AVAILABLE_SESSION':
      return _$customerBookingEligibilityReasonCodeEnum_INSUFFICIENT_AVAILABLE_SESSION;
    case 'SLOT_FULL':
      return _$customerBookingEligibilityReasonCodeEnum_SLOT_FULL;
    case 'SLOT_UNAVAILABLE':
      return _$customerBookingEligibilityReasonCodeEnum_SLOT_UNAVAILABLE;
    case 'BOOKING_CUTOFF_PASSED':
      return _$customerBookingEligibilityReasonCodeEnum_BOOKING_CUTOFF_PASSED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CustomerBookingEligibilityReasonCodeEnum>
_$customerBookingEligibilityReasonCodeEnumValues =
    BuiltSet<CustomerBookingEligibilityReasonCodeEnum>(const <
      CustomerBookingEligibilityReasonCodeEnum
    >[
      _$customerBookingEligibilityReasonCodeEnum_IDENTITY_VERIFICATION_REQUIRED,
      _$customerBookingEligibilityReasonCodeEnum_MATCHING_PACKAGE_REQUIRED,
      _$customerBookingEligibilityReasonCodeEnum_INSUFFICIENT_AVAILABLE_SESSION,
      _$customerBookingEligibilityReasonCodeEnum_SLOT_FULL,
      _$customerBookingEligibilityReasonCodeEnum_SLOT_UNAVAILABLE,
      _$customerBookingEligibilityReasonCodeEnum_BOOKING_CUTOFF_PASSED,
    ]);

const CustomerBookingEligibilityRequiredActionEnum
_$customerBookingEligibilityRequiredActionEnum_COMPLETE_IDENTITY_VERIFICATION =
    const CustomerBookingEligibilityRequiredActionEnum._(
      'COMPLETE_IDENTITY_VERIFICATION',
    );
const CustomerBookingEligibilityRequiredActionEnum
_$customerBookingEligibilityRequiredActionEnum_BUY_MATCHING_PACKAGE =
    const CustomerBookingEligibilityRequiredActionEnum._(
      'BUY_MATCHING_PACKAGE',
    );
const CustomerBookingEligibilityRequiredActionEnum
_$customerBookingEligibilityRequiredActionEnum_CONTACT_STUDIO =
    const CustomerBookingEligibilityRequiredActionEnum._('CONTACT_STUDIO');

CustomerBookingEligibilityRequiredActionEnum
_$customerBookingEligibilityRequiredActionEnumValueOf(String name) {
  switch (name) {
    case 'COMPLETE_IDENTITY_VERIFICATION':
      return _$customerBookingEligibilityRequiredActionEnum_COMPLETE_IDENTITY_VERIFICATION;
    case 'BUY_MATCHING_PACKAGE':
      return _$customerBookingEligibilityRequiredActionEnum_BUY_MATCHING_PACKAGE;
    case 'CONTACT_STUDIO':
      return _$customerBookingEligibilityRequiredActionEnum_CONTACT_STUDIO;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CustomerBookingEligibilityRequiredActionEnum>
_$customerBookingEligibilityRequiredActionEnumValues =
    BuiltSet<CustomerBookingEligibilityRequiredActionEnum>(const <
      CustomerBookingEligibilityRequiredActionEnum
    >[
      _$customerBookingEligibilityRequiredActionEnum_COMPLETE_IDENTITY_VERIFICATION,
      _$customerBookingEligibilityRequiredActionEnum_BUY_MATCHING_PACKAGE,
      _$customerBookingEligibilityRequiredActionEnum_CONTACT_STUDIO,
    ]);

Serializer<CustomerBookingEligibilityReasonCodeEnum>
_$customerBookingEligibilityReasonCodeEnumSerializer =
    _$CustomerBookingEligibilityReasonCodeEnumSerializer();
Serializer<CustomerBookingEligibilityRequiredActionEnum>
_$customerBookingEligibilityRequiredActionEnumSerializer =
    _$CustomerBookingEligibilityRequiredActionEnumSerializer();

class _$CustomerBookingEligibilityReasonCodeEnumSerializer
    implements PrimitiveSerializer<CustomerBookingEligibilityReasonCodeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'IDENTITY_VERIFICATION_REQUIRED': 'IDENTITY_VERIFICATION_REQUIRED',
    'MATCHING_PACKAGE_REQUIRED': 'MATCHING_PACKAGE_REQUIRED',
    'INSUFFICIENT_AVAILABLE_SESSION': 'INSUFFICIENT_AVAILABLE_SESSION',
    'SLOT_FULL': 'SLOT_FULL',
    'SLOT_UNAVAILABLE': 'SLOT_UNAVAILABLE',
    'BOOKING_CUTOFF_PASSED': 'BOOKING_CUTOFF_PASSED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'IDENTITY_VERIFICATION_REQUIRED': 'IDENTITY_VERIFICATION_REQUIRED',
    'MATCHING_PACKAGE_REQUIRED': 'MATCHING_PACKAGE_REQUIRED',
    'INSUFFICIENT_AVAILABLE_SESSION': 'INSUFFICIENT_AVAILABLE_SESSION',
    'SLOT_FULL': 'SLOT_FULL',
    'SLOT_UNAVAILABLE': 'SLOT_UNAVAILABLE',
    'BOOKING_CUTOFF_PASSED': 'BOOKING_CUTOFF_PASSED',
  };

  @override
  final Iterable<Type> types = const <Type>[
    CustomerBookingEligibilityReasonCodeEnum,
  ];
  @override
  final String wireName = 'CustomerBookingEligibilityReasonCodeEnum';

  @override
  Object serialize(
    Serializers serializers,
    CustomerBookingEligibilityReasonCodeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CustomerBookingEligibilityReasonCodeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CustomerBookingEligibilityReasonCodeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CustomerBookingEligibilityRequiredActionEnumSerializer
    implements
        PrimitiveSerializer<CustomerBookingEligibilityRequiredActionEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'COMPLETE_IDENTITY_VERIFICATION': 'COMPLETE_IDENTITY_VERIFICATION',
    'BUY_MATCHING_PACKAGE': 'BUY_MATCHING_PACKAGE',
    'CONTACT_STUDIO': 'CONTACT_STUDIO',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'COMPLETE_IDENTITY_VERIFICATION': 'COMPLETE_IDENTITY_VERIFICATION',
    'BUY_MATCHING_PACKAGE': 'BUY_MATCHING_PACKAGE',
    'CONTACT_STUDIO': 'CONTACT_STUDIO',
  };

  @override
  final Iterable<Type> types = const <Type>[
    CustomerBookingEligibilityRequiredActionEnum,
  ];
  @override
  final String wireName = 'CustomerBookingEligibilityRequiredActionEnum';

  @override
  Object serialize(
    Serializers serializers,
    CustomerBookingEligibilityRequiredActionEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CustomerBookingEligibilityRequiredActionEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CustomerBookingEligibilityRequiredActionEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CustomerBookingEligibility extends CustomerBookingEligibility {
  @override
  final bool canBook;
  @override
  final CustomerBookingEligibilityReasonCodeEnum? reasonCode;
  @override
  final CustomerBookingEligibilityRequiredActionEnum? requiredAction;
  @override
  final DateTime cutoffAt;

  factory _$CustomerBookingEligibility([
    void Function(CustomerBookingEligibilityBuilder)? updates,
  ]) => (CustomerBookingEligibilityBuilder()..update(updates))._build();

  _$CustomerBookingEligibility._({
    required this.canBook,
    this.reasonCode,
    this.requiredAction,
    required this.cutoffAt,
  }) : super._();
  @override
  CustomerBookingEligibility rebuild(
    void Function(CustomerBookingEligibilityBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerBookingEligibilityBuilder toBuilder() =>
      CustomerBookingEligibilityBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerBookingEligibility &&
        canBook == other.canBook &&
        reasonCode == other.reasonCode &&
        requiredAction == other.requiredAction &&
        cutoffAt == other.cutoffAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, canBook.hashCode);
    _$hash = $jc(_$hash, reasonCode.hashCode);
    _$hash = $jc(_$hash, requiredAction.hashCode);
    _$hash = $jc(_$hash, cutoffAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerBookingEligibility')
          ..add('canBook', canBook)
          ..add('reasonCode', reasonCode)
          ..add('requiredAction', requiredAction)
          ..add('cutoffAt', cutoffAt))
        .toString();
  }
}

class CustomerBookingEligibilityBuilder
    implements
        Builder<CustomerBookingEligibility, CustomerBookingEligibilityBuilder> {
  _$CustomerBookingEligibility? _$v;

  bool? _canBook;
  bool? get canBook => _$this._canBook;
  set canBook(bool? canBook) => _$this._canBook = canBook;

  CustomerBookingEligibilityReasonCodeEnum? _reasonCode;
  CustomerBookingEligibilityReasonCodeEnum? get reasonCode =>
      _$this._reasonCode;
  set reasonCode(CustomerBookingEligibilityReasonCodeEnum? reasonCode) =>
      _$this._reasonCode = reasonCode;

  CustomerBookingEligibilityRequiredActionEnum? _requiredAction;
  CustomerBookingEligibilityRequiredActionEnum? get requiredAction =>
      _$this._requiredAction;
  set requiredAction(
    CustomerBookingEligibilityRequiredActionEnum? requiredAction,
  ) => _$this._requiredAction = requiredAction;

  DateTime? _cutoffAt;
  DateTime? get cutoffAt => _$this._cutoffAt;
  set cutoffAt(DateTime? cutoffAt) => _$this._cutoffAt = cutoffAt;

  CustomerBookingEligibilityBuilder() {
    CustomerBookingEligibility._defaults(this);
  }

  CustomerBookingEligibilityBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _canBook = $v.canBook;
      _reasonCode = $v.reasonCode;
      _requiredAction = $v.requiredAction;
      _cutoffAt = $v.cutoffAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerBookingEligibility other) {
    _$v = other as _$CustomerBookingEligibility;
  }

  @override
  void update(void Function(CustomerBookingEligibilityBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerBookingEligibility build() => _build();

  _$CustomerBookingEligibility _build() {
    final _$result =
        _$v ??
        _$CustomerBookingEligibility._(
          canBook: BuiltValueNullFieldError.checkNotNull(
            canBook,
            r'CustomerBookingEligibility',
            'canBook',
          ),
          reasonCode: reasonCode,
          requiredAction: requiredAction,
          cutoffAt: BuiltValueNullFieldError.checkNotNull(
            cutoffAt,
            r'CustomerBookingEligibility',
            'cutoffAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
