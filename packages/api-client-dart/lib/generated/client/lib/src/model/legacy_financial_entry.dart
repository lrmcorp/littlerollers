//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/legacy_financial_entry_actor.dart';
import 'package:openapi/src/model/legacy_financial_entry_purchase.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/user_access_role_assignment_branch.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'legacy_financial_entry.g.dart';

/// LegacyFinancialEntry
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [purchaseId] 
/// * [actorUserId] 
/// * [parentId] 
/// * [type] 
/// * [amountRp] 
/// * [occurredAt] 
/// * [description] 
/// * [sourceTypeCode] 
/// * [historical] 
/// * [branch] 
/// * [purchase] 
/// * [actor] 
@BuiltValue()
abstract class LegacyFinancialEntry implements Built<LegacyFinancialEntry, LegacyFinancialEntryBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String? get branchId;

  @BuiltValueField(wireName: r'purchaseId')
  String? get purchaseId;

  @BuiltValueField(wireName: r'actorUserId')
  String? get actorUserId;

  @BuiltValueField(wireName: r'parentId')
  String? get parentId;

  @BuiltValueField(wireName: r'type')
  LegacyFinancialEntryTypeEnum get type;
  // enum typeEnum {  INCOME,  EXPENSE,  };

  @BuiltValueField(wireName: r'amountRp')
  int get amountRp;

  @BuiltValueField(wireName: r'occurredAt')
  DateTime get occurredAt;

  @BuiltValueField(wireName: r'description')
  String? get description;

  @BuiltValueField(wireName: r'sourceTypeCode')
  String get sourceTypeCode;

  @BuiltValueField(wireName: r'historical')
  bool get historical;

  @BuiltValueField(wireName: r'branch')
  UserAccessRoleAssignmentBranch? get branch;

  @BuiltValueField(wireName: r'purchase')
  LegacyFinancialEntryPurchase? get purchase;

  @BuiltValueField(wireName: r'actor')
  LegacyFinancialEntryActor? get actor;

  LegacyFinancialEntry._();

  factory LegacyFinancialEntry([void updates(LegacyFinancialEntryBuilder b)]) = _$LegacyFinancialEntry;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(LegacyFinancialEntryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<LegacyFinancialEntry> get serializer => _$LegacyFinancialEntrySerializer();
}

class _$LegacyFinancialEntrySerializer implements PrimitiveSerializer<LegacyFinancialEntry> {
  @override
  final Iterable<Type> types = const [LegacyFinancialEntry, _$LegacyFinancialEntry];

  @override
  final String wireName = r'LegacyFinancialEntry';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    LegacyFinancialEntry object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    if (object.branchId != null) {
      yield r'branchId';
      yield serializers.serialize(
        object.branchId,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.purchaseId != null) {
      yield r'purchaseId';
      yield serializers.serialize(
        object.purchaseId,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.actorUserId != null) {
      yield r'actorUserId';
      yield serializers.serialize(
        object.actorUserId,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.parentId != null) {
      yield r'parentId';
      yield serializers.serialize(
        object.parentId,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'type';
    yield serializers.serialize(
      object.type,
      specifiedType: const FullType(LegacyFinancialEntryTypeEnum),
    );
    yield r'amountRp';
    yield serializers.serialize(
      object.amountRp,
      specifiedType: const FullType(int),
    );
    yield r'occurredAt';
    yield serializers.serialize(
      object.occurredAt,
      specifiedType: const FullType(DateTime),
    );
    if (object.description != null) {
      yield r'description';
      yield serializers.serialize(
        object.description,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'sourceTypeCode';
    yield serializers.serialize(
      object.sourceTypeCode,
      specifiedType: const FullType(String),
    );
    yield r'historical';
    yield serializers.serialize(
      object.historical,
      specifiedType: const FullType(bool),
    );
    if (object.branch != null) {
      yield r'branch';
      yield serializers.serialize(
        object.branch,
        specifiedType: const FullType(UserAccessRoleAssignmentBranch),
      );
    }
    if (object.purchase != null) {
      yield r'purchase';
      yield serializers.serialize(
        object.purchase,
        specifiedType: const FullType(LegacyFinancialEntryPurchase),
      );
    }
    if (object.actor != null) {
      yield r'actor';
      yield serializers.serialize(
        object.actor,
        specifiedType: const FullType(LegacyFinancialEntryActor),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    LegacyFinancialEntry object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required LegacyFinancialEntryBuilder result,
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
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.branchId = valueDes;
          break;
        case r'purchaseId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.purchaseId = valueDes;
          break;
        case r'actorUserId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.actorUserId = valueDes;
          break;
        case r'parentId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.parentId = valueDes;
          break;
        case r'type':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(LegacyFinancialEntryTypeEnum),
          ) as LegacyFinancialEntryTypeEnum;
          result.type = valueDes;
          break;
        case r'amountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.amountRp = valueDes;
          break;
        case r'occurredAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.occurredAt = valueDes;
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.description = valueDes;
          break;
        case r'sourceTypeCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sourceTypeCode = valueDes;
          break;
        case r'historical':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.historical = valueDes;
          break;
        case r'branch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(UserAccessRoleAssignmentBranch),
          ) as UserAccessRoleAssignmentBranch;
          result.branch.replace(valueDes);
          break;
        case r'purchase':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(LegacyFinancialEntryPurchase),
          ) as LegacyFinancialEntryPurchase;
          result.purchase.replace(valueDes);
          break;
        case r'actor':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(LegacyFinancialEntryActor),
          ) as LegacyFinancialEntryActor;
          result.actor.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  LegacyFinancialEntry deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = LegacyFinancialEntryBuilder();
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

class LegacyFinancialEntryTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'INCOME')
  static const LegacyFinancialEntryTypeEnum INCOME = _$legacyFinancialEntryTypeEnum_INCOME;
  @BuiltValueEnumConst(wireName: r'EXPENSE')
  static const LegacyFinancialEntryTypeEnum EXPENSE = _$legacyFinancialEntryTypeEnum_EXPENSE;

  static Serializer<LegacyFinancialEntryTypeEnum> get serializer => _$legacyFinancialEntryTypeEnumSerializer;

  const LegacyFinancialEntryTypeEnum._(String name): super(name);

  static BuiltSet<LegacyFinancialEntryTypeEnum> get values => _$legacyFinancialEntryTypeEnumValues;
  static LegacyFinancialEntryTypeEnum valueOf(String name) => _$legacyFinancialEntryTypeEnumValueOf(name);
}

