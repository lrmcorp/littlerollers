//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/booking_class_slot_class_type.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'booking_class_slot.g.dart';

/// BookingClassSlot
///
/// Properties:
/// * [id] 
/// * [startAt] 
/// * [endAt] 
/// * [timezone] 
/// * [status] 
/// * [classType] 
@BuiltValue()
abstract class BookingClassSlot implements Built<BookingClassSlot, BookingClassSlotBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'startAt')
  DateTime get startAt;

  @BuiltValueField(wireName: r'endAt')
  DateTime get endAt;

  @BuiltValueField(wireName: r'timezone')
  String get timezone;

  @BuiltValueField(wireName: r'status')
  String get status;

  @BuiltValueField(wireName: r'classType')
  BookingClassSlotClassType get classType;

  BookingClassSlot._();

  factory BookingClassSlot([void updates(BookingClassSlotBuilder b)]) = _$BookingClassSlot;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BookingClassSlotBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BookingClassSlot> get serializer => _$BookingClassSlotSerializer();
}

class _$BookingClassSlotSerializer implements PrimitiveSerializer<BookingClassSlot> {
  @override
  final Iterable<Type> types = const [BookingClassSlot, _$BookingClassSlot];

  @override
  final String wireName = r'BookingClassSlot';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BookingClassSlot object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'startAt';
    yield serializers.serialize(
      object.startAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'endAt';
    yield serializers.serialize(
      object.endAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'timezone';
    yield serializers.serialize(
      object.timezone,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(String),
    );
    yield r'classType';
    yield serializers.serialize(
      object.classType,
      specifiedType: const FullType(BookingClassSlotClassType),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    BookingClassSlot object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BookingClassSlotBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'startAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.startAt = valueDes;
          break;
        case r'endAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.endAt = valueDes;
          break;
        case r'timezone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.timezone = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.status = valueDes;
          break;
        case r'classType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BookingClassSlotClassType),
          ) as BookingClassSlotClassType;
          result.classType.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  BookingClassSlot deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BookingClassSlotBuilder();
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

