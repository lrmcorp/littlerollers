//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'cancel_booking_command.g.dart';

/// CancelBookingCommand
///
/// Properties:
/// * [reasonCode] 
/// * [expectedVersion] 
@BuiltValue()
abstract class CancelBookingCommand implements Built<CancelBookingCommand, CancelBookingCommandBuilder> {
  @BuiltValueField(wireName: r'reasonCode')
  CancelBookingCommandReasonCodeEnum get reasonCode;
  // enum reasonCodeEnum {  PERSONAL_UNAVAILABLE,  CUSTOMER_SCHEDULE_CONFLICT,  WRONG_CLASS_SELECTED,  OTHER,  };

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  CancelBookingCommand._();

  factory CancelBookingCommand([void updates(CancelBookingCommandBuilder b)]) = _$CancelBookingCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CancelBookingCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CancelBookingCommand> get serializer => _$CancelBookingCommandSerializer();
}

class _$CancelBookingCommandSerializer implements PrimitiveSerializer<CancelBookingCommand> {
  @override
  final Iterable<Type> types = const [CancelBookingCommand, _$CancelBookingCommand];

  @override
  final String wireName = r'CancelBookingCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CancelBookingCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'reasonCode';
    yield serializers.serialize(
      object.reasonCode,
      specifiedType: const FullType(CancelBookingCommandReasonCodeEnum),
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
    CancelBookingCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CancelBookingCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'reasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CancelBookingCommandReasonCodeEnum),
          ) as CancelBookingCommandReasonCodeEnum;
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
  CancelBookingCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CancelBookingCommandBuilder();
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

class CancelBookingCommandReasonCodeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PERSONAL_UNAVAILABLE')
  static const CancelBookingCommandReasonCodeEnum PERSONAL_UNAVAILABLE = _$cancelBookingCommandReasonCodeEnum_PERSONAL_UNAVAILABLE;
  @BuiltValueEnumConst(wireName: r'CUSTOMER_SCHEDULE_CONFLICT')
  static const CancelBookingCommandReasonCodeEnum CUSTOMER_SCHEDULE_CONFLICT = _$cancelBookingCommandReasonCodeEnum_CUSTOMER_SCHEDULE_CONFLICT;
  @BuiltValueEnumConst(wireName: r'WRONG_CLASS_SELECTED')
  static const CancelBookingCommandReasonCodeEnum WRONG_CLASS_SELECTED = _$cancelBookingCommandReasonCodeEnum_WRONG_CLASS_SELECTED;
  @BuiltValueEnumConst(wireName: r'OTHER')
  static const CancelBookingCommandReasonCodeEnum OTHER = _$cancelBookingCommandReasonCodeEnum_OTHER;

  static Serializer<CancelBookingCommandReasonCodeEnum> get serializer => _$cancelBookingCommandReasonCodeEnumSerializer;

  const CancelBookingCommandReasonCodeEnum._(String name): super(name);

  static BuiltSet<CancelBookingCommandReasonCodeEnum> get values => _$cancelBookingCommandReasonCodeEnumValues;
  static CancelBookingCommandReasonCodeEnum valueOf(String name) => _$cancelBookingCommandReasonCodeEnumValueOf(name);
}

