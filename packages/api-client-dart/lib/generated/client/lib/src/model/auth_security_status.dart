//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'auth_security_status.g.dart';

/// AuthSecurityStatus
///
/// Properties:
/// * [passwordEnabled] 
/// * [passwordChangedAt] 
@BuiltValue()
abstract class AuthSecurityStatus implements Built<AuthSecurityStatus, AuthSecurityStatusBuilder> {
  @BuiltValueField(wireName: r'passwordEnabled')
  bool get passwordEnabled;

  @BuiltValueField(wireName: r'passwordChangedAt')
  DateTime? get passwordChangedAt;

  AuthSecurityStatus._();

  factory AuthSecurityStatus([void updates(AuthSecurityStatusBuilder b)]) = _$AuthSecurityStatus;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AuthSecurityStatusBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AuthSecurityStatus> get serializer => _$AuthSecurityStatusSerializer();
}

class _$AuthSecurityStatusSerializer implements PrimitiveSerializer<AuthSecurityStatus> {
  @override
  final Iterable<Type> types = const [AuthSecurityStatus, _$AuthSecurityStatus];

  @override
  final String wireName = r'AuthSecurityStatus';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AuthSecurityStatus object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'passwordEnabled';
    yield serializers.serialize(
      object.passwordEnabled,
      specifiedType: const FullType(bool),
    );
    yield r'passwordChangedAt';
    yield object.passwordChangedAt == null ? null : serializers.serialize(
      object.passwordChangedAt,
      specifiedType: const FullType.nullable(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AuthSecurityStatus object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AuthSecurityStatusBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'passwordEnabled':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.passwordEnabled = valueDes;
          break;
        case r'passwordChangedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.passwordChangedAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AuthSecurityStatus deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AuthSecurityStatusBuilder();
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

