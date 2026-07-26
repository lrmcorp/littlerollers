//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/checkout_options_payment_account.dart';
import 'package:openapi/src/model/checkout_options_package.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'checkout_options.g.dart';

/// CheckoutOptions
///
/// Properties:
/// * [package] 
/// * [paymentAccount] 
@BuiltValue()
abstract class CheckoutOptions implements Built<CheckoutOptions, CheckoutOptionsBuilder> {
  @BuiltValueField(wireName: r'package')
  CheckoutOptionsPackage get package;

  @BuiltValueField(wireName: r'paymentAccount')
  CheckoutOptionsPaymentAccount get paymentAccount;

  CheckoutOptions._();

  factory CheckoutOptions([void updates(CheckoutOptionsBuilder b)]) = _$CheckoutOptions;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CheckoutOptionsBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CheckoutOptions> get serializer => _$CheckoutOptionsSerializer();
}

class _$CheckoutOptionsSerializer implements PrimitiveSerializer<CheckoutOptions> {
  @override
  final Iterable<Type> types = const [CheckoutOptions, _$CheckoutOptions];

  @override
  final String wireName = r'CheckoutOptions';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CheckoutOptions object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'package';
    yield serializers.serialize(
      object.package,
      specifiedType: const FullType(CheckoutOptionsPackage),
    );
    yield r'paymentAccount';
    yield serializers.serialize(
      object.paymentAccount,
      specifiedType: const FullType(CheckoutOptionsPaymentAccount),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CheckoutOptions object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CheckoutOptionsBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'package':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CheckoutOptionsPackage),
          ) as CheckoutOptionsPackage;
          result.package.replace(valueDes);
          break;
        case r'paymentAccount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CheckoutOptionsPaymentAccount),
          ) as CheckoutOptionsPaymentAccount;
          result.paymentAccount.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CheckoutOptions deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CheckoutOptionsBuilder();
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

