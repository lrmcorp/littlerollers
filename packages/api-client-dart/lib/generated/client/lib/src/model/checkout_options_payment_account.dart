//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'checkout_options_payment_account.g.dart';

/// CheckoutOptionsPaymentAccount
///
/// Properties:
/// * [id] 
/// * [bankName] 
/// * [accountNumber] 
/// * [accountHolderName] 
/// * [paymentWindowHours] 
@BuiltValue()
abstract class CheckoutOptionsPaymentAccount implements Built<CheckoutOptionsPaymentAccount, CheckoutOptionsPaymentAccountBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'bankName')
  String get bankName;

  @BuiltValueField(wireName: r'accountNumber')
  String get accountNumber;

  @BuiltValueField(wireName: r'accountHolderName')
  String get accountHolderName;

  @BuiltValueField(wireName: r'paymentWindowHours')
  int get paymentWindowHours;

  CheckoutOptionsPaymentAccount._();

  factory CheckoutOptionsPaymentAccount([void updates(CheckoutOptionsPaymentAccountBuilder b)]) = _$CheckoutOptionsPaymentAccount;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CheckoutOptionsPaymentAccountBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CheckoutOptionsPaymentAccount> get serializer => _$CheckoutOptionsPaymentAccountSerializer();
}

class _$CheckoutOptionsPaymentAccountSerializer implements PrimitiveSerializer<CheckoutOptionsPaymentAccount> {
  @override
  final Iterable<Type> types = const [CheckoutOptionsPaymentAccount, _$CheckoutOptionsPaymentAccount];

  @override
  final String wireName = r'CheckoutOptionsPaymentAccount';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CheckoutOptionsPaymentAccount object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'bankName';
    yield serializers.serialize(
      object.bankName,
      specifiedType: const FullType(String),
    );
    yield r'accountNumber';
    yield serializers.serialize(
      object.accountNumber,
      specifiedType: const FullType(String),
    );
    yield r'accountHolderName';
    yield serializers.serialize(
      object.accountHolderName,
      specifiedType: const FullType(String),
    );
    yield r'paymentWindowHours';
    yield serializers.serialize(
      object.paymentWindowHours,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CheckoutOptionsPaymentAccount object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CheckoutOptionsPaymentAccountBuilder result,
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
        case r'paymentWindowHours':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.paymentWindowHours = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CheckoutOptionsPaymentAccount deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CheckoutOptionsPaymentAccountBuilder();
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

