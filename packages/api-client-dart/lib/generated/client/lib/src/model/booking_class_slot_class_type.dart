//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'booking_class_slot_class_type.g.dart';

/// BookingClassSlotClassType
///
/// Properties:
/// * [id] 
/// * [name] 
@BuiltValue()
abstract class BookingClassSlotClassType implements Built<BookingClassSlotClassType, BookingClassSlotClassTypeBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'name')
  String get name;

  BookingClassSlotClassType._();

  factory BookingClassSlotClassType([void updates(BookingClassSlotClassTypeBuilder b)]) = _$BookingClassSlotClassType;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BookingClassSlotClassTypeBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BookingClassSlotClassType> get serializer => _$BookingClassSlotClassTypeSerializer();
}

class _$BookingClassSlotClassTypeSerializer implements PrimitiveSerializer<BookingClassSlotClassType> {
  @override
  final Iterable<Type> types = const [BookingClassSlotClassType, _$BookingClassSlotClassType];

  @override
  final String wireName = r'BookingClassSlotClassType';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BookingClassSlotClassType object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    BookingClassSlotClassType object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BookingClassSlotClassTypeBuilder result,
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
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  BookingClassSlotClassType deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BookingClassSlotClassTypeBuilder();
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

