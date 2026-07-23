//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'reschedule.g.dart';

/// Reschedule
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [bookingId] 
/// * [sourceClassSlotId] 
/// * [targetClassSlotId] 
/// * [requestedById] 
/// * [decidedById] 
/// * [requestReasonCode] 
/// * [decisionReasonCode] 
/// * [status] 
/// * [entitlementCutoffAt] 
/// * [entitledAtRequest] 
/// * [requestedAt] 
/// * [decidedAt] 
/// * [version] 
/// * [idempotentReplay] 
@BuiltValue()
abstract class Reschedule implements Built<Reschedule, RescheduleBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'bookingId')
  String get bookingId;

  @BuiltValueField(wireName: r'sourceClassSlotId')
  String get sourceClassSlotId;

  @BuiltValueField(wireName: r'targetClassSlotId')
  String get targetClassSlotId;

  @BuiltValueField(wireName: r'requestedById')
  String get requestedById;

  @BuiltValueField(wireName: r'decidedById')
  String? get decidedById;

  @BuiltValueField(wireName: r'requestReasonCode')
  RescheduleRequestReasonCodeEnum get requestReasonCode;
  // enum requestReasonCodeEnum {  CUSTOMER_SCHEDULE_CONFLICT,  WRONG_CLASS_SELECTED,  PERSONAL_UNAVAILABLE,  };

  @BuiltValueField(wireName: r'decisionReasonCode')
  RescheduleDecisionReasonCodeEnum? get decisionReasonCode;
  // enum decisionReasonCodeEnum {  ELIGIBILITY_VERIFIED,  TARGET_UNAVAILABLE,  OUTSIDE_POLICY,  OUT_OF_SCOPE,  ,  };

  @BuiltValueField(wireName: r'status')
  RescheduleStatusEnum get status;
  // enum statusEnum {  PENDING,  APPROVED,  REJECTED,  };

  @BuiltValueField(wireName: r'entitlementCutoffAt')
  DateTime get entitlementCutoffAt;

  @BuiltValueField(wireName: r'entitledAtRequest')
  RescheduleEntitledAtRequestEnum get entitledAtRequest;
  // enum entitledAtRequestEnum {  true,  };

  @BuiltValueField(wireName: r'requestedAt')
  DateTime get requestedAt;

  @BuiltValueField(wireName: r'decidedAt')
  DateTime? get decidedAt;

  @BuiltValueField(wireName: r'version')
  int get version;

  @BuiltValueField(wireName: r'idempotentReplay')
  bool? get idempotentReplay;

  Reschedule._();

  factory Reschedule([void updates(RescheduleBuilder b)]) = _$Reschedule;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RescheduleBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<Reschedule> get serializer => _$RescheduleSerializer();
}

class _$RescheduleSerializer implements PrimitiveSerializer<Reschedule> {
  @override
  final Iterable<Type> types = const [Reschedule, _$Reschedule];

