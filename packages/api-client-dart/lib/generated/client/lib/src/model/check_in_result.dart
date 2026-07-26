//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/check_in_result_branch.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'check_in_result.g.dart';

/// CheckInResult
///
/// Properties:
/// * [id] 
/// * [purpose] 
/// * [resourceId] 
/// * [status] 
/// * [checkedInAt] 
/// * [auditLogId] 
/// * [auditReference] 
/// * [idempotentReplay] 
/// * [customerName] 
/// * [className] 
/// * [branch] 
/// * [startAt] 
/// * [endAt] 
@BuiltValue()
abstract class CheckInResult implements Built<CheckInResult, CheckInResultBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'purpose')
  CheckInResultPurposeEnum get purpose;
  // enum purposeEnum {  INSTRUCTOR_CHECK_IN,  CUSTOMER_CHECK_IN,  CUSTOMER_BACKFILL,  };

  @BuiltValueField(wireName: r'resourceId')
  String get resourceId;

  @BuiltValueField(wireName: r'status')
  JsonObject? get status;

  @BuiltValueField(wireName: r'checkedInAt')
  DateTime get checkedInAt;

  @BuiltValueField(wireName: r'auditLogId')
  String get auditLogId;

  @BuiltValueField(wireName: r'auditReference')
  String get auditReference;

  @BuiltValueField(wireName: r'idempotentReplay')
  bool get idempotentReplay;

  @BuiltValueField(wireName: r'customerName')
  String? get customerName;

  @BuiltValueField(wireName: r'className')
  String? get className;

  @BuiltValueField(wireName: r'branch')
  CheckInResultBranch? get branch;

  @BuiltValueField(wireName: r'startAt')
  DateTime? get startAt;

  @BuiltValueField(wireName: r'endAt')
  DateTime? get endAt;

  CheckInResult._();

  factory CheckInResult([void updates(CheckInResultBuilder b)]) = _$CheckInResult;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CheckInResultBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CheckInResult> get serializer => _$CheckInResultSerializer();
}

class _$CheckInResultSerializer implements PrimitiveSerializer<CheckInResult> {
  @override
  final Iterable<Type> types = const [CheckInResult, _$CheckInResult];

  @override
  final String wireName = r'CheckInResult';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CheckInResult object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'purpose';
    yield serializers.serialize(
      object.purpose,
      specifiedType: const FullType(CheckInResultPurposeEnum),
    );
    yield r'resourceId';
    yield serializers.serialize(
      object.resourceId,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield object.status == null ? null : serializers.serialize(
      object.status,
      specifiedType: const FullType.nullable(JsonObject),
    );
    yield r'checkedInAt';
    yield serializers.serialize(
      object.checkedInAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'auditLogId';
    yield serializers.serialize(
      object.auditLogId,
      specifiedType: const FullType(String),
    );
    yield r'auditReference';
    yield serializers.serialize(
      object.auditReference,
      specifiedType: const FullType(String),
    );
    yield r'idempotentReplay';
    yield serializers.serialize(
      object.idempotentReplay,
      specifiedType: const FullType(bool),
    );
    if (object.customerName != null) {
      yield r'customerName';
      yield serializers.serialize(
        object.customerName,
        specifiedType: const FullType(String),
      );
    }
    if (object.className != null) {
      yield r'className';
      yield serializers.serialize(
        object.className,
        specifiedType: const FullType(String),
      );
    }
    if (object.branch != null) {
      yield r'branch';
      yield serializers.serialize(
        object.branch,
        specifiedType: const FullType(CheckInResultBranch),
      );
    }
    if (object.startAt != null) {
      yield r'startAt';
      yield serializers.serialize(
        object.startAt,
        specifiedType: const FullType(DateTime),
      );
    }
    if (object.endAt != null) {
      yield r'endAt';
      yield serializers.serialize(
        object.endAt,
        specifiedType: const FullType(DateTime),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    CheckInResult object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CheckInResultBuilder result,
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
        case r'purpose':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CheckInResultPurposeEnum),
          ) as CheckInResultPurposeEnum;
          result.purpose = valueDes;
          break;
        case r'resourceId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.resourceId = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(JsonObject),
          ) as JsonObject?;
          if (valueDes == null) continue;
          result.status = valueDes;
          break;
        case r'checkedInAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.checkedInAt = valueDes;
          break;
        case r'auditLogId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.auditLogId = valueDes;
          break;
        case r'auditReference':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.auditReference = valueDes;
          break;
        case r'idempotentReplay':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.idempotentReplay = valueDes;
          break;
        case r'customerName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.customerName = valueDes;
          break;
        case r'className':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.className = valueDes;
          break;
        case r'branch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CheckInResultBranch),
          ) as CheckInResultBranch;
          result.branch.replace(valueDes);
          break;
        case r'startAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.startAt = valueDes;
          break;
        case r'endAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.endAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CheckInResult deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CheckInResultBuilder();
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

class CheckInResultPurposeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'INSTRUCTOR_CHECK_IN')
  static const CheckInResultPurposeEnum INSTRUCTOR_CHECK_IN = _$checkInResultPurposeEnum_INSTRUCTOR_CHECK_IN;
  @BuiltValueEnumConst(wireName: r'CUSTOMER_CHECK_IN')
  static const CheckInResultPurposeEnum CUSTOMER_CHECK_IN = _$checkInResultPurposeEnum_CUSTOMER_CHECK_IN;
  @BuiltValueEnumConst(wireName: r'CUSTOMER_BACKFILL')
  static const CheckInResultPurposeEnum CUSTOMER_BACKFILL = _$checkInResultPurposeEnum_CUSTOMER_BACKFILL;

  static Serializer<CheckInResultPurposeEnum> get serializer => _$checkInResultPurposeEnumSerializer;

  const CheckInResultPurposeEnum._(String name): super(name);

  static BuiltSet<CheckInResultPurposeEnum> get values => _$checkInResultPurposeEnumValues;
  static CheckInResultPurposeEnum valueOf(String name) => _$checkInResultPurposeEnumValueOf(name);
}

