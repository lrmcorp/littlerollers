//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/adjustment_customer.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/adjustment_actor.dart';
import 'package:openapi/src/model/adjustment_named_reference.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'session_adjustment.g.dart';

/// SessionAdjustment
///
/// Properties:
/// * [id] 
/// * [customerPackageId] 
/// * [quantity] 
/// * [reasonCode] 
/// * [requestedById] 
/// * [requestedBy] 
/// * [decidedById] 
/// * [decidedBy] 
/// * [decisionCode] 
/// * [status] 
/// * [ledgerBalanceAtRequest] 
/// * [reservedAtRequest] 
/// * [customer] 
/// * [branch] 
/// * [package] 
/// * [classType] 
/// * [currentBalance] 
/// * [currentReserved] 
/// * [currentAvailable] 
/// * [projectedLedgerBalance] 
/// * [projectedAvailable] 
/// * [eligibleForApproval] 
/// * [eligibilityReason] 
/// * [ledgerEntryId] 
/// * [version] 
/// * [createdAt] 
/// * [decidedAt] 
@BuiltValue()
abstract class SessionAdjustment implements Built<SessionAdjustment, SessionAdjustmentBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'customerPackageId')
  String get customerPackageId;

  @BuiltValueField(wireName: r'quantity')
  int get quantity;

  @BuiltValueField(wireName: r'reasonCode')
  SessionAdjustmentReasonCodeEnum get reasonCode;
  // enum reasonCodeEnum {  MIGRATION_CORRECTION,  ATTENDANCE_CORRECTION,  PACKAGE_COMPENSATION,  SUPPORT_RECONCILIATION,  };

  @BuiltValueField(wireName: r'requestedById')
  String get requestedById;

  @BuiltValueField(wireName: r'requestedBy')
  AdjustmentActor? get requestedBy;

  @BuiltValueField(wireName: r'decidedById')
  String? get decidedById;

  @BuiltValueField(wireName: r'decidedBy')
  AdjustmentActor? get decidedBy;

  @BuiltValueField(wireName: r'decisionCode')
  SessionAdjustmentDecisionCodeEnum? get decisionCode;
  // enum decisionCodeEnum {  CORRECTION_VERIFIED,  INVALID_EVIDENCE,  DUPLICATE_REQUEST,  OUT_OF_SCOPE,  ,  };

  @BuiltValueField(wireName: r'status')
  SessionAdjustmentStatusEnum get status;
  // enum statusEnum {  PENDING,  POSTED,  REJECTED,  };

  @BuiltValueField(wireName: r'ledgerBalanceAtRequest')
  int? get ledgerBalanceAtRequest;

  @BuiltValueField(wireName: r'reservedAtRequest')
  int? get reservedAtRequest;

  @BuiltValueField(wireName: r'customer')
  AdjustmentCustomer? get customer;

  @BuiltValueField(wireName: r'branch')
  AdjustmentNamedReference? get branch;

  @BuiltValueField(wireName: r'package')
  AdjustmentNamedReference? get package;

  @BuiltValueField(wireName: r'classType')
  AdjustmentNamedReference? get classType;

  @BuiltValueField(wireName: r'currentBalance')
  int? get currentBalance;

  @BuiltValueField(wireName: r'currentReserved')
  int? get currentReserved;

  @BuiltValueField(wireName: r'currentAvailable')
  int? get currentAvailable;

  @BuiltValueField(wireName: r'projectedLedgerBalance')
  int? get projectedLedgerBalance;

  @BuiltValueField(wireName: r'projectedAvailable')
  int? get projectedAvailable;

  @BuiltValueField(wireName: r'eligibleForApproval')
  bool? get eligibleForApproval;

  @BuiltValueField(wireName: r'eligibilityReason')
  String? get eligibilityReason;

  @BuiltValueField(wireName: r'ledgerEntryId')
  String? get ledgerEntryId;

  @BuiltValueField(wireName: r'version')
  int get version;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'decidedAt')
  DateTime? get decidedAt;

  SessionAdjustment._();

  factory SessionAdjustment([void updates(SessionAdjustmentBuilder b)]) = _$SessionAdjustment;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SessionAdjustmentBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SessionAdjustment> get serializer => _$SessionAdjustmentSerializer();
}

class _$SessionAdjustmentSerializer implements PrimitiveSerializer<SessionAdjustment> {
  @override
  final Iterable<Type> types = const [SessionAdjustment, _$SessionAdjustment];

