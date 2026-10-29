//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/order_payment_account.dart';
import 'package:openapi/src/model/order_payment_proof_status.dart';
import 'package:openapi/src/model/customer_order_activation.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/session_duration_minutes.dart';
import 'package:openapi/src/model/customer_order_timeline_page.dart';
import 'package:openapi/src/model/order_promotion.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'order.g.dart';

/// Customer-safe order snapshot. Full destination account is returned only from authorized checkout and own-order detail. Legacy orders can have null paymentUniqueCode and an incomplete derived timeline.
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [branchName] 
/// * [branchTimezone] 
/// * [packageId] 
/// * [packageName] 
/// * [priceRp] 
/// * [baseAmountRp] 
/// * [promotion] 
/// * [promotionalPriceRp] 
/// * [paymentUniqueCode] 
/// * [payableAmountRp] 
/// * [sessionCount] 
/// * [sessionDurationMinutes] 
/// * [durationDays] 
/// * [status] 
/// * [submittedAt] 
/// * [decidedAt] 
/// * [expiresAt] 
/// * [continuationSlotId] 
/// * [paymentProofId] 
/// * [paymentProofStatus] 
/// * [decisionReasonCode] 
/// * [timelineComplete] 
/// * [activation] 
/// * [timeline] 
/// * [version] 
/// * [paymentAccount] 
@BuiltValue()
abstract class Order implements Built<Order, OrderBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'branchName')
  String? get branchName;

  @BuiltValueField(wireName: r'branchTimezone')
  String? get branchTimezone;

  @BuiltValueField(wireName: r'packageId')
  String get packageId;

  @BuiltValueField(wireName: r'packageName')
  String get packageName;

  @BuiltValueField(wireName: r'priceRp')
  int get priceRp;

  @BuiltValueField(wireName: r'baseAmountRp')
  int get baseAmountRp;

  @BuiltValueField(wireName: r'promotion')
  OrderPromotion? get promotion;

  @BuiltValueField(wireName: r'promotionalPriceRp')
  int get promotionalPriceRp;

  @BuiltValueField(wireName: r'paymentUniqueCode')
  int? get paymentUniqueCode;

  @BuiltValueField(wireName: r'payableAmountRp')
  int get payableAmountRp;

  @BuiltValueField(wireName: r'sessionCount')
  int get sessionCount;

  @BuiltValueField(wireName: r'sessionDurationMinutes')
  SessionDurationMinutes? get sessionDurationMinutes;
  // enum sessionDurationMinutesEnum {  60,  120,  };

  @BuiltValueField(wireName: r'durationDays')
  int get durationDays;

  @BuiltValueField(wireName: r'status')
  OrderStatusEnum get status;
  // enum statusEnum {  AWAITING_PAYMENT,  PENDING,  ACTION_REQUIRED,  APPROVED,  REJECTED,  EXPIRED,  };

  @BuiltValueField(wireName: r'submittedAt')
  DateTime get submittedAt;

  @BuiltValueField(wireName: r'decidedAt')
  DateTime? get decidedAt;

  @BuiltValueField(wireName: r'expiresAt')
  DateTime? get expiresAt;

  @BuiltValueField(wireName: r'continuationSlotId')
  String? get continuationSlotId;

  @BuiltValueField(wireName: r'paymentProofId')
  String? get paymentProofId;

  @BuiltValueField(wireName: r'paymentProofStatus')
  OrderPaymentProofStatus? get paymentProofStatus;

  @BuiltValueField(wireName: r'decisionReasonCode')
  String? get decisionReasonCode;

  @BuiltValueField(wireName: r'timelineComplete')
  bool get timelineComplete;

  @BuiltValueField(wireName: r'activation')
  CustomerOrderActivation? get activation;

  @BuiltValueField(wireName: r'timeline')
  CustomerOrderTimelinePage? get timeline;

  @BuiltValueField(wireName: r'version')
  int get version;

  @BuiltValueField(wireName: r'paymentAccount')
  OrderPaymentAccount? get paymentAccount;

  Order._();

  factory Order([void updates(OrderBuilder b)]) = _$Order;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OrderBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<Order> get serializer => _$OrderSerializer();
}

class _$OrderSerializer implements PrimitiveSerializer<Order> {
  @override
  final Iterable<Type> types = const [Order, _$Order];

