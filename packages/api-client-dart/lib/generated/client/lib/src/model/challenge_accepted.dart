//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'challenge_accepted.g.dart';

/// ChallengeAccepted
///
/// Properties:
/// * [requestId] 
/// * [expiresAt] 
@BuiltValue()
abstract class ChallengeAccepted implements Built<ChallengeAccepted, ChallengeAcceptedBuilder> {
  @BuiltValueField(wireName: r'requestId')
  String get requestId;

  @BuiltValueField(wireName: r'expiresAt')
  DateTime get expiresAt;

  ChallengeAccepted._();

  factory ChallengeAccepted([void updates(ChallengeAcceptedBuilder b)]) = _$ChallengeAccepted;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ChallengeAcceptedBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ChallengeAccepted> get serializer => _$ChallengeAcceptedSerializer();
}

class _$ChallengeAcceptedSerializer implements PrimitiveSerializer<ChallengeAccepted> {
  @override
  final Iterable<Type> types = const [ChallengeAccepted, _$ChallengeAccepted];

  @override
  final String wireName = r'ChallengeAccepted';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ChallengeAccepted object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'requestId';
    yield serializers.serialize(
      object.requestId,
      specifiedType: const FullType(String),
    );
    yield r'expiresAt';
    yield serializers.serialize(
      object.expiresAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ChallengeAccepted object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ChallengeAcceptedBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'requestId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.requestId = valueDes;
          break;
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
  ChallengeAccepted deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ChallengeAcceptedBuilder();
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

