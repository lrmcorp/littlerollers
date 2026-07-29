//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/payment_review_branch.dart';
import 'package:openapi/src/model/payment_activation_summary.dart';
import 'package:openapi/src/model/payment_review_customer.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/purchase.dart';
import 'package:openapi/src/model/payment_review_proof.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'payment_review_item.g.dart';

/// PaymentReviewItem
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [userId] 
/// * [packageId] 
/// * [paymentProofId] 
/// * [packageNameSnapshot] 
/// * [priceRpSnapshot] 
/// * [voucherId] 
/// * [voucherCodeSnapshot] 
/// * [voucherDiscountTypeSnapshot] 
/// * [voucherDiscountValueSnapshot] 
/// * [voucherDiscountRpSnapshot] 
/// * [priceAfterDiscountRpSnapshot] 
/// * [paymentUniqueCode] 
/// * [payableAmountRpSnapshot] 
/// * [sessionCountSnapshot] 
/// * [durationDaysSnapshot] 
/// * [status] 
/// * [submittedAt] 
/// * [paymentExpiresAt] 
/// * [decidedAt] 
/// * [decidedById] 
/// * [decisionReasonCode] 
/// * [auditReference] 
/// * [version] 
/// * [customer] 
/// * [branch] 
/// * [paymentProof] 
/// * [activationSummary] 
@BuiltValue()
abstract class PaymentReviewItem implements Purchase, Built<PaymentReviewItem, PaymentReviewItemBuilder> {
  @BuiltValueField(wireName: r'paymentProof')
  PaymentReviewProof? get paymentProof;

  @BuiltValueField(wireName: r'activationSummary')
  PaymentActivationSummary? get activationSummary;

  @BuiltValueField(wireName: r'branch')
  PaymentReviewBranch get branch;

  @BuiltValueField(wireName: r'customer')
  PaymentReviewCustomer get customer;

  PaymentReviewItem._();

  factory PaymentReviewItem([void updates(PaymentReviewItemBuilder b)]) = _$PaymentReviewItem;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PaymentReviewItemBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PaymentReviewItem> get serializer => _$PaymentReviewItemSerializer();
}

class _$PaymentReviewItemSerializer implements PrimitiveSerializer<PaymentReviewItem> {
  @override
  final Iterable<Type> types = const [PaymentReviewItem, _$PaymentReviewItem];

