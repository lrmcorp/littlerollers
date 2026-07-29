//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'payment_account.g.dart';

/// Masked master view. Encrypted and full account numbers are excluded.
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [bankCode] 
/// * [bankName] 
/// * [maskedAccountNumber] 
/// * [accountHolderName] 
/// * [paymentWindowHours] 
/// * [active] 
/// * [version] 
@BuiltValue(instantiable: false)
abstract class PaymentAccount  {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'bankCode')
  String get bankCode;

  @BuiltValueField(wireName: r'bankName')
  String get bankName;

  @BuiltValueField(wireName: r'maskedAccountNumber')
  String get maskedAccountNumber;

  @BuiltValueField(wireName: r'accountHolderName')
  String get accountHolderName;

  @BuiltValueField(wireName: r'paymentWindowHours')
  int get paymentWindowHours;

  @BuiltValueField(wireName: r'active')
  bool get active;

  @BuiltValueField(wireName: r'version')
  int get version;

  @BuiltValueSerializer(custom: true)
  static Serializer<PaymentAccount> get serializer => _$PaymentAccountSerializer();
}

class _$PaymentAccountSerializer implements PrimitiveSerializer<PaymentAccount> {
  @override
  final Iterable<Type> types = const [PaymentAccount];

  @override
  final String wireName = r'PaymentAccount';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PaymentAccount object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
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
    yield r'maskedAccountNumber';
    yield serializers.serialize(
      object.maskedAccountNumber,
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
    yield r'active';
    yield serializers.serialize(
      object.active,
      specifiedType: const FullType(bool),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PaymentAccount object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  @override
  PaymentAccount deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.deserialize(serialized, specifiedType: FullType($PaymentAccount)) as $PaymentAccount;
  }
}

/// a concrete implementation of [PaymentAccount], since [PaymentAccount] is not instantiable
@BuiltValue(instantiable: true)
abstract class $PaymentAccount implements PaymentAccount, Built<$PaymentAccount, $PaymentAccountBuilder> {
  $PaymentAccount._();

  factory $PaymentAccount([void Function($PaymentAccountBuilder)? updates]) = _$$PaymentAccount;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults($PaymentAccountBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<$PaymentAccount> get serializer => _$$PaymentAccountSerializer();
}

class _$$PaymentAccountSerializer implements PrimitiveSerializer<$PaymentAccount> {
  @override
  final Iterable<Type> types = const [$PaymentAccount, _$$PaymentAccount];

  @override
  final String wireName = r'$PaymentAccount';

  @override
  Object serialize(
    Serializers serializers,
    $PaymentAccount object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.serialize(object, specifiedType: FullType(PaymentAccount))!;
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PaymentAccountBuilder result,
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
        case r'maskedAccountNumber':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.maskedAccountNumber = valueDes;
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
        case r'active':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.active = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  $PaymentAccount deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = $PaymentAccountBuilder();
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

