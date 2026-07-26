//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'payment_account_command.g.dart';

/// PaymentAccountCommand
///
/// Properties:
/// * [branchId] 
/// * [bankCode] 
/// * [bankName] 
/// * [accountNumber] 
/// * [accountHolderName] 
/// * [paymentWindowHours] 
/// * [reason] 
@BuiltValue()
abstract class PaymentAccountCommand implements Built<PaymentAccountCommand, PaymentAccountCommandBuilder> {
  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'bankCode')
  String get bankCode;

  @BuiltValueField(wireName: r'bankName')
  String get bankName;

  @BuiltValueField(wireName: r'accountNumber')
  String get accountNumber;

  @BuiltValueField(wireName: r'accountHolderName')
  String get accountHolderName;

  @BuiltValueField(wireName: r'paymentWindowHours')
  int get paymentWindowHours;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  PaymentAccountCommand._();

  factory PaymentAccountCommand([void updates(PaymentAccountCommandBuilder b)]) = _$PaymentAccountCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PaymentAccountCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PaymentAccountCommand> get serializer => _$PaymentAccountCommandSerializer();
}

class _$PaymentAccountCommandSerializer implements PrimitiveSerializer<PaymentAccountCommand> {
  @override
  final Iterable<Type> types = const [PaymentAccountCommand, _$PaymentAccountCommand];

  @override
  final String wireName = r'PaymentAccountCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PaymentAccountCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'bankCode';
    yield serializers.serialize(
      object.bankCode,
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
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PaymentAccountCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PaymentAccountCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'bankCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.bankCode = valueDes;
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
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PaymentAccountCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PaymentAccountCommandBuilder();
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

