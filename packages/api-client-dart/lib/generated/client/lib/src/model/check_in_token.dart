//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'check_in_token.g.dart';

/// CheckInToken
///
/// Properties:
/// * [id] 
/// * [purpose] 
/// * [audienceType] 
/// * [resourceType] 
/// * [resourceId] 
/// * [notBeforeAt] 
/// * [expiresAt] 
/// * [status] 
/// * [version] 
/// * [token] - Returned only at first issuance; never log, persist, or send to analytics.
/// * [idempotentReplay] 
@BuiltValue()
abstract class CheckInToken implements Built<CheckInToken, CheckInTokenBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'purpose')
  CheckInTokenPurposeEnum get purpose;
  // enum purposeEnum {  INSTRUCTOR_CHECK_IN,  CUSTOMER_CHECK_IN,  };

  @BuiltValueField(wireName: r'audienceType')
  CheckInTokenAudienceTypeEnum get audienceType;
  // enum audienceTypeEnum {  USER,  BOOKING,  };

  @BuiltValueField(wireName: r'resourceType')
  CheckInTokenResourceTypeEnum get resourceType;
  // enum resourceTypeEnum {  CLASS_SLOT,  BOOKING,  };

  @BuiltValueField(wireName: r'resourceId')
  String get resourceId;

  @BuiltValueField(wireName: r'notBeforeAt')
  DateTime get notBeforeAt;

  @BuiltValueField(wireName: r'expiresAt')
  DateTime get expiresAt;

  @BuiltValueField(wireName: r'status')
  CheckInTokenStatusEnum get status;
  // enum statusEnum {  ACTIVE,  USED,  REVOKED,  EXPIRED,  };

  @BuiltValueField(wireName: r'version')
  int get version;

  /// Returned only at first issuance; never log, persist, or send to analytics.
  @BuiltValueField(wireName: r'token')
  String? get token;

  @BuiltValueField(wireName: r'idempotentReplay')
  bool get idempotentReplay;

  CheckInToken._();

  factory CheckInToken([void updates(CheckInTokenBuilder b)]) = _$CheckInToken;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CheckInTokenBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CheckInToken> get serializer => _$CheckInTokenSerializer();
}

class _$CheckInTokenSerializer implements PrimitiveSerializer<CheckInToken> {
  @override
  final Iterable<Type> types = const [CheckInToken, _$CheckInToken];

  @override
  final String wireName = r'CheckInToken';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CheckInToken object, {
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
      specifiedType: const FullType(CheckInTokenPurposeEnum),
    );
    yield r'audienceType';
    yield serializers.serialize(
      object.audienceType,
      specifiedType: const FullType(CheckInTokenAudienceTypeEnum),
    );
    yield r'resourceType';
    yield serializers.serialize(
      object.resourceType,
      specifiedType: const FullType(CheckInTokenResourceTypeEnum),
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
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(CheckInTokenStatusEnum),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
    yield r'token';
    yield object.token == null ? null : serializers.serialize(
      object.token,
      specifiedType: const FullType.nullable(String),
    );
    yield r'idempotentReplay';
    yield serializers.serialize(
      object.idempotentReplay,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CheckInToken object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CheckInTokenBuilder result,
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
            specifiedType: const FullType(CheckInTokenPurposeEnum),
          ) as CheckInTokenPurposeEnum;
          result.purpose = valueDes;
          break;
        case r'audienceType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CheckInTokenAudienceTypeEnum),
          ) as CheckInTokenAudienceTypeEnum;
          result.audienceType = valueDes;
          break;
        case r'resourceType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CheckInTokenResourceTypeEnum),
          ) as CheckInTokenResourceTypeEnum;
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
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CheckInTokenStatusEnum),
          ) as CheckInTokenStatusEnum;
          result.status = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        case r'token':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.token = valueDes;
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
  CheckInToken deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CheckInTokenBuilder();
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

class CheckInTokenPurposeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'INSTRUCTOR_CHECK_IN')
  static const CheckInTokenPurposeEnum INSTRUCTOR_CHECK_IN = _$checkInTokenPurposeEnum_INSTRUCTOR_CHECK_IN;
  @BuiltValueEnumConst(wireName: r'CUSTOMER_CHECK_IN')
  static const CheckInTokenPurposeEnum CUSTOMER_CHECK_IN = _$checkInTokenPurposeEnum_CUSTOMER_CHECK_IN;

  static Serializer<CheckInTokenPurposeEnum> get serializer => _$checkInTokenPurposeEnumSerializer;

  const CheckInTokenPurposeEnum._(String name): super(name);

  static BuiltSet<CheckInTokenPurposeEnum> get values => _$checkInTokenPurposeEnumValues;
  static CheckInTokenPurposeEnum valueOf(String name) => _$checkInTokenPurposeEnumValueOf(name);
}

class CheckInTokenAudienceTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'USER')
  static const CheckInTokenAudienceTypeEnum USER = _$checkInTokenAudienceTypeEnum_USER;
  @BuiltValueEnumConst(wireName: r'BOOKING')
  static const CheckInTokenAudienceTypeEnum BOOKING = _$checkInTokenAudienceTypeEnum_BOOKING;

  static Serializer<CheckInTokenAudienceTypeEnum> get serializer => _$checkInTokenAudienceTypeEnumSerializer;

  const CheckInTokenAudienceTypeEnum._(String name): super(name);

  static BuiltSet<CheckInTokenAudienceTypeEnum> get values => _$checkInTokenAudienceTypeEnumValues;
  static CheckInTokenAudienceTypeEnum valueOf(String name) => _$checkInTokenAudienceTypeEnumValueOf(name);
}

class CheckInTokenResourceTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'CLASS_SLOT')
  static const CheckInTokenResourceTypeEnum CLASS_SLOT = _$checkInTokenResourceTypeEnum_CLASS_SLOT;
  @BuiltValueEnumConst(wireName: r'BOOKING')
  static const CheckInTokenResourceTypeEnum BOOKING = _$checkInTokenResourceTypeEnum_BOOKING;

  static Serializer<CheckInTokenResourceTypeEnum> get serializer => _$checkInTokenResourceTypeEnumSerializer;

  const CheckInTokenResourceTypeEnum._(String name): super(name);

  static BuiltSet<CheckInTokenResourceTypeEnum> get values => _$checkInTokenResourceTypeEnumValues;
  static CheckInTokenResourceTypeEnum valueOf(String name) => _$checkInTokenResourceTypeEnumValueOf(name);
}

class CheckInTokenStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const CheckInTokenStatusEnum ACTIVE = _$checkInTokenStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'USED')
  static const CheckInTokenStatusEnum USED = _$checkInTokenStatusEnum_USED;
  @BuiltValueEnumConst(wireName: r'REVOKED')
  static const CheckInTokenStatusEnum REVOKED = _$checkInTokenStatusEnum_REVOKED;
  @BuiltValueEnumConst(wireName: r'EXPIRED')
  static const CheckInTokenStatusEnum EXPIRED = _$checkInTokenStatusEnum_EXPIRED;

  static Serializer<CheckInTokenStatusEnum> get serializer => _$checkInTokenStatusEnumSerializer;

  const CheckInTokenStatusEnum._(String name): super(name);

  static BuiltSet<CheckInTokenStatusEnum> get values => _$checkInTokenStatusEnumValues;
  static CheckInTokenStatusEnum valueOf(String name) => _$checkInTokenStatusEnumValueOf(name);
}

