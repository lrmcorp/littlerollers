// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reschedule_decision_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const RescheduleDecisionCommandReasonCodeEnum
_$rescheduleDecisionCommandReasonCodeEnum_ELIGIBILITY_VERIFIED =
    const RescheduleDecisionCommandReasonCodeEnum._('ELIGIBILITY_VERIFIED');
const RescheduleDecisionCommandReasonCodeEnum
_$rescheduleDecisionCommandReasonCodeEnum_TARGET_UNAVAILABLE =
    const RescheduleDecisionCommandReasonCodeEnum._('TARGET_UNAVAILABLE');
const RescheduleDecisionCommandReasonCodeEnum
_$rescheduleDecisionCommandReasonCodeEnum_OUTSIDE_POLICY =
    const RescheduleDecisionCommandReasonCodeEnum._('OUTSIDE_POLICY');
const RescheduleDecisionCommandReasonCodeEnum
_$rescheduleDecisionCommandReasonCodeEnum_OUT_OF_SCOPE =
    const RescheduleDecisionCommandReasonCodeEnum._('OUT_OF_SCOPE');

RescheduleDecisionCommandReasonCodeEnum
_$rescheduleDecisionCommandReasonCodeEnumValueOf(String name) {
  switch (name) {
    case 'ELIGIBILITY_VERIFIED':
      return _$rescheduleDecisionCommandReasonCodeEnum_ELIGIBILITY_VERIFIED;
    case 'TARGET_UNAVAILABLE':
      return _$rescheduleDecisionCommandReasonCodeEnum_TARGET_UNAVAILABLE;
    case 'OUTSIDE_POLICY':
      return _$rescheduleDecisionCommandReasonCodeEnum_OUTSIDE_POLICY;
    case 'OUT_OF_SCOPE':
      return _$rescheduleDecisionCommandReasonCodeEnum_OUT_OF_SCOPE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RescheduleDecisionCommandReasonCodeEnum>
_$rescheduleDecisionCommandReasonCodeEnumValues =
    BuiltSet<RescheduleDecisionCommandReasonCodeEnum>(
      const <RescheduleDecisionCommandReasonCodeEnum>[
        _$rescheduleDecisionCommandReasonCodeEnum_ELIGIBILITY_VERIFIED,
        _$rescheduleDecisionCommandReasonCodeEnum_TARGET_UNAVAILABLE,
        _$rescheduleDecisionCommandReasonCodeEnum_OUTSIDE_POLICY,
        _$rescheduleDecisionCommandReasonCodeEnum_OUT_OF_SCOPE,
      ],
    );

Serializer<RescheduleDecisionCommandReasonCodeEnum>
_$rescheduleDecisionCommandReasonCodeEnumSerializer =
    _$RescheduleDecisionCommandReasonCodeEnumSerializer();

class _$RescheduleDecisionCommandReasonCodeEnumSerializer
    implements PrimitiveSerializer<RescheduleDecisionCommandReasonCodeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ELIGIBILITY_VERIFIED': 'ELIGIBILITY_VERIFIED',
    'TARGET_UNAVAILABLE': 'TARGET_UNAVAILABLE',
    'OUTSIDE_POLICY': 'OUTSIDE_POLICY',
    'OUT_OF_SCOPE': 'OUT_OF_SCOPE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ELIGIBILITY_VERIFIED': 'ELIGIBILITY_VERIFIED',
    'TARGET_UNAVAILABLE': 'TARGET_UNAVAILABLE',
    'OUTSIDE_POLICY': 'OUTSIDE_POLICY',
    'OUT_OF_SCOPE': 'OUT_OF_SCOPE',
  };

  @override
  final Iterable<Type> types = const <Type>[
    RescheduleDecisionCommandReasonCodeEnum,
  ];
  @override
  final String wireName = 'RescheduleDecisionCommandReasonCodeEnum';

  @override
  Object serialize(
    Serializers serializers,
    RescheduleDecisionCommandReasonCodeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  RescheduleDecisionCommandReasonCodeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => RescheduleDecisionCommandReasonCodeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$RescheduleDecisionCommand extends RescheduleDecisionCommand {
  @override
  final RescheduleDecisionCommandReasonCodeEnum reasonCode;
  @override
  final int expectedVersion;

  factory _$RescheduleDecisionCommand([
    void Function(RescheduleDecisionCommandBuilder)? updates,
  ]) => (RescheduleDecisionCommandBuilder()..update(updates))._build();

  _$RescheduleDecisionCommand._({
    required this.reasonCode,
    required this.expectedVersion,
  }) : super._();
  @override
  RescheduleDecisionCommand rebuild(
    void Function(RescheduleDecisionCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  RescheduleDecisionCommandBuilder toBuilder() =>
      RescheduleDecisionCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RescheduleDecisionCommand &&
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
    return (newBuiltValueToStringHelper(r'RescheduleDecisionCommand')
          ..add('reasonCode', reasonCode)
          ..add('expectedVersion', expectedVersion))
        .toString();
  }
}

class RescheduleDecisionCommandBuilder
    implements
        Builder<RescheduleDecisionCommand, RescheduleDecisionCommandBuilder> {
  _$RescheduleDecisionCommand? _$v;

  RescheduleDecisionCommandReasonCodeEnum? _reasonCode;
  RescheduleDecisionCommandReasonCodeEnum? get reasonCode => _$this._reasonCode;
  set reasonCode(RescheduleDecisionCommandReasonCodeEnum? reasonCode) =>
      _$this._reasonCode = reasonCode;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  RescheduleDecisionCommandBuilder() {
    RescheduleDecisionCommand._defaults(this);
  }

  RescheduleDecisionCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _reasonCode = $v.reasonCode;
      _expectedVersion = $v.expectedVersion;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RescheduleDecisionCommand other) {
    _$v = other as _$RescheduleDecisionCommand;
  }

  @override
  void update(void Function(RescheduleDecisionCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RescheduleDecisionCommand build() => _build();

  _$RescheduleDecisionCommand _build() {
    final _$result =
        _$v ??
        _$RescheduleDecisionCommand._(
          reasonCode: BuiltValueNullFieldError.checkNotNull(
            reasonCode,
            r'RescheduleDecisionCommand',
            'reasonCode',
          ),
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'RescheduleDecisionCommand',
            'expectedVersion',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
