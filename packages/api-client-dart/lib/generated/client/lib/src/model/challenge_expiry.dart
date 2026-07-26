//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'challenge_expiry.g.dart';

/// ChallengeExpiry
///
/// Properties:
/// * [expiresAt] 
@BuiltValue()
abstract class ChallengeExpiry implements Built<ChallengeExpiry, ChallengeExpiryBuilder> {
  @BuiltValueField(wireName: r'expiresAt')
  DateTime get expiresAt;

  ChallengeExpiry._();

  factory ChallengeExpiry([void updates(ChallengeExpiryBuilder b)]) = _$ChallengeExpiry;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ChallengeExpiryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ChallengeExpiry> get serializer => _$ChallengeExpirySerializer();
}

class _$ChallengeExpirySerializer implements PrimitiveSerializer<ChallengeExpiry> {
  @override
  final Iterable<Type> types = const [ChallengeExpiry, _$ChallengeExpiry];

  @override
  final String wireName = r'ChallengeExpiry';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ChallengeExpiry object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'expiresAt';
    yield serializers.serialize(
      object.expiresAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ChallengeExpiry object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ChallengeExpiryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'expiresAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.expiresAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ChallengeExpiry deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ChallengeExpiryBuilder();
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

