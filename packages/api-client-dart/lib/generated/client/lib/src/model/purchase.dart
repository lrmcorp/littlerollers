//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'purchase.g.dart';

/// Legacy-compatible internal purchase view backed by the order model.
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
@BuiltValue(instantiable: false)
abstract class Purchase  {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'userId')
  String get userId;

  @BuiltValueField(wireName: r'packageId')
  String get packageId;

  @BuiltValueField(wireName: r'paymentProofId')
  String? get paymentProofId;

  @BuiltValueField(wireName: r'packageNameSnapshot')
  String get packageNameSnapshot;

  @BuiltValueField(wireName: r'priceRpSnapshot')
  int get priceRpSnapshot;

  @BuiltValueField(wireName: r'voucherId')
  String? get voucherId;

  @BuiltValueField(wireName: r'voucherCodeSnapshot')
  String? get voucherCodeSnapshot;

  @BuiltValueField(wireName: r'voucherDiscountTypeSnapshot')
  PurchaseVoucherDiscountTypeSnapshotEnum? get voucherDiscountTypeSnapshot;
  // enum voucherDiscountTypeSnapshotEnum {  PERCENTAGE,  FIXED_AMOUNT,  ,  };

  @BuiltValueField(wireName: r'voucherDiscountValueSnapshot')
  int? get voucherDiscountValueSnapshot;

  @BuiltValueField(wireName: r'voucherDiscountRpSnapshot')
  int? get voucherDiscountRpSnapshot;

  @BuiltValueField(wireName: r'priceAfterDiscountRpSnapshot')
  int? get priceAfterDiscountRpSnapshot;

  @BuiltValueField(wireName: r'paymentUniqueCode')
  int? get paymentUniqueCode;

  @BuiltValueField(wireName: r'payableAmountRpSnapshot')
  int? get payableAmountRpSnapshot;

  @BuiltValueField(wireName: r'sessionCountSnapshot')
  int get sessionCountSnapshot;

  @BuiltValueField(wireName: r'durationDaysSnapshot')
  int get durationDaysSnapshot;

  @BuiltValueField(wireName: r'status')
  PurchaseStatusEnum get status;
  // enum statusEnum {  AWAITING_PAYMENT,  PENDING,  ACTION_REQUIRED,  APPROVED,  REJECTED,  EXPIRED,  };

  @BuiltValueField(wireName: r'submittedAt')
  DateTime get submittedAt;

  @BuiltValueField(wireName: r'paymentExpiresAt')
  DateTime? get paymentExpiresAt;

  @BuiltValueField(wireName: r'decidedAt')
  DateTime? get decidedAt;

  @BuiltValueField(wireName: r'decidedById')
  String? get decidedById;

  @BuiltValueField(wireName: r'decisionReasonCode')
  String? get decisionReasonCode;

  @BuiltValueField(wireName: r'auditReference')
  String? get auditReference;

  @BuiltValueField(wireName: r'version')
  int get version;

  @BuiltValueSerializer(custom: true)
  static Serializer<Purchase> get serializer => _$PurchaseSerializer();
}

class _$PurchaseSerializer implements PrimitiveSerializer<Purchase> {
  @override
  final Iterable<Type> types = const [Purchase];

