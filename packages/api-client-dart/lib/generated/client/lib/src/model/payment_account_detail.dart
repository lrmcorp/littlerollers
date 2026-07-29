//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/payment_account_detail_all_of_branch.dart';
import 'package:openapi/src/model/payment_account.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'payment_account_detail.g.dart';

/// PaymentAccountDetail
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
/// * [branch] 
/// * [purchaseCount] 
@BuiltValue()
abstract class PaymentAccountDetail implements PaymentAccount, Built<PaymentAccountDetail, PaymentAccountDetailBuilder> {
  @BuiltValueField(wireName: r'purchaseCount')
  int get purchaseCount;

  @BuiltValueField(wireName: r'branch')
  PaymentAccountDetailAllOfBranch get branch;

  PaymentAccountDetail._();

  factory PaymentAccountDetail([void updates(PaymentAccountDetailBuilder b)]) = _$PaymentAccountDetail;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PaymentAccountDetailBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PaymentAccountDetail> get serializer => _$PaymentAccountDetailSerializer();
}

class _$PaymentAccountDetailSerializer implements PrimitiveSerializer<PaymentAccountDetail> {
  @override
  final Iterable<Type> types = const [PaymentAccountDetail, _$PaymentAccountDetail];

  @override
  final String wireName = r'PaymentAccountDetail';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PaymentAccountDetail object, {
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
    yield r'purchaseCount';
    yield serializers.serialize(
      object.purchaseCount,
      specifiedType: const FullType(int),
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
    yield r'bankName';
    yield serializers.serialize(
      object.bankName,
      specifiedType: const FullType(String),
    );
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'branch';
    yield serializers.serialize(
      object.branch,
      specifiedType: const FullType(PaymentAccountDetailAllOfBranch),
    );
    yield r'accountHolderName';
    yield serializers.serialize(
      object.accountHolderName,
      specifiedType: const FullType(String),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
    yield r'maskedAccountNumber';
    yield serializers.serialize(
      object.maskedAccountNumber,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PaymentAccountDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PaymentAccountDetailBuilder result,
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
        case r'purchaseCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.purchaseCount = valueDes;
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
        case r'bankName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.bankName = valueDes;
          break;
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'branch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PaymentAccountDetailAllOfBranch),
          ) as PaymentAccountDetailAllOfBranch;
          result.branch.replace(valueDes);
          break;
        case r'accountHolderName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.accountHolderName = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        case r'maskedAccountNumber':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.maskedAccountNumber = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PaymentAccountDetail deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PaymentAccountDetailBuilder();
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

