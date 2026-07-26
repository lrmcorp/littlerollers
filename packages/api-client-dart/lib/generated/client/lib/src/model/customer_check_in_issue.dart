//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_check_in_issue.g.dart';

/// CustomerCheckInIssue
///
/// Properties:
/// * [id] 
/// * [purpose] 
/// * [bookingId] 
/// * [notBeforeAt] 
/// * [expiresAt] 
/// * [status] 
/// * [version] 
/// * [token] - Returned only once; never log, persist as plaintext, or send to analytics.
/// * [qrPayload] 
/// * [passUrl] 
/// * [maskedCustomerPhone] 
/// * [whatsappUrl] 
/// * [message] 
/// * [idempotentReplay] 
@BuiltValue()
abstract class CustomerCheckInIssue implements Built<CustomerCheckInIssue, CustomerCheckInIssueBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'purpose')
  JsonObject? get purpose;

  @BuiltValueField(wireName: r'bookingId')
  String get bookingId;

  @BuiltValueField(wireName: r'notBeforeAt')
  DateTime get notBeforeAt;

  @BuiltValueField(wireName: r'expiresAt')
  DateTime get expiresAt;

  @BuiltValueField(wireName: r'status')
  CustomerCheckInIssueStatusEnum get status;
  // enum statusEnum {  ACTIVE,  USED,  REVOKED,  };

  @BuiltValueField(wireName: r'version')
  int get version;

  /// Returned only once; never log, persist as plaintext, or send to analytics.
  @BuiltValueField(wireName: r'token')
  String? get token;

  @BuiltValueField(wireName: r'qrPayload')
  String? get qrPayload;

  @BuiltValueField(wireName: r'passUrl')
  String? get passUrl;

  @BuiltValueField(wireName: r'maskedCustomerPhone')
  String? get maskedCustomerPhone;

  @BuiltValueField(wireName: r'whatsappUrl')
  String? get whatsappUrl;

  @BuiltValueField(wireName: r'message')
  String? get message;

  @BuiltValueField(wireName: r'idempotentReplay')
  bool get idempotentReplay;

  CustomerCheckInIssue._();

  factory CustomerCheckInIssue([void updates(CustomerCheckInIssueBuilder b)]) = _$CustomerCheckInIssue;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerCheckInIssueBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerCheckInIssue> get serializer => _$CustomerCheckInIssueSerializer();
}

class _$CustomerCheckInIssueSerializer implements PrimitiveSerializer<CustomerCheckInIssue> {
  @override
  final Iterable<Type> types = const [CustomerCheckInIssue, _$CustomerCheckInIssue];

  @override
  final String wireName = r'CustomerCheckInIssue';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerCheckInIssue object, {
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
    yield r'bookingId';
    yield serializers.serialize(
      object.bookingId,
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
      specifiedType: const FullType(CustomerCheckInIssueStatusEnum),
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
    yield r'qrPayload';
    yield object.qrPayload == null ? null : serializers.serialize(
      object.qrPayload,
      specifiedType: const FullType.nullable(String),
    );
    yield r'passUrl';
    yield object.passUrl == null ? null : serializers.serialize(
      object.passUrl,
      specifiedType: const FullType.nullable(String),
    );
    yield r'maskedCustomerPhone';
    yield object.maskedCustomerPhone == null ? null : serializers.serialize(
      object.maskedCustomerPhone,
      specifiedType: const FullType.nullable(String),
    );
    yield r'whatsappUrl';
    yield object.whatsappUrl == null ? null : serializers.serialize(
      object.whatsappUrl,
      specifiedType: const FullType.nullable(String),
    );
    yield r'message';
    yield object.message == null ? null : serializers.serialize(
      object.message,
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
    CustomerCheckInIssue object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerCheckInIssueBuilder result,
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
        case r'bookingId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.bookingId = valueDes;
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
            specifiedType: const FullType(CustomerCheckInIssueStatusEnum),
          ) as CustomerCheckInIssueStatusEnum;
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
        case r'qrPayload':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.qrPayload = valueDes;
          break;
        case r'passUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.passUrl = valueDes;
          break;
        case r'maskedCustomerPhone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.maskedCustomerPhone = valueDes;
          break;
        case r'whatsappUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.whatsappUrl = valueDes;
          break;
        case r'message':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.message = valueDes;
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
  CustomerCheckInIssue deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerCheckInIssueBuilder();
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

class CustomerCheckInIssueStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const CustomerCheckInIssueStatusEnum ACTIVE = _$customerCheckInIssueStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'USED')
  static const CustomerCheckInIssueStatusEnum USED = _$customerCheckInIssueStatusEnum_USED;
  @BuiltValueEnumConst(wireName: r'REVOKED')
  static const CustomerCheckInIssueStatusEnum REVOKED = _$customerCheckInIssueStatusEnum_REVOKED;

  static Serializer<CustomerCheckInIssueStatusEnum> get serializer => _$customerCheckInIssueStatusEnumSerializer;

  const CustomerCheckInIssueStatusEnum._(String name): super(name);

  static BuiltSet<CustomerCheckInIssueStatusEnum> get values => _$customerCheckInIssueStatusEnumValues;
  static CustomerCheckInIssueStatusEnum valueOf(String name) => _$customerCheckInIssueStatusEnumValueOf(name);
}

