//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'access_reason_code.g.dart';

class AccessReasonCode extends EnumClass {

  @BuiltValueEnumConst(wireName: r'POLICY_UPDATE')
  static const AccessReasonCode POLICY_UPDATE = _$POLICY_UPDATE;
  @BuiltValueEnumConst(wireName: r'DUTY_CHANGE')
  static const AccessReasonCode DUTY_CHANGE = _$DUTY_CHANGE;
  @BuiltValueEnumConst(wireName: r'SECURITY_HARDENING')
  static const AccessReasonCode SECURITY_HARDENING = _$SECURITY_HARDENING;
  @BuiltValueEnumConst(wireName: r'ACCESS_CORRECTION')
  static const AccessReasonCode ACCESS_CORRECTION = _$ACCESS_CORRECTION;
  @BuiltValueEnumConst(wireName: r'TEMPORARY_DUTY')
  static const AccessReasonCode TEMPORARY_DUTY = _$TEMPORARY_DUTY;
  @BuiltValueEnumConst(wireName: r'ACCESS_EXCEPTION')
  static const AccessReasonCode ACCESS_EXCEPTION = _$ACCESS_EXCEPTION;
  @BuiltValueEnumConst(wireName: r'SECURITY_RESTRICTION')
  static const AccessReasonCode SECURITY_RESTRICTION = _$SECURITY_RESTRICTION;
  @BuiltValueEnumConst(wireName: r'ROLE_REPLACEMENT')
  static const AccessReasonCode ROLE_REPLACEMENT = _$ROLE_REPLACEMENT;

  static Serializer<AccessReasonCode> get serializer => _$accessReasonCodeSerializer;

  const AccessReasonCode._(String name): super(name);

  static BuiltSet<AccessReasonCode> get values => _$values;
  static AccessReasonCode valueOf(String name) => _$valueOf(name);
}

/// Optionally, enum_class can generate a mixin to go with your enum for use
/// with Angular. It exposes your enum constants as getters. So, if you mix it
/// in to your Dart component class, the values become available to the
/// corresponding Angular template.
///
/// Trigger mixin generation by writing a line like this one next to your enum.
abstract class AccessReasonCodeMixin = Object with _$AccessReasonCodeMixin;

