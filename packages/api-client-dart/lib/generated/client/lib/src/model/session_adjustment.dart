//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/ledger_entry.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'session_adjustment.g.dart';

/// SessionAdjustment
///
/// Properties:
/// * [id] 
/// * [customerPackageId] 
/// * [quantity] 
/// * [reason] 
/// * [requestedBy] 
/// * [approvedBy] 
/// * [status] 
/// * [ledgerEntry] 
@BuiltValue()
abstract class SessionAdjustment implements Built<SessionAdjustment, SessionAdjustmentBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'customerPackageId')
  String get customerPackageId;

  @BuiltValueField(wireName: r'quantity')
  int get quantity;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  @BuiltValueField(wireName: r'requestedBy')
  String get requestedBy;

  @BuiltValueField(wireName: r'approvedBy')
  String? get approvedBy;

  @BuiltValueField(wireName: r'status')
  SessionAdjustmentStatusEnum get status;
  // enum statusEnum {  PENDING,  APPROVED,  POSTED,  REJECTED,  };

  @BuiltValueField(wireName: r'ledgerEntry')
  LedgerEntry? get ledgerEntry;

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
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
    yield r'requestedBy';
    yield serializers.serialize(
      object.requestedBy,
      specifiedType: const FullType(String),
    );
    if (object.approvedBy != null) {
      yield r'approvedBy';
      yield serializers.serialize(
        object.approvedBy,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(SessionAdjustmentStatusEnum),
    );
    if (object.ledgerEntry != null) {
      yield r'ledgerEntry';
      yield serializers.serialize(
        object.ledgerEntry,
        specifiedType: const FullType.nullable(LedgerEntry),
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
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        case r'requestedBy':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.requestedBy = valueDes;
          break;
        case r'approvedBy':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.approvedBy = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(SessionAdjustmentStatusEnum),
          ) as SessionAdjustmentStatusEnum;
          result.status = valueDes;
          break;
        case r'ledgerEntry':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(LedgerEntry),
          ) as LedgerEntry?;
          if (valueDes == null) continue;
          result.ledgerEntry.replace(valueDes);
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

class SessionAdjustmentStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING')
  static const SessionAdjustmentStatusEnum PENDING = _$sessionAdjustmentStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'APPROVED')
  static const SessionAdjustmentStatusEnum APPROVED = _$sessionAdjustmentStatusEnum_APPROVED;
  @BuiltValueEnumConst(wireName: r'POSTED')
  static const SessionAdjustmentStatusEnum POSTED = _$sessionAdjustmentStatusEnum_POSTED;
  @BuiltValueEnumConst(wireName: r'REJECTED')
  static const SessionAdjustmentStatusEnum REJECTED = _$sessionAdjustmentStatusEnum_REJECTED;

  static Serializer<SessionAdjustmentStatusEnum> get serializer => _$sessionAdjustmentStatusEnumSerializer;

  const SessionAdjustmentStatusEnum._(String name): super(name);

  static BuiltSet<SessionAdjustmentStatusEnum> get values => _$sessionAdjustmentStatusEnumValues;
  static SessionAdjustmentStatusEnum valueOf(String name) => _$sessionAdjustmentStatusEnumValueOf(name);
}

