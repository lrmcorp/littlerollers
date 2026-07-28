//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/date.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'payment_activation_result.g.dart';

/// PaymentActivationResult
///
/// Properties:
/// * [customerPackageId] 
/// * [packageId] 
/// * [packageName] 
/// * [status] 
/// * [sessionCount] 
/// * [activationDate] 
/// * [expiryAt] 
/// * [ledgerEntryId] 
/// * [ledgerQuantity] 
/// * [ledgerOccurredAt] 
@BuiltValue()
abstract class PaymentActivationResult implements Built<PaymentActivationResult, PaymentActivationResultBuilder> {
  @BuiltValueField(wireName: r'customerPackageId')
  String get customerPackageId;

  @BuiltValueField(wireName: r'packageId')
  String get packageId;

  @BuiltValueField(wireName: r'packageName')
  String get packageName;

  @BuiltValueField(wireName: r'status')
  PaymentActivationResultStatusEnum get status;
  // enum statusEnum {  ACTIVE,  EXPIRED,  INACTIVE,  };

  @BuiltValueField(wireName: r'sessionCount')
  int get sessionCount;

  @BuiltValueField(wireName: r'activationDate')
  Date get activationDate;

  @BuiltValueField(wireName: r'expiryAt')
  DateTime get expiryAt;

  @BuiltValueField(wireName: r'ledgerEntryId')
  String? get ledgerEntryId;

  @BuiltValueField(wireName: r'ledgerQuantity')
  int? get ledgerQuantity;

  @BuiltValueField(wireName: r'ledgerOccurredAt')
  DateTime? get ledgerOccurredAt;

  PaymentActivationResult._();

  factory PaymentActivationResult([void updates(PaymentActivationResultBuilder b)]) = _$PaymentActivationResult;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PaymentActivationResultBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PaymentActivationResult> get serializer => _$PaymentActivationResultSerializer();
}

class _$PaymentActivationResultSerializer implements PrimitiveSerializer<PaymentActivationResult> {
  @override
  final Iterable<Type> types = const [PaymentActivationResult, _$PaymentActivationResult];

  @override
  final String wireName = r'PaymentActivationResult';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PaymentActivationResult object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'customerPackageId';
    yield serializers.serialize(
      object.customerPackageId,
      specifiedType: const FullType(String),
    );
    yield r'packageId';
    yield serializers.serialize(
      object.packageId,
      specifiedType: const FullType(String),
    );
    yield r'packageName';
    yield serializers.serialize(
      object.packageName,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(PaymentActivationResultStatusEnum),
    );
    yield r'sessionCount';
    yield serializers.serialize(
      object.sessionCount,
      specifiedType: const FullType(int),
    );
    yield r'activationDate';
    yield serializers.serialize(
      object.activationDate,
      specifiedType: const FullType(Date),
    );
    yield r'expiryAt';
    yield serializers.serialize(
      object.expiryAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'ledgerEntryId';
    yield object.ledgerEntryId == null ? null : serializers.serialize(
      object.ledgerEntryId,
      specifiedType: const FullType.nullable(String),
    );
    yield r'ledgerQuantity';
    yield object.ledgerQuantity == null ? null : serializers.serialize(
      object.ledgerQuantity,
      specifiedType: const FullType.nullable(int),
    );
    yield r'ledgerOccurredAt';
    yield object.ledgerOccurredAt == null ? null : serializers.serialize(
      object.ledgerOccurredAt,
      specifiedType: const FullType.nullable(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PaymentActivationResult object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PaymentActivationResultBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'customerPackageId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.customerPackageId = valueDes;
          break;
        case r'packageId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.packageId = valueDes;
          break;
        case r'packageName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.packageName = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PaymentActivationResultStatusEnum),
          ) as PaymentActivationResultStatusEnum;
          result.status = valueDes;
          break;
        case r'sessionCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sessionCount = valueDes;
          break;
        case r'activationDate':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.activationDate = valueDes;
          break;
        case r'expiryAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.expiryAt = valueDes;
          break;
        case r'ledgerEntryId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.ledgerEntryId = valueDes;
          break;
        case r'ledgerQuantity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.ledgerQuantity = valueDes;
          break;
        case r'ledgerOccurredAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.ledgerOccurredAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PaymentActivationResult deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PaymentActivationResultBuilder();
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

class PaymentActivationResultStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const PaymentActivationResultStatusEnum ACTIVE = _$paymentActivationResultStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'EXPIRED')
  static const PaymentActivationResultStatusEnum EXPIRED = _$paymentActivationResultStatusEnum_EXPIRED;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const PaymentActivationResultStatusEnum INACTIVE = _$paymentActivationResultStatusEnum_INACTIVE;

  static Serializer<PaymentActivationResultStatusEnum> get serializer => _$paymentActivationResultStatusEnumSerializer;

  const PaymentActivationResultStatusEnum._(String name): super(name);

  static BuiltSet<PaymentActivationResultStatusEnum> get values => _$paymentActivationResultStatusEnumValues;
  static PaymentActivationResultStatusEnum valueOf(String name) => _$paymentActivationResultStatusEnumValueOf(name);
}

