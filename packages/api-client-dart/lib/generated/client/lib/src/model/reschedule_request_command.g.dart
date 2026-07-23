// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reschedule_request_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const RescheduleRequestCommandReasonCodeEnum
_$rescheduleRequestCommandReasonCodeEnum_CUSTOMER_SCHEDULE_CONFLICT =
    const RescheduleRequestCommandReasonCodeEnum._(
      'CUSTOMER_SCHEDULE_CONFLICT',
    );
const RescheduleRequestCommandReasonCodeEnum
_$rescheduleRequestCommandReasonCodeEnum_WRONG_CLASS_SELECTED =
    const RescheduleRequestCommandReasonCodeEnum._('WRONG_CLASS_SELECTED');
const RescheduleRequestCommandReasonCodeEnum
_$rescheduleRequestCommandReasonCodeEnum_PERSONAL_UNAVAILABLE =
    const RescheduleRequestCommandReasonCodeEnum._('PERSONAL_UNAVAILABLE');

RescheduleRequestCommandReasonCodeEnum
_$rescheduleRequestCommandReasonCodeEnumValueOf(String name) {
  switch (name) {
    case 'CUSTOMER_SCHEDULE_CONFLICT':
      return _$rescheduleRequestCommandReasonCodeEnum_CUSTOMER_SCHEDULE_CONFLICT;
    case 'WRONG_CLASS_SELECTED':
      return _$rescheduleRequestCommandReasonCodeEnum_WRONG_CLASS_SELECTED;
    case 'PERSONAL_UNAVAILABLE':
      return _$rescheduleRequestCommandReasonCodeEnum_PERSONAL_UNAVAILABLE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RescheduleRequestCommandReasonCodeEnum>
_$rescheduleRequestCommandReasonCodeEnumValues =
    BuiltSet<RescheduleRequestCommandReasonCodeEnum>(
      const <RescheduleRequestCommandReasonCodeEnum>[
        _$rescheduleRequestCommandReasonCodeEnum_CUSTOMER_SCHEDULE_CONFLICT,
        _$rescheduleRequestCommandReasonCodeEnum_WRONG_CLASS_SELECTED,
        _$rescheduleRequestCommandReasonCodeEnum_PERSONAL_UNAVAILABLE,
      ],
    );

Serializer<RescheduleRequestCommandReasonCodeEnum>
_$rescheduleRequestCommandReasonCodeEnumSerializer =
    _$RescheduleRequestCommandReasonCodeEnumSerializer();

class _$RescheduleRequestCommandReasonCodeEnumSerializer
    implements PrimitiveSerializer<RescheduleRequestCommandReasonCodeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'CUSTOMER_SCHEDULE_CONFLICT': 'CUSTOMER_SCHEDULE_CONFLICT',
    'WRONG_CLASS_SELECTED': 'WRONG_CLASS_SELECTED',
    'PERSONAL_UNAVAILABLE': 'PERSONAL_UNAVAILABLE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'CUSTOMER_SCHEDULE_CONFLICT': 'CUSTOMER_SCHEDULE_CONFLICT',
    'WRONG_CLASS_SELECTED': 'WRONG_CLASS_SELECTED',
    'PERSONAL_UNAVAILABLE': 'PERSONAL_UNAVAILABLE',
  };

  @override
  final Iterable<Type> types = const <Type>[
    RescheduleRequestCommandReasonCodeEnum,
  ];
  @override
  final String wireName = 'RescheduleRequestCommandReasonCodeEnum';

  @override
  Object serialize(
    Serializers serializers,
    RescheduleRequestCommandReasonCodeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  RescheduleRequestCommandReasonCodeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => RescheduleRequestCommandReasonCodeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$RescheduleRequestCommand extends RescheduleRequestCommand {
  @override
  final String bookingId;
  @override
  final String targetClassSlotId;
  @override
  final RescheduleRequestCommandReasonCodeEnum reasonCode;
  @override
  final int expectedBookingVersion;

  factory _$RescheduleRequestCommand([
    void Function(RescheduleRequestCommandBuilder)? updates,
  ]) => (RescheduleRequestCommandBuilder()..update(updates))._build();

  _$RescheduleRequestCommand._({
    required this.bookingId,
    required this.targetClassSlotId,
    required this.reasonCode,
    required this.expectedBookingVersion,
  }) : super._();
  @override
  RescheduleRequestCommand rebuild(
    void Function(RescheduleRequestCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  RescheduleRequestCommandBuilder toBuilder() =>
      RescheduleRequestCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RescheduleRequestCommand &&
        bookingId == other.bookingId &&
        targetClassSlotId == other.targetClassSlotId &&
        reasonCode == other.reasonCode &&
        expectedBookingVersion == other.expectedBookingVersion;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, bookingId.hashCode);
    _$hash = $jc(_$hash, targetClassSlotId.hashCode);
    _$hash = $jc(_$hash, reasonCode.hashCode);
    _$hash = $jc(_$hash, expectedBookingVersion.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RescheduleRequestCommand')
          ..add('bookingId', bookingId)
          ..add('targetClassSlotId', targetClassSlotId)
          ..add('reasonCode', reasonCode)
          ..add('expectedBookingVersion', expectedBookingVersion))
        .toString();
  }
}

class RescheduleRequestCommandBuilder
    implements
        Builder<RescheduleRequestCommand, RescheduleRequestCommandBuilder> {
  _$RescheduleRequestCommand? _$v;

  String? _bookingId;
  String? get bookingId => _$this._bookingId;
  set bookingId(String? bookingId) => _$this._bookingId = bookingId;

  String? _targetClassSlotId;
  String? get targetClassSlotId => _$this._targetClassSlotId;
  set targetClassSlotId(String? targetClassSlotId) =>
      _$this._targetClassSlotId = targetClassSlotId;

  RescheduleRequestCommandReasonCodeEnum? _reasonCode;
  RescheduleRequestCommandReasonCodeEnum? get reasonCode => _$this._reasonCode;
  set reasonCode(RescheduleRequestCommandReasonCodeEnum? reasonCode) =>
      _$this._reasonCode = reasonCode;

  int? _expectedBookingVersion;
  int? get expectedBookingVersion => _$this._expectedBookingVersion;
  set expectedBookingVersion(int? expectedBookingVersion) =>
      _$this._expectedBookingVersion = expectedBookingVersion;

  RescheduleRequestCommandBuilder() {
    RescheduleRequestCommand._defaults(this);
  }

  RescheduleRequestCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _bookingId = $v.bookingId;
      _targetClassSlotId = $v.targetClassSlotId;
      _reasonCode = $v.reasonCode;
      _expectedBookingVersion = $v.expectedBookingVersion;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RescheduleRequestCommand other) {
    _$v = other as _$RescheduleRequestCommand;
  }

  @override
  void update(void Function(RescheduleRequestCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RescheduleRequestCommand build() => _build();

  _$RescheduleRequestCommand _build() {
    final _$result =
        _$v ??
        _$RescheduleRequestCommand._(
          bookingId: BuiltValueNullFieldError.checkNotNull(
            bookingId,
            r'RescheduleRequestCommand',
            'bookingId',
          ),
          targetClassSlotId: BuiltValueNullFieldError.checkNotNull(
            targetClassSlotId,
            r'RescheduleRequestCommand',
            'targetClassSlotId',
          ),
          reasonCode: BuiltValueNullFieldError.checkNotNull(
            reasonCode,
            r'RescheduleRequestCommand',
            'reasonCode',
          ),
          expectedBookingVersion: BuiltValueNullFieldError.checkNotNull(
            expectedBookingVersion,
            r'RescheduleRequestCommand',
            'expectedBookingVersion',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
