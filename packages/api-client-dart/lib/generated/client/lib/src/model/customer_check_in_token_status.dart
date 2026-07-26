//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/check_in_result_branch.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_check_in_token_status.g.dart';

/// CustomerCheckInTokenStatus
///
/// Properties:
/// * [id] 
/// * [purpose] 
/// * [resourceType] 
/// * [resourceId] 
/// * [notBeforeAt] 
/// * [expiresAt] 
/// * [usedAt] 
/// * [revokedAt] 
/// * [status] 
/// * [version] 
/// * [customerName] 
/// * [className] 
/// * [branch] 
/// * [startAt] 
/// * [endAt] 
@BuiltValue()
abstract class CustomerCheckInTokenStatus implements Built<CustomerCheckInTokenStatus, CustomerCheckInTokenStatusBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'purpose')
  JsonObject? get purpose;

  @BuiltValueField(wireName: r'resourceType')
  JsonObject? get resourceType;

  @BuiltValueField(wireName: r'resourceId')
  String get resourceId;

  @BuiltValueField(wireName: r'notBeforeAt')
  DateTime get notBeforeAt;

  @BuiltValueField(wireName: r'expiresAt')
  DateTime get expiresAt;

  @BuiltValueField(wireName: r'usedAt')
  DateTime? get usedAt;

  @BuiltValueField(wireName: r'revokedAt')
  DateTime? get revokedAt;

  @BuiltValueField(wireName: r'status')
  CustomerCheckInTokenStatusStatusEnum get status;
  // enum statusEnum {  ACTIVE,  USED,  REVOKED,  EXPIRED,  };

  @BuiltValueField(wireName: r'version')
  int get version;

  @BuiltValueField(wireName: r'customerName')
  String get customerName;

  @BuiltValueField(wireName: r'className')
  String get className;

  @BuiltValueField(wireName: r'branch')
  CheckInResultBranch get branch;

  @BuiltValueField(wireName: r'startAt')
  DateTime get startAt;

  @BuiltValueField(wireName: r'endAt')
  DateTime get endAt;

  CustomerCheckInTokenStatus._();

  factory CustomerCheckInTokenStatus([void updates(CustomerCheckInTokenStatusBuilder b)]) = _$CustomerCheckInTokenStatus;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerCheckInTokenStatusBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerCheckInTokenStatus> get serializer => _$CustomerCheckInTokenStatusSerializer();
}

class _$CustomerCheckInTokenStatusSerializer implements PrimitiveSerializer<CustomerCheckInTokenStatus> {
  @override
  final Iterable<Type> types = const [CustomerCheckInTokenStatus, _$CustomerCheckInTokenStatus];

  @override
  final String wireName = r'CustomerCheckInTokenStatus';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerCheckInTokenStatus object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'purpose';
    yield object.purpose == null ? null : serializers.serialize(
      object.purpose,
      specifiedType: const FullType.nullable(JsonObject),
    );
    yield r'resourceType';
    yield object.resourceType == null ? null : serializers.serialize(
      object.resourceType,
      specifiedType: const FullType.nullable(JsonObject),
    );
    yield r'resourceId';
    yield serializers.serialize(
      object.resourceId,
      specifiedType: const FullType(String),
    );
    yield r'notBeforeAt';
    yield serializers.serialize(
      object.notBeforeAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'expiresAt';
    yield serializers.serialize(
      object.expiresAt,
      specifiedType: const FullType(DateTime),
    );
    if (object.usedAt != null) {
      yield r'usedAt';
      yield serializers.serialize(
        object.usedAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    if (object.revokedAt != null) {
      yield r'revokedAt';
      yield serializers.serialize(
        object.revokedAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(CustomerCheckInTokenStatusStatusEnum),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
    yield r'customerName';
    yield serializers.serialize(
      object.customerName,
      specifiedType: const FullType(String),
    );
    yield r'className';
    yield serializers.serialize(
      object.className,
      specifiedType: const FullType(String),
    );
    yield r'branch';
    yield serializers.serialize(
      object.branch,
      specifiedType: const FullType(CheckInResultBranch),
    );
    yield r'startAt';
    yield serializers.serialize(
      object.startAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'endAt';
    yield serializers.serialize(
      object.endAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerCheckInTokenStatus object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerCheckInTokenStatusBuilder result,
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
            specifiedType: const FullType.nullable(JsonObject),
          ) as JsonObject?;
          if (valueDes == null) continue;
          result.purpose = valueDes;
          break;
        case r'resourceType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(JsonObject),
          ) as JsonObject?;
          if (valueDes == null) continue;
          result.resourceType = valueDes;
          break;
        case r'resourceId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.resourceId = valueDes;
          break;
        case r'notBeforeAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.notBeforeAt = valueDes;
          break;
        case r'expiresAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.expiresAt = valueDes;
          break;
        case r'usedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.usedAt = valueDes;
          break;
        case r'revokedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.revokedAt = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerCheckInTokenStatusStatusEnum),
          ) as CustomerCheckInTokenStatusStatusEnum;
          result.status = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
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
  CustomerCheckInTokenStatus deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerCheckInTokenStatusBuilder();
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

class CustomerCheckInTokenStatusStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const CustomerCheckInTokenStatusStatusEnum ACTIVE = _$customerCheckInTokenStatusStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'USED')
  static const CustomerCheckInTokenStatusStatusEnum USED = _$customerCheckInTokenStatusStatusEnum_USED;
  @BuiltValueEnumConst(wireName: r'REVOKED')
  static const CustomerCheckInTokenStatusStatusEnum REVOKED = _$customerCheckInTokenStatusStatusEnum_REVOKED;
  @BuiltValueEnumConst(wireName: r'EXPIRED')
  static const CustomerCheckInTokenStatusStatusEnum EXPIRED = _$customerCheckInTokenStatusStatusEnum_EXPIRED;

  static Serializer<CustomerCheckInTokenStatusStatusEnum> get serializer => _$customerCheckInTokenStatusStatusEnumSerializer;

  const CustomerCheckInTokenStatusStatusEnum._(String name): super(name);

  static BuiltSet<CustomerCheckInTokenStatusStatusEnum> get values => _$customerCheckInTokenStatusStatusEnumValues;
  static CustomerCheckInTokenStatusStatusEnum valueOf(String name) => _$customerCheckInTokenStatusStatusEnumValueOf(name);
}

