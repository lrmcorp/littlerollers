//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'reschedule_request_command.g.dart';

/// RescheduleRequestCommand
///
/// Properties:
/// * [bookingId] 
/// * [targetClassSlotId] 
/// * [reasonCode] 
/// * [expectedBookingVersion] 
@BuiltValue()
abstract class RescheduleRequestCommand implements Built<RescheduleRequestCommand, RescheduleRequestCommandBuilder> {
  @BuiltValueField(wireName: r'bookingId')
  String get bookingId;

  @BuiltValueField(wireName: r'targetClassSlotId')
  String get targetClassSlotId;

  @BuiltValueField(wireName: r'reasonCode')
  RescheduleRequestCommandReasonCodeEnum get reasonCode;
  // enum reasonCodeEnum {  CUSTOMER_SCHEDULE_CONFLICT,  WRONG_CLASS_SELECTED,  PERSONAL_UNAVAILABLE,  };

  @BuiltValueField(wireName: r'expectedBookingVersion')
  int get expectedBookingVersion;

  RescheduleRequestCommand._();

  factory RescheduleRequestCommand([void updates(RescheduleRequestCommandBuilder b)]) = _$RescheduleRequestCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RescheduleRequestCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RescheduleRequestCommand> get serializer => _$RescheduleRequestCommandSerializer();
}

class _$RescheduleRequestCommandSerializer implements PrimitiveSerializer<RescheduleRequestCommand> {
  @override
  final Iterable<Type> types = const [RescheduleRequestCommand, _$RescheduleRequestCommand];

  @override
  final String wireName = r'RescheduleRequestCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RescheduleRequestCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'bookingId';
    yield serializers.serialize(
      object.bookingId,
      specifiedType: const FullType(String),
    );
    yield r'targetClassSlotId';
    yield serializers.serialize(
      object.targetClassSlotId,
      specifiedType: const FullType(String),
    );
    yield r'reasonCode';
    yield serializers.serialize(
      object.reasonCode,
      specifiedType: const FullType(RescheduleRequestCommandReasonCodeEnum),
    );
    yield r'expectedBookingVersion';
    yield serializers.serialize(
      object.expectedBookingVersion,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    RescheduleRequestCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RescheduleRequestCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'bookingId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.bookingId = valueDes;
          break;
        case r'targetClassSlotId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.targetClassSlotId = valueDes;
          break;
        case r'reasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(RescheduleRequestCommandReasonCodeEnum),
          ) as RescheduleRequestCommandReasonCodeEnum;
          result.reasonCode = valueDes;
          break;
        case r'expectedBookingVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedBookingVersion = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  RescheduleRequestCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RescheduleRequestCommandBuilder();
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

class RescheduleRequestCommandReasonCodeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'CUSTOMER_SCHEDULE_CONFLICT')
  static const RescheduleRequestCommandReasonCodeEnum CUSTOMER_SCHEDULE_CONFLICT = _$rescheduleRequestCommandReasonCodeEnum_CUSTOMER_SCHEDULE_CONFLICT;
  @BuiltValueEnumConst(wireName: r'WRONG_CLASS_SELECTED')
  static const RescheduleRequestCommandReasonCodeEnum WRONG_CLASS_SELECTED = _$rescheduleRequestCommandReasonCodeEnum_WRONG_CLASS_SELECTED;
  @BuiltValueEnumConst(wireName: r'PERSONAL_UNAVAILABLE')
  static const RescheduleRequestCommandReasonCodeEnum PERSONAL_UNAVAILABLE = _$rescheduleRequestCommandReasonCodeEnum_PERSONAL_UNAVAILABLE;

  static Serializer<RescheduleRequestCommandReasonCodeEnum> get serializer => _$rescheduleRequestCommandReasonCodeEnumSerializer;

  const RescheduleRequestCommandReasonCodeEnum._(String name): super(name);

  static BuiltSet<RescheduleRequestCommandReasonCodeEnum> get values => _$rescheduleRequestCommandReasonCodeEnumValues;
  static RescheduleRequestCommandReasonCodeEnum valueOf(String name) => _$rescheduleRequestCommandReasonCodeEnumValueOf(name);
}

