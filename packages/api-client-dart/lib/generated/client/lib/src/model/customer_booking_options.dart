//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/customer_booking_slot.dart';
import 'package:openapi/src/model/customer_booking_package.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_booking_options.g.dart';

/// CustomerBookingOptions
///
/// Properties:
/// * [slot] 
/// * [packages] 
@BuiltValue()
abstract class CustomerBookingOptions implements Built<CustomerBookingOptions, CustomerBookingOptionsBuilder> {
  @BuiltValueField(wireName: r'slot')
  CustomerBookingSlot get slot;

  @BuiltValueField(wireName: r'packages')
  BuiltList<CustomerBookingPackage> get packages;

  CustomerBookingOptions._();

  factory CustomerBookingOptions([void updates(CustomerBookingOptionsBuilder b)]) = _$CustomerBookingOptions;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerBookingOptionsBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerBookingOptions> get serializer => _$CustomerBookingOptionsSerializer();
}

class _$CustomerBookingOptionsSerializer implements PrimitiveSerializer<CustomerBookingOptions> {
  @override
  final Iterable<Type> types = const [CustomerBookingOptions, _$CustomerBookingOptions];

  @override
  final String wireName = r'CustomerBookingOptions';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerBookingOptions object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'slot';
    yield serializers.serialize(
      object.slot,
      specifiedType: const FullType(CustomerBookingSlot),
    );
    yield r'packages';
    yield serializers.serialize(
      object.packages,
      specifiedType: const FullType(BuiltList, [FullType(CustomerBookingPackage)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerBookingOptions object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerBookingOptionsBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'slot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerBookingSlot),
          ) as CustomerBookingSlot;
          result.slot = valueDes;
          break;
        case r'packages':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(CustomerBookingPackage)]),
          ) as BuiltList<CustomerBookingPackage>;
          result.packages.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerBookingOptions deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerBookingOptionsBuilder();
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

