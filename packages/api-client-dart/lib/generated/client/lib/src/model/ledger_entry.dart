//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'ledger_entry.g.dart';

/// LedgerEntry
///
/// Properties:
/// * [id] 
/// * [customerPackageId] 
/// * [type] 
/// * [quantity] 
/// * [referenceType] 
/// * [referenceId] 
/// * [referenceLabel] 
/// * [bookingId] 
/// * [balanceAfter] 
/// * [reason] 
/// * [occurredAt] 
@BuiltValue()
abstract class LedgerEntry implements Built<LedgerEntry, LedgerEntryBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'customerPackageId')
  String get customerPackageId;

  @BuiltValueField(wireName: r'type')
  LedgerEntryTypeEnum get type;
  // enum typeEnum {  PURCHASE,  ATTEND,  REVERSAL,  ADJUST_MANUAL,  MIGRATION_OPENING,  };

  @BuiltValueField(wireName: r'quantity')
  int get quantity;

  @BuiltValueField(wireName: r'referenceType')
  String get referenceType;

  @BuiltValueField(wireName: r'referenceId')
  String get referenceId;

  @BuiltValueField(wireName: r'referenceLabel')
  String? get referenceLabel;

  @BuiltValueField(wireName: r'bookingId')
  String? get bookingId;

  @BuiltValueField(wireName: r'balanceAfter')
  int? get balanceAfter;

  @BuiltValueField(wireName: r'reason')
  String? get reason;

  @BuiltValueField(wireName: r'occurredAt')
  DateTime get occurredAt;

  LedgerEntry._();

  factory LedgerEntry([void updates(LedgerEntryBuilder b)]) = _$LedgerEntry;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(LedgerEntryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<LedgerEntry> get serializer => _$LedgerEntrySerializer();
}

class _$LedgerEntrySerializer implements PrimitiveSerializer<LedgerEntry> {
  @override
  final Iterable<Type> types = const [LedgerEntry, _$LedgerEntry];

  @override
  final String wireName = r'LedgerEntry';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    LedgerEntry object, {
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
    yield r'type';
    yield serializers.serialize(
      object.type,
      specifiedType: const FullType(LedgerEntryTypeEnum),
    );
    yield r'quantity';
    yield serializers.serialize(
      object.quantity,
      specifiedType: const FullType(int),
    );
    yield r'referenceType';
    yield serializers.serialize(
      object.referenceType,
      specifiedType: const FullType(String),
    );
    yield r'referenceId';
    yield serializers.serialize(
      object.referenceId,
      specifiedType: const FullType(String),
    );
    if (object.referenceLabel != null) {
      yield r'referenceLabel';
      yield serializers.serialize(
        object.referenceLabel,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.bookingId != null) {
      yield r'bookingId';
      yield serializers.serialize(
        object.bookingId,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.balanceAfter != null) {
      yield r'balanceAfter';
      yield serializers.serialize(
        object.balanceAfter,
        specifiedType: const FullType.nullable(int),
      );
    }
    if (object.reason != null) {
      yield r'reason';
      yield serializers.serialize(
        object.reason,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'occurredAt';
    yield serializers.serialize(
      object.occurredAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    LedgerEntry object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required LedgerEntryBuilder result,
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
        case r'type':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(LedgerEntryTypeEnum),
          ) as LedgerEntryTypeEnum;
          result.type = valueDes;
          break;
        case r'quantity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.quantity = valueDes;
          break;
        case r'referenceType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.referenceType = valueDes;
          break;
        case r'referenceId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.referenceId = valueDes;
          break;
        case r'referenceLabel':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.referenceLabel = valueDes;
          break;
        case r'bookingId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.bookingId = valueDes;
          break;
        case r'balanceAfter':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.balanceAfter = valueDes;
          break;
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.reason = valueDes;
          break;
        case r'occurredAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.occurredAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  LedgerEntry deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = LedgerEntryBuilder();
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

class LedgerEntryTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PURCHASE')
  static const LedgerEntryTypeEnum PURCHASE = _$ledgerEntryTypeEnum_PURCHASE;
  @BuiltValueEnumConst(wireName: r'ATTEND')
  static const LedgerEntryTypeEnum ATTEND = _$ledgerEntryTypeEnum_ATTEND;
  @BuiltValueEnumConst(wireName: r'REVERSAL')
  static const LedgerEntryTypeEnum REVERSAL = _$ledgerEntryTypeEnum_REVERSAL;
  @BuiltValueEnumConst(wireName: r'ADJUST_MANUAL')
  static const LedgerEntryTypeEnum ADJUST_MANUAL = _$ledgerEntryTypeEnum_ADJUST_MANUAL;
  @BuiltValueEnumConst(wireName: r'MIGRATION_OPENING')
  static const LedgerEntryTypeEnum MIGRATION_OPENING = _$ledgerEntryTypeEnum_MIGRATION_OPENING;

  static Serializer<LedgerEntryTypeEnum> get serializer => _$ledgerEntryTypeEnumSerializer;

  const LedgerEntryTypeEnum._(String name): super(name);

  static BuiltSet<LedgerEntryTypeEnum> get values => _$ledgerEntryTypeEnumValues;
  static LedgerEntryTypeEnum valueOf(String name) => _$ledgerEntryTypeEnumValueOf(name);
}

