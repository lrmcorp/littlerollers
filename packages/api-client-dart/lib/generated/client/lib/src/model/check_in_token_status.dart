//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/check_in_token_status_branch.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'check_in_token_status.g.dart';

/// CheckInTokenStatus
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
abstract class CheckInTokenStatus implements Built<CheckInTokenStatus, CheckInTokenStatusBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'purpose')
  CheckInTokenStatusPurposeEnum get purpose;
  // enum purposeEnum {  CUSTOMER_CHECK_IN,  INSTRUCTOR_CHECK_IN,  };

  @BuiltValueField(wireName: r'resourceType')
  CheckInTokenStatusResourceTypeEnum get resourceType;
  // enum resourceTypeEnum {  BOOKING,  CLASS_SLOT,  };

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
  CheckInTokenStatusStatusEnum get status;
  // enum statusEnum {  ACTIVE,  USED,  REVOKED,  EXPIRED,  };

  @BuiltValueField(wireName: r'version')
  int get version;

  @BuiltValueField(wireName: r'customerName')
  String? get customerName;

  @BuiltValueField(wireName: r'className')
  String get className;

  @BuiltValueField(wireName: r'branch')
  CheckInTokenStatusBranch get branch;

  @BuiltValueField(wireName: r'startAt')
  DateTime get startAt;

  @BuiltValueField(wireName: r'endAt')
  DateTime get endAt;

  CheckInTokenStatus._();

  factory CheckInTokenStatus([void updates(CheckInTokenStatusBuilder b)]) = _$CheckInTokenStatus;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CheckInTokenStatusBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CheckInTokenStatus> get serializer => _$CheckInTokenStatusSerializer();
}

class _$CheckInTokenStatusSerializer implements PrimitiveSerializer<CheckInTokenStatus> {
  @override
  final Iterable<Type> types = const [CheckInTokenStatus, _$CheckInTokenStatus];

  @override
  final String wireName = r'CheckInTokenStatus';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CheckInTokenStatus object, {
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
      specifiedType: const FullType(CheckInTokenStatusPurposeEnum),
    );
    yield r'resourceType';
    yield serializers.serialize(
      object.resourceType,
      specifiedType: const FullType(CheckInTokenStatusResourceTypeEnum),
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
        specifiedType: const FullType(DateTime),
      );
    }
    if (object.revokedAt != null) {
      yield r'revokedAt';
      yield serializers.serialize(
        object.revokedAt,
        specifiedType: const FullType(DateTime),
      );
    }
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(CheckInTokenStatusStatusEnum),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
    if (object.customerName != null) {
      yield r'customerName';
      yield serializers.serialize(
        object.customerName,
        specifiedType: const FullType(String),
      );
    }
    yield r'className';
    yield serializers.serialize(
      object.className,
      specifiedType: const FullType(String),
    );
    yield r'branch';
    yield serializers.serialize(
      object.branch,
      specifiedType: const FullType(CheckInTokenStatusBranch),
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
    CheckInTokenStatus object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CheckInTokenStatusBuilder result,
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
            specifiedType: const FullType(CheckInTokenStatusPurposeEnum),
          ) as CheckInTokenStatusPurposeEnum;
          result.purpose = valueDes;
          break;
        case r'resourceType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CheckInTokenStatusResourceTypeEnum),
          ) as CheckInTokenStatusResourceTypeEnum;
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
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.usedAt = valueDes;
          break;
        case r'revokedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.revokedAt = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CheckInTokenStatusStatusEnum),
          ) as CheckInTokenStatusStatusEnum;
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
            specifiedType: const FullType(CheckInTokenStatusBranch),
          ) as CheckInTokenStatusBranch;
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
  CheckInTokenStatus deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CheckInTokenStatusBuilder();
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

class CheckInTokenStatusPurposeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'CUSTOMER_CHECK_IN')
  static const CheckInTokenStatusPurposeEnum CUSTOMER_CHECK_IN = _$checkInTokenStatusPurposeEnum_CUSTOMER_CHECK_IN;
  @BuiltValueEnumConst(wireName: r'INSTRUCTOR_CHECK_IN')
  static const CheckInTokenStatusPurposeEnum INSTRUCTOR_CHECK_IN = _$checkInTokenStatusPurposeEnum_INSTRUCTOR_CHECK_IN;

  static Serializer<CheckInTokenStatusPurposeEnum> get serializer => _$checkInTokenStatusPurposeEnumSerializer;

  const CheckInTokenStatusPurposeEnum._(String name): super(name);

  static BuiltSet<CheckInTokenStatusPurposeEnum> get values => _$checkInTokenStatusPurposeEnumValues;
  static CheckInTokenStatusPurposeEnum valueOf(String name) => _$checkInTokenStatusPurposeEnumValueOf(name);
}

class CheckInTokenStatusResourceTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'BOOKING')
  static const CheckInTokenStatusResourceTypeEnum BOOKING = _$checkInTokenStatusResourceTypeEnum_BOOKING;
  @BuiltValueEnumConst(wireName: r'CLASS_SLOT')
  static const CheckInTokenStatusResourceTypeEnum CLASS_SLOT = _$checkInTokenStatusResourceTypeEnum_CLASS_SLOT;

  static Serializer<CheckInTokenStatusResourceTypeEnum> get serializer => _$checkInTokenStatusResourceTypeEnumSerializer;

  const CheckInTokenStatusResourceTypeEnum._(String name): super(name);

  static BuiltSet<CheckInTokenStatusResourceTypeEnum> get values => _$checkInTokenStatusResourceTypeEnumValues;
  static CheckInTokenStatusResourceTypeEnum valueOf(String name) => _$checkInTokenStatusResourceTypeEnumValueOf(name);
}

class CheckInTokenStatusStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const CheckInTokenStatusStatusEnum ACTIVE = _$checkInTokenStatusStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'USED')
  static const CheckInTokenStatusStatusEnum USED = _$checkInTokenStatusStatusEnum_USED;
  @BuiltValueEnumConst(wireName: r'REVOKED')
  static const CheckInTokenStatusStatusEnum REVOKED = _$checkInTokenStatusStatusEnum_REVOKED;
  @BuiltValueEnumConst(wireName: r'EXPIRED')
  static const CheckInTokenStatusStatusEnum EXPIRED = _$checkInTokenStatusStatusEnum_EXPIRED;

  static Serializer<CheckInTokenStatusStatusEnum> get serializer => _$checkInTokenStatusStatusEnumSerializer;

  const CheckInTokenStatusStatusEnum._(String name): super(name);

  static BuiltSet<CheckInTokenStatusStatusEnum> get values => _$checkInTokenStatusStatusEnumValues;
  static CheckInTokenStatusStatusEnum valueOf(String name) => _$checkInTokenStatusStatusEnumValueOf(name);
}