  @override
  final String wireName = r'PaymentReviewItem';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PaymentReviewItem object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.auditReference != null) {
      yield r'auditReference';
      yield serializers.serialize(
        object.auditReference,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.voucherDiscountValueSnapshot != null) {
      yield r'voucherDiscountValueSnapshot';
      yield serializers.serialize(
        object.voucherDiscountValueSnapshot,
        specifiedType: const FullType.nullable(int),
      );
    }
    if (object.priceAfterDiscountRpSnapshot != null) {
      yield r'priceAfterDiscountRpSnapshot';
      yield serializers.serialize(
        object.priceAfterDiscountRpSnapshot,
        specifiedType: const FullType.nullable(int),
      );
    }
    yield r'branch';
    yield serializers.serialize(
      object.branch,
      specifiedType: const FullType(PaymentReviewBranch),
    );
    yield r'paymentProof';
    yield object.paymentProof == null ? null : serializers.serialize(
      object.paymentProof,
      specifiedType: const FullType.nullable(PaymentReviewProof),
    );
    if (object.voucherId != null) {
      yield r'voucherId';
      yield serializers.serialize(
        object.voucherId,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    if (object.voucherDiscountRpSnapshot != null) {
      yield r'voucherDiscountRpSnapshot';
      yield serializers.serialize(
        object.voucherDiscountRpSnapshot,
        specifiedType: const FullType.nullable(int),
      );
    }
    yield r'submittedAt';
    yield serializers.serialize(
      object.submittedAt,
      specifiedType: const FullType(DateTime),
    );
    if (object.paymentProofId != null) {
      yield r'paymentProofId';
      yield serializers.serialize(
        object.paymentProofId,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    if (object.voucherCodeSnapshot != null) {
      yield r'voucherCodeSnapshot';
      yield serializers.serialize(
        object.voucherCodeSnapshot,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.decisionReasonCode != null) {
      yield r'decisionReasonCode';
      yield serializers.serialize(
        object.decisionReasonCode,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.decidedById != null) {
      yield r'decidedById';
      yield serializers.serialize(
        object.decidedById,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'packageId';
    yield serializers.serialize(
      object.packageId,
      specifiedType: const FullType(String),
    );
    yield r'userId';
    yield serializers.serialize(
      object.userId,
      specifiedType: const FullType(String),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
    if (object.paymentExpiresAt != null) {
      yield r'paymentExpiresAt';
      yield serializers.serialize(
        object.paymentExpiresAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    yield r'priceRpSnapshot';
    yield serializers.serialize(
      object.priceRpSnapshot,
      specifiedType: const FullType(int),
    );
    if (object.payableAmountRpSnapshot != null) {
      yield r'payableAmountRpSnapshot';
      yield serializers.serialize(
        object.payableAmountRpSnapshot,
        specifiedType: const FullType.nullable(int),
      );
    }
    yield r'durationDaysSnapshot';
    yield serializers.serialize(
      object.durationDaysSnapshot,
      specifiedType: const FullType(int),
    );
    if (object.decidedAt != null) {
      yield r'decidedAt';
      yield serializers.serialize(
        object.decidedAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    yield r'packageNameSnapshot';
    yield serializers.serialize(
      object.packageNameSnapshot,
      specifiedType: const FullType(String),
    );
    yield r'sessionCountSnapshot';
    yield serializers.serialize(
      object.sessionCountSnapshot,
      specifiedType: const FullType(int),
    );
    if (object.paymentUniqueCode != null) {
      yield r'paymentUniqueCode';
      yield serializers.serialize(
        object.paymentUniqueCode,
        specifiedType: const FullType.nullable(int),
      );
    }
    yield r'activationSummary';
    yield object.activationSummary == null ? null : serializers.serialize(
      object.activationSummary,
      specifiedType: const FullType.nullable(PaymentActivationSummary),
    );
    if (object.voucherDiscountTypeSnapshot != null) {
      yield r'voucherDiscountTypeSnapshot';
      yield serializers.serialize(
        object.voucherDiscountTypeSnapshot,
        specifiedType: const FullType.nullable(PurchaseVoucherDiscountTypeSnapshotEnum),
      );
    }
    yield r'customer';
    yield serializers.serialize(
      object.customer,
      specifiedType: const FullType(PaymentReviewCustomer),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(PurchaseStatusEnum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PaymentReviewItem object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PaymentReviewItemBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'auditReference':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.auditReference = valueDes;
          break;
        case r'voucherDiscountValueSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.voucherDiscountValueSnapshot = valueDes;
          break;
        case r'priceAfterDiscountRpSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.priceAfterDiscountRpSnapshot = valueDes;
          break;
        case r'branch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PaymentReviewBranch),
          ) as PaymentReviewBranch;
          result.branch.replace(valueDes);
          break;
        case r'paymentProof':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(PaymentReviewProof),
          ) as PaymentReviewProof?;
          if (valueDes == null) continue;
          result.paymentProof.replace(valueDes);
          break;
        case r'voucherId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.voucherId = valueDes;
          break;
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'voucherDiscountRpSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.voucherDiscountRpSnapshot = valueDes;
          break;
        case r'submittedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.submittedAt = valueDes;
          break;
        case r'paymentProofId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.paymentProofId = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'voucherCodeSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.voucherCodeSnapshot = valueDes;
          break;
        case r'decisionReasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.decisionReasonCode = valueDes;
          break;
        case r'decidedById':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.decidedById = valueDes;
          break;
        case r'packageId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.packageId = valueDes;
          break;
        case r'userId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.userId = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        case r'paymentExpiresAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.paymentExpiresAt = valueDes;
          break;
        case r'priceRpSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.priceRpSnapshot = valueDes;
          break;
        case r'payableAmountRpSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.payableAmountRpSnapshot = valueDes;
          break;
        case r'durationDaysSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.durationDaysSnapshot = valueDes;
          break;
        case r'decidedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.decidedAt = valueDes;
          break;
        case r'packageNameSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.packageNameSnapshot = valueDes;
          break;
        case r'sessionCountSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sessionCountSnapshot = valueDes;
          break;
        case r'paymentUniqueCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.paymentUniqueCode = valueDes;
          break;
        case r'activationSummary':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(PaymentActivationSummary),
          ) as PaymentActivationSummary?;
          if (valueDes == null) continue;
          result.activationSummary.replace(valueDes);
          break;
        case r'voucherDiscountTypeSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(PurchaseVoucherDiscountTypeSnapshotEnum),
          ) as PurchaseVoucherDiscountTypeSnapshotEnum?;
          if (valueDes == null) continue;
          result.voucherDiscountTypeSnapshot = valueDes;
          break;
        case r'customer':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PaymentReviewCustomer),
          ) as PaymentReviewCustomer;
          result.customer.replace(valueDes);
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PurchaseStatusEnum),
          ) as PurchaseStatusEnum;
          result.status = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PaymentReviewItem deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PaymentReviewItemBuilder();
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

class PaymentReviewItemVoucherDiscountTypeSnapshotEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PERCENTAGE')
  static const PaymentReviewItemVoucherDiscountTypeSnapshotEnum PERCENTAGE = _$paymentReviewItemVoucherDiscountTypeSnapshotEnum_PERCENTAGE;
  @BuiltValueEnumConst(wireName: r'FIXED_AMOUNT')
  static const PaymentReviewItemVoucherDiscountTypeSnapshotEnum FIXED_AMOUNT = _$paymentReviewItemVoucherDiscountTypeSnapshotEnum_FIXED_AMOUNT;

  static Serializer<PaymentReviewItemVoucherDiscountTypeSnapshotEnum> get serializer => _$paymentReviewItemVoucherDiscountTypeSnapshotEnumSerializer;

  const PaymentReviewItemVoucherDiscountTypeSnapshotEnum._(String name): super(name);

  static BuiltSet<PaymentReviewItemVoucherDiscountTypeSnapshotEnum> get values => _$paymentReviewItemVoucherDiscountTypeSnapshotEnumValues;
  static PaymentReviewItemVoucherDiscountTypeSnapshotEnum valueOf(String name) => _$paymentReviewItemVoucherDiscountTypeSnapshotEnumValueOf(name);
}

class PaymentReviewItemStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'AWAITING_PAYMENT')
  static const PaymentReviewItemStatusEnum AWAITING_PAYMENT = _$paymentReviewItemStatusEnum_AWAITING_PAYMENT;
  @BuiltValueEnumConst(wireName: r'PENDING')
  static const PaymentReviewItemStatusEnum PENDING = _$paymentReviewItemStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'ACTION_REQUIRED')
  static const PaymentReviewItemStatusEnum ACTION_REQUIRED = _$paymentReviewItemStatusEnum_ACTION_REQUIRED;
  @BuiltValueEnumConst(wireName: r'APPROVED')
  static const PaymentReviewItemStatusEnum APPROVED = _$paymentReviewItemStatusEnum_APPROVED;
  @BuiltValueEnumConst(wireName: r'REJECTED')
  static const PaymentReviewItemStatusEnum REJECTED = _$paymentReviewItemStatusEnum_REJECTED;
  @BuiltValueEnumConst(wireName: r'EXPIRED')
  static const PaymentReviewItemStatusEnum EXPIRED = _$paymentReviewItemStatusEnum_EXPIRED;

  static Serializer<PaymentReviewItemStatusEnum> get serializer => _$paymentReviewItemStatusEnumSerializer;

  const PaymentReviewItemStatusEnum._(String name): super(name);

  static BuiltSet<PaymentReviewItemStatusEnum> get values => _$paymentReviewItemStatusEnumValues;
  static PaymentReviewItemStatusEnum valueOf(String name) => _$paymentReviewItemStatusEnumValueOf(name);
}