  @override
  final String wireName = r'Order';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Order object, {
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
    if (object.branchName != null) {
      yield r'branchName';
      yield serializers.serialize(
        object.branchName,
        specifiedType: const FullType(String),
      );
    }
    if (object.branchTimezone != null) {
      yield r'branchTimezone';
      yield serializers.serialize(
        object.branchTimezone,
        specifiedType: const FullType(String),
      );
    }
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
    yield r'priceRp';
    yield serializers.serialize(
      object.priceRp,
      specifiedType: const FullType(int),
    );
    yield r'baseAmountRp';
    yield serializers.serialize(
      object.baseAmountRp,
      specifiedType: const FullType(int),
    );
    if (object.promotion != null) {
      yield r'promotion';
      yield serializers.serialize(
        object.promotion,
        specifiedType: const FullType.nullable(OrderPromotion),
      );
    }
    yield r'promotionalPriceRp';
    yield serializers.serialize(
      object.promotionalPriceRp,
      specifiedType: const FullType(int),
    );
    if (object.paymentUniqueCode != null) {
      yield r'paymentUniqueCode';
      yield serializers.serialize(
        object.paymentUniqueCode,
        specifiedType: const FullType.nullable(int),
      );
    }
    yield r'payableAmountRp';
    yield serializers.serialize(
      object.payableAmountRp,
      specifiedType: const FullType(int),
    );
    yield r'sessionCount';
    yield serializers.serialize(
      object.sessionCount,
      specifiedType: const FullType(int),
    );
    if (object.sessionDurationMinutes != null) {
      yield r'sessionDurationMinutes';
      yield serializers.serialize(
        object.sessionDurationMinutes,
        specifiedType: const FullType(SessionDurationMinutes),
      );
    }
    yield r'durationDays';
    yield serializers.serialize(
      object.durationDays,
      specifiedType: const FullType(int),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(OrderStatusEnum),
    );
    yield r'submittedAt';
    yield serializers.serialize(
      object.submittedAt,
      specifiedType: const FullType(DateTime),
    );
    if (object.decidedAt != null) {
      yield r'decidedAt';
      yield serializers.serialize(
        object.decidedAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    if (object.expiresAt != null) {
      yield r'expiresAt';
      yield serializers.serialize(
        object.expiresAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    if (object.continuationSlotId != null) {
      yield r'continuationSlotId';
      yield serializers.serialize(
        object.continuationSlotId,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.paymentProofId != null) {
      yield r'paymentProofId';
      yield serializers.serialize(
        object.paymentProofId,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.paymentProofStatus != null) {
      yield r'paymentProofStatus';
      yield serializers.serialize(
        object.paymentProofStatus,
        specifiedType: const FullType(OrderPaymentProofStatus),
      );
    }
    if (object.decisionReasonCode != null) {
      yield r'decisionReasonCode';
      yield serializers.serialize(
        object.decisionReasonCode,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'timelineComplete';
    yield serializers.serialize(
      object.timelineComplete,
      specifiedType: const FullType(bool),
    );
    if (object.activation != null) {
      yield r'activation';
      yield serializers.serialize(
        object.activation,
        specifiedType: const FullType.nullable(CustomerOrderActivation),
      );
    }
    if (object.timeline != null) {
      yield r'timeline';
      yield serializers.serialize(
        object.timeline,
        specifiedType: const FullType(CustomerOrderTimelinePage),
      );
    }
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
    if (object.paymentAccount != null) {
      yield r'paymentAccount';
      yield serializers.serialize(
        object.paymentAccount,
        specifiedType: const FullType(OrderPaymentAccount),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    Order object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OrderBuilder result,
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
        case r'branchName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchName = valueDes;
          break;
        case r'branchTimezone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchTimezone = valueDes;
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
        case r'priceRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.priceRp = valueDes;
          break;
        case r'baseAmountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.baseAmountRp = valueDes;
          break;
        case r'promotion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(OrderPromotion),
          ) as OrderPromotion?;
          if (valueDes == null) continue;
          result.promotion.replace(valueDes);
          break;
        case r'promotionalPriceRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.promotionalPriceRp = valueDes;
          break;
        case r'paymentUniqueCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.paymentUniqueCode = valueDes;
          break;
        case r'payableAmountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.payableAmountRp = valueDes;
          break;
        case r'sessionCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sessionCount = valueDes;
          break;
        case r'sessionDurationMinutes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(SessionDurationMinutes),
          ) as SessionDurationMinutes;
          result.sessionDurationMinutes = valueDes;
          break;
        case r'durationDays':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.durationDays = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(OrderStatusEnum),
          ) as OrderStatusEnum;
          result.status = valueDes;
          break;
        case r'submittedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.submittedAt = valueDes;
          break;
        case r'decidedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.decidedAt = valueDes;
          break;
        case r'expiresAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.expiresAt = valueDes;
          break;
        case r'continuationSlotId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.continuationSlotId = valueDes;
          break;
        case r'paymentProofId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.paymentProofId = valueDes;
          break;
        case r'paymentProofStatus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(OrderPaymentProofStatus),
          ) as OrderPaymentProofStatus;
          result.paymentProofStatus.replace(valueDes);
          break;
        case r'decisionReasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.decisionReasonCode = valueDes;
          break;
        case r'timelineComplete':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.timelineComplete = valueDes;
          break;
        case r'activation':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(CustomerOrderActivation),
          ) as CustomerOrderActivation?;
          if (valueDes == null) continue;
          result.activation.replace(valueDes);
          break;
        case r'timeline':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerOrderTimelinePage),
          ) as CustomerOrderTimelinePage;
          result.timeline.replace(valueDes);
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        case r'paymentAccount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(OrderPaymentAccount),
          ) as OrderPaymentAccount;
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
  Order deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OrderBuilder();
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

class OrderStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'AWAITING_PAYMENT')
  static const OrderStatusEnum AWAITING_PAYMENT = _$orderStatusEnum_AWAITING_PAYMENT;
  @BuiltValueEnumConst(wireName: r'PENDING')
  static const OrderStatusEnum PENDING = _$orderStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'ACTION_REQUIRED')
  static const OrderStatusEnum ACTION_REQUIRED = _$orderStatusEnum_ACTION_REQUIRED;
  @BuiltValueEnumConst(wireName: r'APPROVED')
  static const OrderStatusEnum APPROVED = _$orderStatusEnum_APPROVED;
  @BuiltValueEnumConst(wireName: r'REJECTED')
  static const OrderStatusEnum REJECTED = _$orderStatusEnum_REJECTED;
  @BuiltValueEnumConst(wireName: r'EXPIRED')
  static const OrderStatusEnum EXPIRED = _$orderStatusEnum_EXPIRED;

  static Serializer<OrderStatusEnum> get serializer => _$orderStatusEnumSerializer;

  const OrderStatusEnum._(String name): super(name);

  static BuiltSet<OrderStatusEnum> get values => _$orderStatusEnumValues;
  static OrderStatusEnum valueOf(String name) => _$orderStatusEnumValueOf(name);
}

