//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/payment_account.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'list_payment_accounts200_response.g.dart';

/// ListPaymentAccounts200Response
///
/// Properties:
/// * [items] 
@BuiltValue()
abstract class ListPaymentAccounts200Response implements Built<ListPaymentAccounts200Response, ListPaymentAccounts200ResponseBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<PaymentAccount> get items;

  ListPaymentAccounts200Response._();

  factory ListPaymentAccounts200Response([void updates(ListPaymentAccounts200ResponseBuilder b)]) = _$ListPaymentAccounts200Response;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ListPaymentAccounts200ResponseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ListPaymentAccounts200Response> get serializer => _$ListPaymentAccounts200ResponseSerializer();
}

class _$ListPaymentAccounts200ResponseSerializer implements PrimitiveSerializer<ListPaymentAccounts200Response> {
  @override
  final Iterable<Type> types = const [ListPaymentAccounts200Response, _$ListPaymentAccounts200Response];

  @override
  final String wireName = r'ListPaymentAccounts200Response';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ListPaymentAccounts200Response object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(PaymentAccount)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ListPaymentAccounts200Response object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ListPaymentAccounts200ResponseBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PaymentAccount)]),
          ) as BuiltList<PaymentAccount>;
          result.items.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ListPaymentAccounts200Response deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ListPaymentAccounts200ResponseBuilder();
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

