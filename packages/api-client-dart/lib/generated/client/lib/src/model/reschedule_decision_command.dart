//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'reschedule_decision_command.g.dart';

/// RescheduleDecisionCommand
///
/// Properties:
/// * [reasonCode] 
/// * [expectedVersion] 
@BuiltValue()
abstract class RescheduleDecisionCommand implements Built<RescheduleDecisionCommand, RescheduleDecisionCommandBuilder> {
  @BuiltValueField(wireName: r'reasonCode')
  RescheduleDecisionCommandReasonCodeEnum get reasonCode;
  // enum reasonCodeEnum {  ELIGIBILITY_VERIFIED,  TARGET_UNAVAILABLE,  OUTSIDE_POLICY,  OUT_OF_SCOPE,  };

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  RescheduleDecisionCommand._();

  factory RescheduleDecisionCommand([void updates(RescheduleDecisionCommandBuilder b)]) = _$RescheduleDecisionCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RescheduleDecisionCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RescheduleDecisionCommand> get serializer => _$RescheduleDecisionCommandSerializer();
}

class _$RescheduleDecisionCommandSerializer implements PrimitiveSerializer<RescheduleDecisionCommand> {
  @override
  final Iterable<Type> types = const [RescheduleDecisionCommand, _$RescheduleDecisionCommand];

  @override
  final String wireName = r'RescheduleDecisionCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RescheduleDecisionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'reasonCode';
    yield serializers.serialize(
      object.reasonCode,
      specifiedType: const FullType(RescheduleDecisionCommandReasonCodeEnum),
    );
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    RescheduleDecisionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RescheduleDecisionCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'reasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(RescheduleDecisionCommandReasonCodeEnum),
          ) as RescheduleDecisionCommandReasonCodeEnum;
          result.reasonCode = valueDes;
          break;
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  RescheduleDecisionCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RescheduleDecisionCommandBuilder();
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

class RescheduleDecisionCommandReasonCodeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ELIGIBILITY_VERIFIED')
  static const RescheduleDecisionCommandReasonCodeEnum ELIGIBILITY_VERIFIED = _$rescheduleDecisionCommandReasonCodeEnum_ELIGIBILITY_VERIFIED;
  @BuiltValueEnumConst(wireName: r'TARGET_UNAVAILABLE')
  static const RescheduleDecisionCommandReasonCodeEnum TARGET_UNAVAILABLE = _$rescheduleDecisionCommandReasonCodeEnum_TARGET_UNAVAILABLE;
  @BuiltValueEnumConst(wireName: r'OUTSIDE_POLICY')
  static const RescheduleDecisionCommandReasonCodeEnum OUTSIDE_POLICY = _$rescheduleDecisionCommandReasonCodeEnum_OUTSIDE_POLICY;
  @BuiltValueEnumConst(wireName: r'OUT_OF_SCOPE')
  static const RescheduleDecisionCommandReasonCodeEnum OUT_OF_SCOPE = _$rescheduleDecisionCommandReasonCodeEnum_OUT_OF_SCOPE;

  static Serializer<RescheduleDecisionCommandReasonCodeEnum> get serializer => _$rescheduleDecisionCommandReasonCodeEnumSerializer;

  const RescheduleDecisionCommandReasonCodeEnum._(String name): super(name);

  static BuiltSet<RescheduleDecisionCommandReasonCodeEnum> get values => _$rescheduleDecisionCommandReasonCodeEnumValues;
  static RescheduleDecisionCommandReasonCodeEnum valueOf(String name) => _$rescheduleDecisionCommandReasonCodeEnumValueOf(name);
}

