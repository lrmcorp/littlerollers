//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'mfa_challenge_command.g.dart';

/// MfaChallengeCommand
///
/// Properties:
/// * [purpose] 
/// * [method] - DEC-012 provider/method discriminator
@BuiltValue()
abstract class MfaChallengeCommand implements Built<MfaChallengeCommand, MfaChallengeCommandBuilder> {
  @BuiltValueField(wireName: r'purpose')
  MfaChallengeCommandPurposeEnum get purpose;
  // enum purposeEnum {  SIGN_IN,  STEP_UP,  ENROLLMENT,  RECOVERY,  };

  /// DEC-012 provider/method discriminator
  @BuiltValueField(wireName: r'method')
  String? get method;

  MfaChallengeCommand._();

  factory MfaChallengeCommand([void updates(MfaChallengeCommandBuilder b)]) = _$MfaChallengeCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(MfaChallengeCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<MfaChallengeCommand> get serializer => _$MfaChallengeCommandSerializer();
}

class _$MfaChallengeCommandSerializer implements PrimitiveSerializer<MfaChallengeCommand> {
  @override
  final Iterable<Type> types = const [MfaChallengeCommand, _$MfaChallengeCommand];

  @override
  final String wireName = r'MfaChallengeCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    MfaChallengeCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'purpose';
    yield serializers.serialize(
      object.purpose,
      specifiedType: const FullType(MfaChallengeCommandPurposeEnum),
    );
    if (object.method != null) {
      yield r'method';
      yield serializers.serialize(
        object.method,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    MfaChallengeCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required MfaChallengeCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'purpose':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(MfaChallengeCommandPurposeEnum),
          ) as MfaChallengeCommandPurposeEnum;
          result.purpose = valueDes;
          break;
        case r'method':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.method = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  MfaChallengeCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = MfaChallengeCommandBuilder();
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

class MfaChallengeCommandPurposeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'SIGN_IN')
  static const MfaChallengeCommandPurposeEnum SIGN_IN = _$mfaChallengeCommandPurposeEnum_SIGN_IN;
  @BuiltValueEnumConst(wireName: r'STEP_UP')
  static const MfaChallengeCommandPurposeEnum STEP_UP = _$mfaChallengeCommandPurposeEnum_STEP_UP;
  @BuiltValueEnumConst(wireName: r'ENROLLMENT')
  static const MfaChallengeCommandPurposeEnum ENROLLMENT = _$mfaChallengeCommandPurposeEnum_ENROLLMENT;
  @BuiltValueEnumConst(wireName: r'RECOVERY')
  static const MfaChallengeCommandPurposeEnum RECOVERY = _$mfaChallengeCommandPurposeEnum_RECOVERY;

  static Serializer<MfaChallengeCommandPurposeEnum> get serializer => _$mfaChallengeCommandPurposeEnumSerializer;

  const MfaChallengeCommandPurposeEnum._(String name): super(name);

  static BuiltSet<MfaChallengeCommandPurposeEnum> get values => _$mfaChallengeCommandPurposeEnumValues;
  static MfaChallengeCommandPurposeEnum valueOf(String name) => _$mfaChallengeCommandPurposeEnumValueOf(name);
}

