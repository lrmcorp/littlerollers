//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'session_adjustment_decision_command.g.dart';

/// SessionAdjustmentDecisionCommand
///
/// Properties:
/// * [reasonCode] 
/// * [note] 
/// * [expectedVersion] 
@BuiltValue()
abstract class SessionAdjustmentDecisionCommand implements Built<SessionAdjustmentDecisionCommand, SessionAdjustmentDecisionCommandBuilder> {
  @BuiltValueField(wireName: r'reasonCode')
  SessionAdjustmentDecisionCommandReasonCodeEnum get reasonCode;
  // enum reasonCodeEnum {  CORRECTION_VERIFIED,  INVALID_EVIDENCE,  DUPLICATE_REQUEST,  OUT_OF_SCOPE,  };

  @BuiltValueField(wireName: r'note')
  String? get note;

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  SessionAdjustmentDecisionCommand._();

  factory SessionAdjustmentDecisionCommand([void updates(SessionAdjustmentDecisionCommandBuilder b)]) = _$SessionAdjustmentDecisionCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SessionAdjustmentDecisionCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SessionAdjustmentDecisionCommand> get serializer => _$SessionAdjustmentDecisionCommandSerializer();
}

class _$SessionAdjustmentDecisionCommandSerializer implements PrimitiveSerializer<SessionAdjustmentDecisionCommand> {
  @override
  final Iterable<Type> types = const [SessionAdjustmentDecisionCommand, _$SessionAdjustmentDecisionCommand];

  @override
  final String wireName = r'SessionAdjustmentDecisionCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SessionAdjustmentDecisionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'reasonCode';
    yield serializers.serialize(
      object.reasonCode,
      specifiedType: const FullType(SessionAdjustmentDecisionCommandReasonCodeEnum),
    );
    if (object.note != null) {
      yield r'note';
      yield serializers.serialize(
        object.note,
        specifiedType: const FullType(String),
      );
    }
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SessionAdjustmentDecisionCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SessionAdjustmentDecisionCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'reasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(SessionAdjustmentDecisionCommandReasonCodeEnum),
          ) as SessionAdjustmentDecisionCommandReasonCodeEnum;
          result.reasonCode = valueDes;
          break;
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.note = valueDes;
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
  SessionAdjustmentDecisionCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SessionAdjustmentDecisionCommandBuilder();
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

class SessionAdjustmentDecisionCommandReasonCodeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'CORRECTION_VERIFIED')
  static const SessionAdjustmentDecisionCommandReasonCodeEnum CORRECTION_VERIFIED = _$sessionAdjustmentDecisionCommandReasonCodeEnum_CORRECTION_VERIFIED;
  @BuiltValueEnumConst(wireName: r'INVALID_EVIDENCE')
  static const SessionAdjustmentDecisionCommandReasonCodeEnum INVALID_EVIDENCE = _$sessionAdjustmentDecisionCommandReasonCodeEnum_INVALID_EVIDENCE;
  @BuiltValueEnumConst(wireName: r'DUPLICATE_REQUEST')
  static const SessionAdjustmentDecisionCommandReasonCodeEnum DUPLICATE_REQUEST = _$sessionAdjustmentDecisionCommandReasonCodeEnum_DUPLICATE_REQUEST;
  @BuiltValueEnumConst(wireName: r'OUT_OF_SCOPE')
  static const SessionAdjustmentDecisionCommandReasonCodeEnum OUT_OF_SCOPE = _$sessionAdjustmentDecisionCommandReasonCodeEnum_OUT_OF_SCOPE;

  static Serializer<SessionAdjustmentDecisionCommandReasonCodeEnum> get serializer => _$sessionAdjustmentDecisionCommandReasonCodeEnumSerializer;

  const SessionAdjustmentDecisionCommandReasonCodeEnum._(String name): super(name);

  static BuiltSet<SessionAdjustmentDecisionCommandReasonCodeEnum> get values => _$sessionAdjustmentDecisionCommandReasonCodeEnumValues;
  static SessionAdjustmentDecisionCommandReasonCodeEnum valueOf(String name) => _$sessionAdjustmentDecisionCommandReasonCodeEnumValueOf(name);
}

