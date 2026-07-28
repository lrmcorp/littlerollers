// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'access_reason_code.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const AccessReasonCode _$POLICY_UPDATE = const AccessReasonCode._(
  'POLICY_UPDATE',
);
const AccessReasonCode _$DUTY_CHANGE = const AccessReasonCode._('DUTY_CHANGE');
const AccessReasonCode _$SECURITY_HARDENING = const AccessReasonCode._(
  'SECURITY_HARDENING',
);
const AccessReasonCode _$ACCESS_CORRECTION = const AccessReasonCode._(
  'ACCESS_CORRECTION',
);
const AccessReasonCode _$TEMPORARY_DUTY = const AccessReasonCode._(
  'TEMPORARY_DUTY',
);
const AccessReasonCode _$ACCESS_EXCEPTION = const AccessReasonCode._(
  'ACCESS_EXCEPTION',
);
const AccessReasonCode _$SECURITY_RESTRICTION = const AccessReasonCode._(
  'SECURITY_RESTRICTION',
);
const AccessReasonCode _$ROLE_REPLACEMENT = const AccessReasonCode._(
  'ROLE_REPLACEMENT',
);

AccessReasonCode _$valueOf(String name) {
  switch (name) {
    case 'POLICY_UPDATE':
      return _$POLICY_UPDATE;
    case 'DUTY_CHANGE':
      return _$DUTY_CHANGE;
    case 'SECURITY_HARDENING':
      return _$SECURITY_HARDENING;
    case 'ACCESS_CORRECTION':
      return _$ACCESS_CORRECTION;
    case 'TEMPORARY_DUTY':
      return _$TEMPORARY_DUTY;
    case 'ACCESS_EXCEPTION':
      return _$ACCESS_EXCEPTION;
    case 'SECURITY_RESTRICTION':
      return _$SECURITY_RESTRICTION;
    case 'ROLE_REPLACEMENT':
      return _$ROLE_REPLACEMENT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<AccessReasonCode> _$values =
    BuiltSet<AccessReasonCode>(const <AccessReasonCode>[
      _$POLICY_UPDATE,
      _$DUTY_CHANGE,
      _$SECURITY_HARDENING,
      _$ACCESS_CORRECTION,
      _$TEMPORARY_DUTY,
      _$ACCESS_EXCEPTION,
      _$SECURITY_RESTRICTION,
      _$ROLE_REPLACEMENT,
    ]);

class _$AccessReasonCodeMeta {
  const _$AccessReasonCodeMeta();
  AccessReasonCode get POLICY_UPDATE => _$POLICY_UPDATE;
  AccessReasonCode get DUTY_CHANGE => _$DUTY_CHANGE;
  AccessReasonCode get SECURITY_HARDENING => _$SECURITY_HARDENING;
  AccessReasonCode get ACCESS_CORRECTION => _$ACCESS_CORRECTION;
  AccessReasonCode get TEMPORARY_DUTY => _$TEMPORARY_DUTY;
  AccessReasonCode get ACCESS_EXCEPTION => _$ACCESS_EXCEPTION;
  AccessReasonCode get SECURITY_RESTRICTION => _$SECURITY_RESTRICTION;
  AccessReasonCode get ROLE_REPLACEMENT => _$ROLE_REPLACEMENT;
  AccessReasonCode valueOf(String name) => _$valueOf(name);
  BuiltSet<AccessReasonCode> get values => _$values;
}

mixin _$AccessReasonCodeMixin {
  // ignore: non_constant_identifier_names
  _$AccessReasonCodeMeta get AccessReasonCode => const _$AccessReasonCodeMeta();
}

Serializer<AccessReasonCode> _$accessReasonCodeSerializer =
    _$AccessReasonCodeSerializer();

class _$AccessReasonCodeSerializer
    implements PrimitiveSerializer<AccessReasonCode> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'POLICY_UPDATE': 'POLICY_UPDATE',
    'DUTY_CHANGE': 'DUTY_CHANGE',
    'SECURITY_HARDENING': 'SECURITY_HARDENING',
    'ACCESS_CORRECTION': 'ACCESS_CORRECTION',
    'TEMPORARY_DUTY': 'TEMPORARY_DUTY',
    'ACCESS_EXCEPTION': 'ACCESS_EXCEPTION',
    'SECURITY_RESTRICTION': 'SECURITY_RESTRICTION',
    'ROLE_REPLACEMENT': 'ROLE_REPLACEMENT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'POLICY_UPDATE': 'POLICY_UPDATE',
    'DUTY_CHANGE': 'DUTY_CHANGE',
    'SECURITY_HARDENING': 'SECURITY_HARDENING',
    'ACCESS_CORRECTION': 'ACCESS_CORRECTION',
    'TEMPORARY_DUTY': 'TEMPORARY_DUTY',
    'ACCESS_EXCEPTION': 'ACCESS_EXCEPTION',
    'SECURITY_RESTRICTION': 'SECURITY_RESTRICTION',
    'ROLE_REPLACEMENT': 'ROLE_REPLACEMENT',
  };

  @override
  final Iterable<Type> types = const <Type>[AccessReasonCode];
  @override
  final String wireName = 'AccessReasonCode';

  @override
  Object serialize(
    Serializers serializers,
    AccessReasonCode object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  AccessReasonCode deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => AccessReasonCode.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
