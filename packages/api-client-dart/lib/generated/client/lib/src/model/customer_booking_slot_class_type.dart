//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_booking_slot_class_type.g.dart';

/// CustomerBookingSlotClassType
///
/// Properties:
/// * [id] 
/// * [code] 
/// * [name] 
@BuiltValue()
abstract class CustomerBookingSlotClassType implements Built<CustomerBookingSlotClassType, CustomerBookingSlotClassTypeBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'code')
  String get code;

  @BuiltValueField(wireName: r'name')
  String get name;

  CustomerBookingSlotClassType._();

  factory CustomerBookingSlotClassType([void updates(CustomerBookingSlotClassTypeBuilder b)]) = _$CustomerBookingSlotClassType;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerBookingSlotClassTypeBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerBookingSlotClassType> get serializer => _$CustomerBookingSlotClassTypeSerializer();
}

class _$CustomerBookingSlotClassTypeSerializer implements PrimitiveSerializer<CustomerBookingSlotClassType> {
  @override
  final Iterable<Type> types = const [CustomerBookingSlotClassType, _$CustomerBookingSlotClassType];

  @override
  final String wireName = r'CustomerBookingSlotClassType';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerBookingSlotClassType object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'code';
    yield serializers.serialize(
      object.code,
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
    CustomerBookingSlotClassType object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerBookingSlotClassTypeBuilder result,
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
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
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
  CustomerBookingSlotClassType deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerBookingSlotClassTypeBuilder();
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