  @override
  final String wireName = r'SessionAdjustment';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SessionAdjustment object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'customerPackageId';
    yield serializers.serialize(
      object.customerPackageId,
      specifiedType: const FullType(String),
    );
    yield r'quantity';
    yield serializers.serialize(
      object.quantity,
      specifiedType: const FullType(int),
    );
    yield r'reasonCode';
    yield serializers.serialize(
      object.reasonCode,
      specifiedType: const FullType(SessionAdjustmentReasonCodeEnum),
    );
    yield r'requestedById';
    yield serializers.serialize(
      object.requestedById,
      specifiedType: const FullType(String),
    );
    if (object.requestedBy != null) {
      yield r'requestedBy';
      yield serializers.serialize(
        object.requestedBy,
        specifiedType: const FullType(AdjustmentActor),
      );
    }
    if (object.decidedById != null) {
      yield r'decidedById';
      yield serializers.serialize(
        object.decidedById,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.decidedBy != null) {
      yield r'decidedBy';
      yield serializers.serialize(
        object.decidedBy,
        specifiedType: const FullType.nullable(AdjustmentActor),
      );
    }
    if (object.decisionCode != null) {
      yield r'decisionCode';
      yield serializers.serialize(
        object.decisionCode,
        specifiedType: const FullType.nullable(SessionAdjustmentDecisionCodeEnum),
      );
    }
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(SessionAdjustmentStatusEnum),
    );
    if (object.ledgerBalanceAtRequest != null) {
      yield r'ledgerBalanceAtRequest';
      yield serializers.serialize(
        object.ledgerBalanceAtRequest,
        specifiedType: const FullType.nullable(int),
      );
    }
    if (object.reservedAtRequest != null) {
      yield r'reservedAtRequest';
      yield serializers.serialize(
        object.reservedAtRequest,
        specifiedType: const FullType.nullable(int),
      );
    }
    if (object.customer != null) {
      yield r'customer';
      yield serializers.serialize(
        object.customer,
        specifiedType: const FullType(AdjustmentCustomer),
      );
    }
    if (object.branch != null) {
      yield r'branch';
      yield serializers.serialize(
        object.branch,
        specifiedType: const FullType(AdjustmentNamedReference),
      );
    }
    if (object.package != null) {
      yield r'package';
      yield serializers.serialize(
        object.package,
        specifiedType: const FullType(AdjustmentNamedReference),
      );
    }
    if (object.classType != null) {
      yield r'classType';
      yield serializers.serialize(
        object.classType,
        specifiedType: const FullType(AdjustmentNamedReference),
      );
    }
    if (object.currentBalance != null) {
      yield r'currentBalance';
      yield serializers.serialize(
        object.currentBalance,
        specifiedType: const FullType(int),
      );
    }
    if (object.currentReserved != null) {
      yield r'currentReserved';
      yield serializers.serialize(
        object.currentReserved,
        specifiedType: const FullType(int),
      );
    }
    if (object.currentAvailable != null) {
      yield r'currentAvailable';
      yield serializers.serialize(
        object.currentAvailable,
        specifiedType: const FullType(int),
      );
    }
    if (object.projectedLedgerBalance != null) {
      yield r'projectedLedgerBalance';
      yield serializers.serialize(
        object.projectedLedgerBalance,
        specifiedType: const FullType(int),
      );
    }
    if (object.projectedAvailable != null) {
      yield r'projectedAvailable';
      yield serializers.serialize(
        object.projectedAvailable,
        specifiedType: const FullType(int),
      );
    }
    if (object.eligibleForApproval != null) {
      yield r'eligibleForApproval';
      yield serializers.serialize(
        object.eligibleForApproval,
        specifiedType: const FullType(bool),
      );
    }
    if (object.eligibilityReason != null) {
      yield r'eligibilityReason';
      yield serializers.serialize(
        object.eligibilityReason,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.ledgerEntryId != null) {
      yield r'ledgerEntryId';
      yield serializers.serialize(
        object.ledgerEntryId,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
    if (object.decidedAt != null) {
      yield r'decidedAt';
      yield serializers.serialize(
        object.decidedAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    SessionAdjustment object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SessionAdjustmentBuilder result,
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
        case r'customerPackageId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.customerPackageId = valueDes;
          break;
        case r'quantity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.quantity = valueDes;
          break;
        case r'reasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(SessionAdjustmentReasonCodeEnum),
          ) as SessionAdjustmentReasonCodeEnum;
          result.reasonCode = valueDes;
          break;
        case r'requestedById':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.requestedById = valueDes;
          break;
        case r'requestedBy':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AdjustmentActor),
          ) as AdjustmentActor;
          result.requestedBy.replace(valueDes);
          break;
        case r'decidedById':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.decidedById = valueDes;
          break;
        case r'decidedBy':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(AdjustmentActor),
          ) as AdjustmentActor?;
          if (valueDes == null) continue;
          result.decidedBy.replace(valueDes);
          break;
        case r'decisionCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(SessionAdjustmentDecisionCodeEnum),
          ) as SessionAdjustmentDecisionCodeEnum?;
          if (valueDes == null) continue;
          result.decisionCode = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(SessionAdjustmentStatusEnum),
          ) as SessionAdjustmentStatusEnum;
          result.status = valueDes;
          break;
        case r'ledgerBalanceAtRequest':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.ledgerBalanceAtRequest = valueDes;
          break;
        case r'reservedAtRequest':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.reservedAtRequest = valueDes;
          break;
        case r'customer':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AdjustmentCustomer),
          ) as AdjustmentCustomer;
          result.customer.replace(valueDes);
          break;
        case r'branch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AdjustmentNamedReference),
          ) as AdjustmentNamedReference;
          result.branch.replace(valueDes);
          break;
        case r'package':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AdjustmentNamedReference),
          ) as AdjustmentNamedReference;
          result.package.replace(valueDes);
          break;
        case r'classType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AdjustmentNamedReference),
          ) as AdjustmentNamedReference;
          result.classType.replace(valueDes);
          break;
        case r'currentBalance':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.currentBalance = valueDes;
          break;
        case r'currentReserved':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.currentReserved = valueDes;
          break;
        case r'currentAvailable':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.currentAvailable = valueDes;
          break;
        case r'projectedLedgerBalance':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.projectedLedgerBalance = valueDes;
          break;
        case r'projectedAvailable':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.projectedAvailable = valueDes;
          break;
        case r'eligibleForApproval':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.eligibleForApproval = valueDes;
          break;
        case r'eligibilityReason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.eligibilityReason = valueDes;
          break;
        case r'ledgerEntryId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.ledgerEntryId = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        case r'decidedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.decidedAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SessionAdjustment deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SessionAdjustmentBuilder();
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

class SessionAdjustmentReasonCodeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'MIGRATION_CORRECTION')
  static const SessionAdjustmentReasonCodeEnum MIGRATION_CORRECTION = _$sessionAdjustmentReasonCodeEnum_MIGRATION_CORRECTION;
  @BuiltValueEnumConst(wireName: r'ATTENDANCE_CORRECTION')
  static const SessionAdjustmentReasonCodeEnum ATTENDANCE_CORRECTION = _$sessionAdjustmentReasonCodeEnum_ATTENDANCE_CORRECTION;
  @BuiltValueEnumConst(wireName: r'PACKAGE_COMPENSATION')
  static const SessionAdjustmentReasonCodeEnum PACKAGE_COMPENSATION = _$sessionAdjustmentReasonCodeEnum_PACKAGE_COMPENSATION;
  @BuiltValueEnumConst(wireName: r'SUPPORT_RECONCILIATION')
  static const SessionAdjustmentReasonCodeEnum SUPPORT_RECONCILIATION = _$sessionAdjustmentReasonCodeEnum_SUPPORT_RECONCILIATION;

  static Serializer<SessionAdjustmentReasonCodeEnum> get serializer => _$sessionAdjustmentReasonCodeEnumSerializer;

  const SessionAdjustmentReasonCodeEnum._(String name): super(name);

  static BuiltSet<SessionAdjustmentReasonCodeEnum> get values => _$sessionAdjustmentReasonCodeEnumValues;
  static SessionAdjustmentReasonCodeEnum valueOf(String name) => _$sessionAdjustmentReasonCodeEnumValueOf(name);
}

class SessionAdjustmentDecisionCodeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'CORRECTION_VERIFIED')
  static const SessionAdjustmentDecisionCodeEnum CORRECTION_VERIFIED = _$sessionAdjustmentDecisionCodeEnum_CORRECTION_VERIFIED;
  @BuiltValueEnumConst(wireName: r'INVALID_EVIDENCE')
  static const SessionAdjustmentDecisionCodeEnum INVALID_EVIDENCE = _$sessionAdjustmentDecisionCodeEnum_INVALID_EVIDENCE;
  @BuiltValueEnumConst(wireName: r'DUPLICATE_REQUEST')
  static const SessionAdjustmentDecisionCodeEnum DUPLICATE_REQUEST = _$sessionAdjustmentDecisionCodeEnum_DUPLICATE_REQUEST;
  @BuiltValueEnumConst(wireName: r'OUT_OF_SCOPE')
  static const SessionAdjustmentDecisionCodeEnum OUT_OF_SCOPE = _$sessionAdjustmentDecisionCodeEnum_OUT_OF_SCOPE;

  static Serializer<SessionAdjustmentDecisionCodeEnum> get serializer => _$sessionAdjustmentDecisionCodeEnumSerializer;

  const SessionAdjustmentDecisionCodeEnum._(String name): super(name);

  static BuiltSet<SessionAdjustmentDecisionCodeEnum> get values => _$sessionAdjustmentDecisionCodeEnumValues;
  static SessionAdjustmentDecisionCodeEnum valueOf(String name) => _$sessionAdjustmentDecisionCodeEnumValueOf(name);
}

class SessionAdjustmentStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING')
  static const SessionAdjustmentStatusEnum PENDING = _$sessionAdjustmentStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'POSTED')
  static const SessionAdjustmentStatusEnum POSTED = _$sessionAdjustmentStatusEnum_POSTED;
  @BuiltValueEnumConst(wireName: r'REJECTED')
  static const SessionAdjustmentStatusEnum REJECTED = _$sessionAdjustmentStatusEnum_REJECTED;

  static Serializer<SessionAdjustmentStatusEnum> get serializer => _$sessionAdjustmentStatusEnumSerializer;

  const SessionAdjustmentStatusEnum._(String name): super(name);

  static BuiltSet<SessionAdjustmentStatusEnum> get values => _$sessionAdjustmentStatusEnumValues;
  static SessionAdjustmentStatusEnum valueOf(String name) => _$sessionAdjustmentStatusEnumValueOf(name);
}

