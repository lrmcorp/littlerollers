//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_booking_package.g.dart';

/// CustomerBookingPackage
///
/// Properties:
/// * [id] 
/// * [packageId] 
/// * [name] 
/// * [available] 
/// * [expiryAt] 
@BuiltValue()
abstract class CustomerBookingPackage implements Built<CustomerBookingPackage, CustomerBookingPackageBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'packageId')
  String get packageId;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'available')
  int get available;

  @BuiltValueField(wireName: r'expiryAt')
  DateTime get expiryAt;

  CustomerBookingPackage._();

  factory CustomerBookingPackage([void updates(CustomerBookingPackageBuilder b)]) = _$CustomerBookingPackage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerBookingPackageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerBookingPackage> get serializer => _$CustomerBookingPackageSerializer();
}

class _$CustomerBookingPackageSerializer implements PrimitiveSerializer<CustomerBookingPackage> {
  @override
  final Iterable<Type> types = const [CustomerBookingPackage, _$CustomerBookingPackage];

  @override
  final String wireName = r'CustomerBookingPackage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerBookingPackage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'packageId';
    yield serializers.serialize(
      object.packageId,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'available';
    yield serializers.serialize(
      object.available,
      specifiedType: const FullType(int),
    );
    yield r'expiryAt';
    yield serializers.serialize(
      object.expiryAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerBookingPackage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerBookingPackageBuilder result,
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
        case r'packageId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.packageId = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'available':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.available = valueDes;
          break;
        case r'expiryAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.expiryAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerBookingPackage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerBookingPackageBuilder();
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

