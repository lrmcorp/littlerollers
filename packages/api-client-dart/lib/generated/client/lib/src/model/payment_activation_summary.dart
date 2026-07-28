//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/date.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'payment_activation_summary.g.dart';

/// PaymentActivationSummary
///
/// Properties:
/// * [customerPackageId] 
/// * [status] 
/// * [activationDate] 
/// * [expiryAt] 
/// * [sessionCount] 
/// * [ledgerBalance] 
/// * [reserved] 
/// * [available] 
/// * [used] 
@BuiltValue()
abstract class PaymentActivationSummary implements Built<PaymentActivationSummary, PaymentActivationSummaryBuilder> {
  @BuiltValueField(wireName: r'customerPackageId')
  String get customerPackageId;

  @BuiltValueField(wireName: r'status')
  PaymentActivationSummaryStatusEnum get status;
  // enum statusEnum {  ACTIVE,  EXPIRED,  INACTIVE,  };

  @BuiltValueField(wireName: r'activationDate')
  Date get activationDate;

  @BuiltValueField(wireName: r'expiryAt')
  DateTime get expiryAt;

  @BuiltValueField(wireName: r'sessionCount')
  int get sessionCount;

  @BuiltValueField(wireName: r'ledgerBalance')
  int get ledgerBalance;

  @BuiltValueField(wireName: r'reserved')
  int get reserved;

  @BuiltValueField(wireName: r'available')
  int get available;

  @BuiltValueField(wireName: r'used')
  int get used;

  PaymentActivationSummary._();

  factory PaymentActivationSummary([void updates(PaymentActivationSummaryBuilder b)]) = _$PaymentActivationSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PaymentActivationSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PaymentActivationSummary> get serializer => _$PaymentActivationSummarySerializer();
}

class _$PaymentActivationSummarySerializer implements PrimitiveSerializer<PaymentActivationSummary> {
  @override
  final Iterable<Type> types = const [PaymentActivationSummary, _$PaymentActivationSummary];

  @override
  final String wireName = r'PaymentActivationSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PaymentActivationSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'customerPackageId';
    yield serializers.serialize(
      object.customerPackageId,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(PaymentActivationSummaryStatusEnum),
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
    yield r'sessionCount';
    yield serializers.serialize(
      object.sessionCount,
      specifiedType: const FullType(int),
    );
    yield r'ledgerBalance';
    yield serializers.serialize(
      object.ledgerBalance,
      specifiedType: const FullType(int),
    );
    yield r'reserved';
    yield serializers.serialize(
      object.reserved,
      specifiedType: const FullType(int),
    );
    yield r'available';
    yield serializers.serialize(
      object.available,
      specifiedType: const FullType(int),
    );
    yield r'used';
    yield serializers.serialize(
      object.used,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PaymentActivationSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PaymentActivationSummaryBuilder result,
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
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PaymentActivationSummaryStatusEnum),
          ) as PaymentActivationSummaryStatusEnum;
          result.status = valueDes;
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
        case r'sessionCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sessionCount = valueDes;
          break;
        case r'ledgerBalance':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.ledgerBalance = valueDes;
          break;
        case r'reserved':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.reserved = valueDes;
          break;
        case r'available':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.available = valueDes;
          break;
        case r'used':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.used = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PaymentActivationSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PaymentActivationSummaryBuilder();
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

class PaymentActivationSummaryStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const PaymentActivationSummaryStatusEnum ACTIVE = _$paymentActivationSummaryStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'EXPIRED')
  static const PaymentActivationSummaryStatusEnum EXPIRED = _$paymentActivationSummaryStatusEnum_EXPIRED;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const PaymentActivationSummaryStatusEnum INACTIVE = _$paymentActivationSummaryStatusEnum_INACTIVE;

  static Serializer<PaymentActivationSummaryStatusEnum> get serializer => _$paymentActivationSummaryStatusEnumSerializer;

  const PaymentActivationSummaryStatusEnum._(String name): super(name);

  static BuiltSet<PaymentActivationSummaryStatusEnum> get values => _$paymentActivationSummaryStatusEnumValues;
  static PaymentActivationSummaryStatusEnum valueOf(String name) => _$paymentActivationSummaryStatusEnumValueOf(name);
}

