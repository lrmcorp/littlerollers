//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'recovery_verify_command_new_verified_identity.g.dart';

/// RecoveryVerifyCommandNewVerifiedIdentity
///
/// Properties:
/// * [provider] 
/// * [providerToken] 
@BuiltValue()
abstract class RecoveryVerifyCommandNewVerifiedIdentity implements Built<RecoveryVerifyCommandNewVerifiedIdentity, RecoveryVerifyCommandNewVerifiedIdentityBuilder> {
  @BuiltValueField(wireName: r'provider')
  String? get provider;

  @BuiltValueField(wireName: r'providerToken')
  String? get providerToken;

  RecoveryVerifyCommandNewVerifiedIdentity._();

  factory RecoveryVerifyCommandNewVerifiedIdentity([void updates(RecoveryVerifyCommandNewVerifiedIdentityBuilder b)]) = _$RecoveryVerifyCommandNewVerifiedIdentity;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RecoveryVerifyCommandNewVerifiedIdentityBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RecoveryVerifyCommandNewVerifiedIdentity> get serializer => _$RecoveryVerifyCommandNewVerifiedIdentitySerializer();
}

class _$RecoveryVerifyCommandNewVerifiedIdentitySerializer implements PrimitiveSerializer<RecoveryVerifyCommandNewVerifiedIdentity> {
  @override
  final Iterable<Type> types = const [RecoveryVerifyCommandNewVerifiedIdentity, _$RecoveryVerifyCommandNewVerifiedIdentity];

  @override
  final String wireName = r'RecoveryVerifyCommandNewVerifiedIdentity';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RecoveryVerifyCommandNewVerifiedIdentity object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.provider != null) {
      yield r'provider';
      yield serializers.serialize(
        object.provider,
        specifiedType: const FullType(String),
      );
    }
    if (object.providerToken != null) {
      yield r'providerToken';
      yield serializers.serialize(
        object.providerToken,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    RecoveryVerifyCommandNewVerifiedIdentity object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RecoveryVerifyCommandNewVerifiedIdentityBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'provider':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.provider = valueDes;
          break;
        case r'providerToken':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.providerToken = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  RecoveryVerifyCommandNewVerifiedIdentity deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RecoveryVerifyCommandNewVerifiedIdentityBuilder();
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

