//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
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
/// * [decidedById] 
/// * [decisionCode] 
/// * [status] 
/// * [version] 
/// * [createdAt] 
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

  @BuiltValueField(wireName: r'decidedById')
  String? get decidedById;

  @BuiltValueField(wireName: r'decisionCode')
  SessionAdjustmentDecisionCodeEnum? get decisionCode;
  // enum decisionCodeEnum {  CORRECTION_VERIFIED,  INVALID_EVIDENCE,  DUPLICATE_REQUEST,  OUT_OF_SCOPE,  ,  };

  @BuiltValueField(wireName: r'status')
  SessionAdjustmentStatusEnum get status;
  // enum statusEnum {  PENDING,  POSTED,  REJECTED,  };

  @BuiltValueField(wireName: r'version')
  int get version;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

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
    if (object.decidedById != null) {
      yield r'decidedById';
      yield serializers.serialize(
        object.decidedById,
        specifiedType: const FullType.nullable(String),
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
        case r'decidedById':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.decidedById = valueDes;
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

