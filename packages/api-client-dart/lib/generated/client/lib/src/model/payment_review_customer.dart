//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'payment_review_customer.g.dart';

/// PaymentReviewCustomer
///
/// Properties:
/// * [id] 
/// * [displayName] 
/// * [phoneMasked] 
@BuiltValue()
abstract class PaymentReviewCustomer implements Built<PaymentReviewCustomer, PaymentReviewCustomerBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  @BuiltValueField(wireName: r'phoneMasked')
  String? get phoneMasked;

  PaymentReviewCustomer._();

  factory PaymentReviewCustomer([void updates(PaymentReviewCustomerBuilder b)]) = _$PaymentReviewCustomer;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PaymentReviewCustomerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PaymentReviewCustomer> get serializer => _$PaymentReviewCustomerSerializer();
}

class _$PaymentReviewCustomerSerializer implements PrimitiveSerializer<PaymentReviewCustomer> {
  @override
  final Iterable<Type> types = const [PaymentReviewCustomer, _$PaymentReviewCustomer];

  @override
  final String wireName = r'PaymentReviewCustomer';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PaymentReviewCustomer object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'displayName';
    yield serializers.serialize(
      object.displayName,
      specifiedType: const FullType(String),
    );
    yield r'phoneMasked';
    yield object.phoneMasked == null ? null : serializers.serialize(
      object.phoneMasked,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PaymentReviewCustomer object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PaymentReviewCustomerBuilder result,
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
        case r'displayName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.displayName = valueDes;
          break;
        case r'phoneMasked':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.phoneMasked = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PaymentReviewCustomer deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PaymentReviewCustomerBuilder();
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

