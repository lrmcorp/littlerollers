//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/access_reason_code.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'access_reason.g.dart';

/// AccessReason
///
/// Properties:
/// * [reasonCode] 
/// * [note] 
@BuiltValue(instantiable: false)
abstract class AccessReason  {
  @BuiltValueField(wireName: r'reasonCode')
  AccessReasonCode get reasonCode;
  // enum reasonCodeEnum {  POLICY_UPDATE,  DUTY_CHANGE,  SECURITY_HARDENING,  ACCESS_CORRECTION,  TEMPORARY_DUTY,  ACCESS_EXCEPTION,  SECURITY_RESTRICTION,  ROLE_REPLACEMENT,  };

  @BuiltValueField(wireName: r'note')
  String? get note;

  @BuiltValueSerializer(custom: true)
  static Serializer<AccessReason> get serializer => _$AccessReasonSerializer();
}

class _$AccessReasonSerializer implements PrimitiveSerializer<AccessReason> {
  @override
  final Iterable<Type> types = const [AccessReason];

  @override
  final String wireName = r'AccessReason';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AccessReason object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'reasonCode';
    yield serializers.serialize(
      object.reasonCode,
      specifiedType: const FullType(AccessReasonCode),
    );
    if (object.note != null) {
      yield r'note';
      yield serializers.serialize(
        object.note,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    AccessReason object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  @override
  AccessReason deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.deserialize(serialized, specifiedType: FullType($AccessReason)) as $AccessReason;
  }
}

/// a concrete implementation of [AccessReason], since [AccessReason] is not instantiable
@BuiltValue(instantiable: true)
abstract class $AccessReason implements AccessReason, Built<$AccessReason, $AccessReasonBuilder> {
  $AccessReason._();

  factory $AccessReason([void Function($AccessReasonBuilder)? updates]) = _$$AccessReason;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults($AccessReasonBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<$AccessReason> get serializer => _$$AccessReasonSerializer();
}

class _$$AccessReasonSerializer implements PrimitiveSerializer<$AccessReason> {
  @override
  final Iterable<Type> types = const [$AccessReason, _$$AccessReason];

  @override
  final String wireName = r'$AccessReason';

  @override
  Object serialize(
    Serializers serializers,
    $AccessReason object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.serialize(object, specifiedType: FullType(AccessReason))!;
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AccessReasonBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'reasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AccessReasonCode),
          ) as AccessReasonCode;
          result.reasonCode = valueDes;
          break;
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.note = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  $AccessReason deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = $AccessReasonBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}

