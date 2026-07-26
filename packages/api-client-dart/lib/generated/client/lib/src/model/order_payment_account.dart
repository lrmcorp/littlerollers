//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'order_payment_account.g.dart';

/// OrderPaymentAccount
///
/// Properties:
/// * [bankName] 
/// * [accountNumber] 
/// * [accountHolderName] 
@BuiltValue()
abstract class OrderPaymentAccount implements Built<OrderPaymentAccount, OrderPaymentAccountBuilder> {
  @BuiltValueField(wireName: r'bankName')
  String? get bankName;

  @BuiltValueField(wireName: r'accountNumber')
  String? get accountNumber;

  @BuiltValueField(wireName: r'accountHolderName')
  String? get accountHolderName;

  OrderPaymentAccount._();

  factory OrderPaymentAccount([void updates(OrderPaymentAccountBuilder b)]) = _$OrderPaymentAccount;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OrderPaymentAccountBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OrderPaymentAccount> get serializer => _$OrderPaymentAccountSerializer();
}

class _$OrderPaymentAccountSerializer implements PrimitiveSerializer<OrderPaymentAccount> {
  @override
  final Iterable<Type> types = const [OrderPaymentAccount, _$OrderPaymentAccount];

  @override
  final String wireName = r'OrderPaymentAccount';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OrderPaymentAccount object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.bankName != null) {
      yield r'bankName';
      yield serializers.serialize(
        object.bankName,
        specifiedType: const FullType(String),
      );
    }
    if (object.accountNumber != null) {
      yield r'accountNumber';
      yield serializers.serialize(
        object.accountNumber,
        specifiedType: const FullType(String),
      );
    }
    if (object.accountHolderName != null) {
      yield r'accountHolderName';
      yield serializers.serialize(
        object.accountHolderName,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    OrderPaymentAccount object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OrderPaymentAccountBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'bankName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.bankName = valueDes;
          break;
        case r'accountNumber':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.accountNumber = valueDes;
          break;
        case r'accountHolderName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.accountHolderName = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  OrderPaymentAccount deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OrderPaymentAccountBuilder();
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