  @override
  final String wireName = r'Reschedule';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Reschedule object, {
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
    yield r'bookingId';
    yield serializers.serialize(
      object.bookingId,
      specifiedType: const FullType(String),
    );
    yield r'sourceClassSlotId';
    yield serializers.serialize(
      object.sourceClassSlotId,
      specifiedType: const FullType(String),
    );
    yield r'targetClassSlotId';
    yield serializers.serialize(
      object.targetClassSlotId,
      specifiedType: const FullType(String),
    );
    yield r'requestedById';
    yield serializers.serialize(
      object.requestedById,
      specifiedType: const FullType(String),
    );
    if (object.decidedById != null) {
      yield r'decidedById';
      yield serializers.serialize(
        object.decidedById,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'requestReasonCode';
    yield serializers.serialize(
      object.requestReasonCode,
      specifiedType: const FullType(RescheduleRequestReasonCodeEnum),
    );
    if (object.decisionReasonCode != null) {
      yield r'decisionReasonCode';
      yield serializers.serialize(
        object.decisionReasonCode,
        specifiedType: const FullType.nullable(RescheduleDecisionReasonCodeEnum),
      );
    }
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(RescheduleStatusEnum),
    );
    yield r'entitlementCutoffAt';
    yield serializers.serialize(
      object.entitlementCutoffAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'entitledAtRequest';
    yield serializers.serialize(
      object.entitledAtRequest,
      specifiedType: const FullType(RescheduleEntitledAtRequestEnum),
    );
    yield r'requestedAt';
    yield serializers.serialize(
      object.requestedAt,
      specifiedType: const FullType(DateTime),
    );
    if (object.decidedAt != null) {
      yield r'decidedAt';
      yield serializers.serialize(
        object.decidedAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
    if (object.idempotentReplay != null) {
      yield r'idempotentReplay';
      yield serializers.serialize(
        object.idempotentReplay,
        specifiedType: const FullType(bool),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    Reschedule object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RescheduleBuilder result,
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
        case r'bookingId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.bookingId = valueDes;
          break;
        case r'sourceClassSlotId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sourceClassSlotId = valueDes;
          break;
        case r'targetClassSlotId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.targetClassSlotId = valueDes;
          break;
        case r'requestedById':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.requestedById = valueDes;
          break;
        case r'decidedById':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.decidedById = valueDes;
          break;
        case r'requestReasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(RescheduleRequestReasonCodeEnum),
          ) as RescheduleRequestReasonCodeEnum;
          result.requestReasonCode = valueDes;
          break;
        case r'decisionReasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(RescheduleDecisionReasonCodeEnum),
          ) as RescheduleDecisionReasonCodeEnum?;
          if (valueDes == null) continue;
          result.decisionReasonCode = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(RescheduleStatusEnum),
          ) as RescheduleStatusEnum;
          result.status = valueDes;
          break;
        case r'entitlementCutoffAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.entitlementCutoffAt = valueDes;
          break;
        case r'entitledAtRequest':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(RescheduleEntitledAtRequestEnum),
          ) as RescheduleEntitledAtRequestEnum;
          result.entitledAtRequest = valueDes;
          break;
        case r'requestedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.requestedAt = valueDes;
          break;
        case r'decidedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.decidedAt = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        case r'idempotentReplay':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.idempotentReplay = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  Reschedule deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RescheduleBuilder();
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

class RescheduleRequestReasonCodeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'CUSTOMER_SCHEDULE_CONFLICT')
  static const RescheduleRequestReasonCodeEnum CUSTOMER_SCHEDULE_CONFLICT = _$rescheduleRequestReasonCodeEnum_CUSTOMER_SCHEDULE_CONFLICT;
  @BuiltValueEnumConst(wireName: r'WRONG_CLASS_SELECTED')
  static const RescheduleRequestReasonCodeEnum WRONG_CLASS_SELECTED = _$rescheduleRequestReasonCodeEnum_WRONG_CLASS_SELECTED;
  @BuiltValueEnumConst(wireName: r'PERSONAL_UNAVAILABLE')
  static const RescheduleRequestReasonCodeEnum PERSONAL_UNAVAILABLE = _$rescheduleRequestReasonCodeEnum_PERSONAL_UNAVAILABLE;

  static Serializer<RescheduleRequestReasonCodeEnum> get serializer => _$rescheduleRequestReasonCodeEnumSerializer;

  const RescheduleRequestReasonCodeEnum._(String name): super(name);

  static BuiltSet<RescheduleRequestReasonCodeEnum> get values => _$rescheduleRequestReasonCodeEnumValues;
  static RescheduleRequestReasonCodeEnum valueOf(String name) => _$rescheduleRequestReasonCodeEnumValueOf(name);
}

class RescheduleDecisionReasonCodeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ELIGIBILITY_VERIFIED')
  static const RescheduleDecisionReasonCodeEnum ELIGIBILITY_VERIFIED = _$rescheduleDecisionReasonCodeEnum_ELIGIBILITY_VERIFIED;
  @BuiltValueEnumConst(wireName: r'TARGET_UNAVAILABLE')
  static const RescheduleDecisionReasonCodeEnum TARGET_UNAVAILABLE = _$rescheduleDecisionReasonCodeEnum_TARGET_UNAVAILABLE;
  @BuiltValueEnumConst(wireName: r'OUTSIDE_POLICY')
  static const RescheduleDecisionReasonCodeEnum OUTSIDE_POLICY = _$rescheduleDecisionReasonCodeEnum_OUTSIDE_POLICY;
  @BuiltValueEnumConst(wireName: r'OUT_OF_SCOPE')
  static const RescheduleDecisionReasonCodeEnum OUT_OF_SCOPE = _$rescheduleDecisionReasonCodeEnum_OUT_OF_SCOPE;

  static Serializer<RescheduleDecisionReasonCodeEnum> get serializer => _$rescheduleDecisionReasonCodeEnumSerializer;

  const RescheduleDecisionReasonCodeEnum._(String name): super(name);

  static BuiltSet<RescheduleDecisionReasonCodeEnum> get values => _$rescheduleDecisionReasonCodeEnumValues;
  static RescheduleDecisionReasonCodeEnum valueOf(String name) => _$rescheduleDecisionReasonCodeEnumValueOf(name);
}

class RescheduleStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING')
  static const RescheduleStatusEnum PENDING = _$rescheduleStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'APPROVED')
  static const RescheduleStatusEnum APPROVED = _$rescheduleStatusEnum_APPROVED;
  @BuiltValueEnumConst(wireName: r'REJECTED')
  static const RescheduleStatusEnum REJECTED = _$rescheduleStatusEnum_REJECTED;

  static Serializer<RescheduleStatusEnum> get serializer => _$rescheduleStatusEnumSerializer;

  const RescheduleStatusEnum._(String name): super(name);

  static BuiltSet<RescheduleStatusEnum> get values => _$rescheduleStatusEnumValues;
  static RescheduleStatusEnum valueOf(String name) => _$rescheduleStatusEnumValueOf(name);
}

class RescheduleEntitledAtRequestEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'true')
  static const RescheduleEntitledAtRequestEnum true_ = _$rescheduleEntitledAtRequestEnum_true_;

  static Serializer<RescheduleEntitledAtRequestEnum> get serializer => _$rescheduleEntitledAtRequestEnumSerializer;

  const RescheduleEntitledAtRequestEnum._(String name): super(name);

  static BuiltSet<RescheduleEntitledAtRequestEnum> get values => _$rescheduleEntitledAtRequestEnumValues;
  static RescheduleEntitledAtRequestEnum valueOf(String name) => _$rescheduleEntitledAtRequestEnumValueOf(name);
}