  @override
  final String wireName = r'Purchase';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Purchase object, {
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
    yield r'userId';
    yield serializers.serialize(
      object.userId,
      specifiedType: const FullType(String),
    );
    yield r'packageId';
    yield serializers.serialize(
      object.packageId,
      specifiedType: const FullType(String),
    );
    if (object.paymentProofId != null) {
      yield r'paymentProofId';
      yield serializers.serialize(
        object.paymentProofId,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'packageNameSnapshot';
    yield serializers.serialize(
      object.packageNameSnapshot,
      specifiedType: const FullType(String),
    );
    yield r'priceRpSnapshot';
    yield serializers.serialize(
      object.priceRpSnapshot,
      specifiedType: const FullType(int),
    );
    if (object.voucherId != null) {
      yield r'voucherId';
      yield serializers.serialize(
        object.voucherId,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.voucherCodeSnapshot != null) {
      yield r'voucherCodeSnapshot';
      yield serializers.serialize(
        object.voucherCodeSnapshot,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.voucherDiscountTypeSnapshot != null) {
      yield r'voucherDiscountTypeSnapshot';
      yield serializers.serialize(
        object.voucherDiscountTypeSnapshot,
        specifiedType: const FullType.nullable(PurchaseVoucherDiscountTypeSnapshotEnum),
      );
    }
    if (object.voucherDiscountValueSnapshot != null) {
      yield r'voucherDiscountValueSnapshot';
      yield serializers.serialize(
        object.voucherDiscountValueSnapshot,
        specifiedType: const FullType.nullable(int),
      );
    }
    if (object.voucherDiscountRpSnapshot != null) {
      yield r'voucherDiscountRpSnapshot';
      yield serializers.serialize(
        object.voucherDiscountRpSnapshot,
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
    if (object.paymentUniqueCode != null) {
      yield r'paymentUniqueCode';
      yield serializers.serialize(
        object.paymentUniqueCode,
        specifiedType: const FullType.nullable(int),
      );
    }
    if (object.payableAmountRpSnapshot != null) {
      yield r'payableAmountRpSnapshot';
      yield serializers.serialize(
        object.payableAmountRpSnapshot,
        specifiedType: const FullType.nullable(int),
      );
    }
    yield r'sessionCountSnapshot';
    yield serializers.serialize(
      object.sessionCountSnapshot,
      specifiedType: const FullType(int),
    );
    yield r'durationDaysSnapshot';
    yield serializers.serialize(
      object.durationDaysSnapshot,
      specifiedType: const FullType(int),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(PurchaseStatusEnum),
    );
    yield r'submittedAt';
    yield serializers.serialize(
      object.submittedAt,
      specifiedType: const FullType(DateTime),
    );
    if (object.paymentExpiresAt != null) {
      yield r'paymentExpiresAt';
      yield serializers.serialize(
        object.paymentExpiresAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    if (object.decidedAt != null) {
      yield r'decidedAt';
      yield serializers.serialize(
        object.decidedAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    if (object.decidedById != null) {
      yield r'decidedById';
      yield serializers.serialize(
        object.decidedById,
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
    if (object.auditReference != null) {
      yield r'auditReference';
      yield serializers.serialize(
        object.auditReference,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    Purchase object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  @override
  Purchase deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.deserialize(serialized, specifiedType: FullType($Purchase)) as $Purchase;
  }
}

/// a concrete implementation of [Purchase], since [Purchase] is not instantiable
@BuiltValue(instantiable: true)
abstract class $Purchase implements Purchase, Built<$Purchase, $PurchaseBuilder> {
  $Purchase._();

  factory $Purchase([void Function($PurchaseBuilder)? updates]) = _$$Purchase;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults($PurchaseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<$Purchase> get serializer => _$$PurchaseSerializer();
}

class _$$PurchaseSerializer implements PrimitiveSerializer<$Purchase> {
  @override
  final Iterable<Type> types = const [$Purchase, _$$Purchase];

  @override
  final String wireName = r'$Purchase';

  @override
  Object serialize(
    Serializers serializers,
    $Purchase object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.serialize(object, specifiedType: FullType(Purchase))!;
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PurchaseBuilder result,
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
        case r'userId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.userId = valueDes;
          break;
        case r'packageId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.packageId = valueDes;
          break;
        case r'paymentProofId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.paymentProofId = valueDes;
          break;
        case r'packageNameSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.packageNameSnapshot = valueDes;
          break;
        case r'priceRpSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.priceRpSnapshot = valueDes;
          break;
        case r'voucherId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.voucherId = valueDes;
          break;
        case r'voucherCodeSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.voucherCodeSnapshot = valueDes;
          break;
        case r'voucherDiscountTypeSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(PurchaseVoucherDiscountTypeSnapshotEnum),
          ) as PurchaseVoucherDiscountTypeSnapshotEnum?;
          if (valueDes == null) continue;
          result.voucherDiscountTypeSnapshot = valueDes;
          break;
        case r'voucherDiscountValueSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.voucherDiscountValueSnapshot = valueDes;
          break;
        case r'voucherDiscountRpSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.voucherDiscountRpSnapshot = valueDes;
          break;
        case r'priceAfterDiscountRpSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.priceAfterDiscountRpSnapshot = valueDes;
          break;
        case r'paymentUniqueCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.paymentUniqueCode = valueDes;
          break;
        case r'payableAmountRpSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.payableAmountRpSnapshot = valueDes;
          break;
        case r'sessionCountSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sessionCountSnapshot = valueDes;
          break;
        case r'durationDaysSnapshot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.durationDaysSnapshot = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PurchaseStatusEnum),
          ) as PurchaseStatusEnum;
          result.status = valueDes;
          break;
        case r'submittedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.submittedAt = valueDes;
          break;
        case r'paymentExpiresAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.paymentExpiresAt = valueDes;
          break;
        case r'decidedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.decidedAt = valueDes;
          break;
        case r'decidedById':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.decidedById = valueDes;
          break;
        case r'decisionReasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.decisionReasonCode = valueDes;
          break;
        case r'auditReference':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.auditReference = valueDes;
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
  $Purchase deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = $PurchaseBuilder();
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

class PurchaseVoucherDiscountTypeSnapshotEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PERCENTAGE')
  static const PurchaseVoucherDiscountTypeSnapshotEnum PERCENTAGE = _$purchaseVoucherDiscountTypeSnapshotEnum_PERCENTAGE;
  @BuiltValueEnumConst(wireName: r'FIXED_AMOUNT')
  static const PurchaseVoucherDiscountTypeSnapshotEnum FIXED_AMOUNT = _$purchaseVoucherDiscountTypeSnapshotEnum_FIXED_AMOUNT;

  static Serializer<PurchaseVoucherDiscountTypeSnapshotEnum> get serializer => _$purchaseVoucherDiscountTypeSnapshotEnumSerializer;

  const PurchaseVoucherDiscountTypeSnapshotEnum._(String name): super(name);

  static BuiltSet<PurchaseVoucherDiscountTypeSnapshotEnum> get values => _$purchaseVoucherDiscountTypeSnapshotEnumValues;
  static PurchaseVoucherDiscountTypeSnapshotEnum valueOf(String name) => _$purchaseVoucherDiscountTypeSnapshotEnumValueOf(name);
}

class PurchaseStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'AWAITING_PAYMENT')
  static const PurchaseStatusEnum AWAITING_PAYMENT = _$purchaseStatusEnum_AWAITING_PAYMENT;
  @BuiltValueEnumConst(wireName: r'PENDING')
  static const PurchaseStatusEnum PENDING = _$purchaseStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'ACTION_REQUIRED')
  static const PurchaseStatusEnum ACTION_REQUIRED = _$purchaseStatusEnum_ACTION_REQUIRED;
  @BuiltValueEnumConst(wireName: r'APPROVED')
  static const PurchaseStatusEnum APPROVED = _$purchaseStatusEnum_APPROVED;
  @BuiltValueEnumConst(wireName: r'REJECTED')
  static const PurchaseStatusEnum REJECTED = _$purchaseStatusEnum_REJECTED;
  @BuiltValueEnumConst(wireName: r'EXPIRED')
  static const PurchaseStatusEnum EXPIRED = _$purchaseStatusEnum_EXPIRED;

  static Serializer<PurchaseStatusEnum> get serializer => _$purchaseStatusEnumSerializer;

  const PurchaseStatusEnum._(String name): super(name);

  static BuiltSet<PurchaseStatusEnum> get values => _$purchaseStatusEnumValues;
  static PurchaseStatusEnum valueOf(String name) => _$purchaseStatusEnumValueOf(name);
}

