// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cancel_booking_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CancelBookingCommandReasonCodeEnum
_$cancelBookingCommandReasonCodeEnum_PERSONAL_UNAVAILABLE =
    const CancelBookingCommandReasonCodeEnum._('PERSONAL_UNAVAILABLE');
const CancelBookingCommandReasonCodeEnum
_$cancelBookingCommandReasonCodeEnum_CUSTOMER_SCHEDULE_CONFLICT =
    const CancelBookingCommandReasonCodeEnum._('CUSTOMER_SCHEDULE_CONFLICT');
const CancelBookingCommandReasonCodeEnum
_$cancelBookingCommandReasonCodeEnum_WRONG_CLASS_SELECTED =
    const CancelBookingCommandReasonCodeEnum._('WRONG_CLASS_SELECTED');
const CancelBookingCommandReasonCodeEnum
_$cancelBookingCommandReasonCodeEnum_OTHER =
    const CancelBookingCommandReasonCodeEnum._('OTHER');

CancelBookingCommandReasonCodeEnum _$cancelBookingCommandReasonCodeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'PERSONAL_UNAVAILABLE':
      return _$cancelBookingCommandReasonCodeEnum_PERSONAL_UNAVAILABLE;
    case 'CUSTOMER_SCHEDULE_CONFLICT':
      return _$cancelBookingCommandReasonCodeEnum_CUSTOMER_SCHEDULE_CONFLICT;
    case 'WRONG_CLASS_SELECTED':
      return _$cancelBookingCommandReasonCodeEnum_WRONG_CLASS_SELECTED;
    case 'OTHER':
      return _$cancelBookingCommandReasonCodeEnum_OTHER;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CancelBookingCommandReasonCodeEnum>
_$cancelBookingCommandReasonCodeEnumValues =
    BuiltSet<CancelBookingCommandReasonCodeEnum>(
      const <CancelBookingCommandReasonCodeEnum>[
        _$cancelBookingCommandReasonCodeEnum_PERSONAL_UNAVAILABLE,
        _$cancelBookingCommandReasonCodeEnum_CUSTOMER_SCHEDULE_CONFLICT,
        _$cancelBookingCommandReasonCodeEnum_WRONG_CLASS_SELECTED,
        _$cancelBookingCommandReasonCodeEnum_OTHER,
      ],
    );

Serializer<CancelBookingCommandReasonCodeEnum>
_$cancelBookingCommandReasonCodeEnumSerializer =
    _$CancelBookingCommandReasonCodeEnumSerializer();

class _$CancelBookingCommandReasonCodeEnumSerializer
    implements PrimitiveSerializer<CancelBookingCommandReasonCodeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PERSONAL_UNAVAILABLE': 'PERSONAL_UNAVAILABLE',
    'CUSTOMER_SCHEDULE_CONFLICT': 'CUSTOMER_SCHEDULE_CONFLICT',
    'WRONG_CLASS_SELECTED': 'WRONG_CLASS_SELECTED',
    'OTHER': 'OTHER',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PERSONAL_UNAVAILABLE': 'PERSONAL_UNAVAILABLE',
    'CUSTOMER_SCHEDULE_CONFLICT': 'CUSTOMER_SCHEDULE_CONFLICT',
    'WRONG_CLASS_SELECTED': 'WRONG_CLASS_SELECTED',
    'OTHER': 'OTHER',
  };

  @override
  final Iterable<Type> types = const <Type>[CancelBookingCommandReasonCodeEnum];
  @override
  final String wireName = 'CancelBookingCommandReasonCodeEnum';

  @override
  Object serialize(
    Serializers serializers,
    CancelBookingCommandReasonCodeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CancelBookingCommandReasonCodeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CancelBookingCommandReasonCodeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CancelBookingCommand extends CancelBookingCommand {
  @override
  final CancelBookingCommandReasonCodeEnum reasonCode;
  @override
  final int expectedVersion;

  factory _$CancelBookingCommand([
    void Function(CancelBookingCommandBuilder)? updates,
  ]) => (CancelBookingCommandBuilder()..update(updates))._build();

  _$CancelBookingCommand._({
    required this.reasonCode,
    required this.expectedVersion,
  }) : super._();
  @override
  CancelBookingCommand rebuild(
    void Function(CancelBookingCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CancelBookingCommandBuilder toBuilder() =>
      CancelBookingCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CancelBookingCommand &&
        reasonCode == other.reasonCode &&
        expectedVersion == other.expectedVersion;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, reasonCode.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CancelBookingCommand')
          ..add('reasonCode', reasonCode)
          ..add('expectedVersion', expectedVersion))
        .toString();
  }
}

class CancelBookingCommandBuilder
    implements Builder<CancelBookingCommand, CancelBookingCommandBuilder> {
  _$CancelBookingCommand? _$v;

  CancelBookingCommandReasonCodeEnum? _reasonCode;
  CancelBookingCommandReasonCodeEnum? get reasonCode => _$this._reasonCode;
  set reasonCode(CancelBookingCommandReasonCodeEnum? reasonCode) =>
      _$this._reasonCode = reasonCode;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  CancelBookingCommandBuilder() {
    CancelBookingCommand._defaults(this);
  }

  CancelBookingCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _reasonCode = $v.reasonCode;
      _expectedVersion = $v.expectedVersion;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CancelBookingCommand other) {
    _$v = other as _$CancelBookingCommand;
  }

  @override
  void update(void Function(CancelBookingCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CancelBookingCommand build() => _build();

  _$CancelBookingCommand _build() {
    final _$result =
        _$v ??
        _$CancelBookingCommand._(
          reasonCode: BuiltValueNullFieldError.checkNotNull(
            reasonCode,
            r'CancelBookingCommand',
            'reasonCode',
          ),
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'CancelBookingCommand',
            'expectedVersion',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
