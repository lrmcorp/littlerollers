//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'create_managed_customer_request.g.dart';

/// CreateManagedCustomerRequest
///
/// Properties:
/// * [displayName] 
/// * [email] 
/// * [phoneE164] 
/// * [preferredBranchId] 
/// * [password] 
/// * [passwordConfirmation] 
/// * [reason] 
/// * [profile] 
@BuiltValue()
abstract class CreateManagedCustomerRequest implements Built<CreateManagedCustomerRequest, CreateManagedCustomerRequestBuilder> {
  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  @BuiltValueField(wireName: r'email')
  String get email;

  @BuiltValueField(wireName: r'phoneE164')
  String get phoneE164;

  @BuiltValueField(wireName: r'preferredBranchId')
  String? get preferredBranchId;

  @BuiltValueField(wireName: r'password')
  String get password;

  @BuiltValueField(wireName: r'passwordConfirmation')
  String get passwordConfirmation;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  @BuiltValueField(wireName: r'profile')
  JsonObject? get profile;

  CreateManagedCustomerRequest._();

  factory CreateManagedCustomerRequest([void updates(CreateManagedCustomerRequestBuilder b)]) = _$CreateManagedCustomerRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CreateManagedCustomerRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CreateManagedCustomerRequest> get serializer => _$CreateManagedCustomerRequestSerializer();
}

class _$CreateManagedCustomerRequestSerializer implements PrimitiveSerializer<CreateManagedCustomerRequest> {
  @override
  final Iterable<Type> types = const [CreateManagedCustomerRequest, _$CreateManagedCustomerRequest];

  @override
  final String wireName = r'CreateManagedCustomerRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CreateManagedCustomerRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'displayName';
    yield serializers.serialize(
      object.displayName,
      specifiedType: const FullType(String),
    );
    yield r'email';
    yield serializers.serialize(
      object.email,
      specifiedType: const FullType(String),
    );
    yield r'phoneE164';
    yield serializers.serialize(
      object.phoneE164,
      specifiedType: const FullType(String),
    );
    if (object.preferredBranchId != null) {
      yield r'preferredBranchId';
      yield serializers.serialize(
        object.preferredBranchId,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'password';
    yield serializers.serialize(
      object.password,
      specifiedType: const FullType(String),
    );
    yield r'passwordConfirmation';
    yield serializers.serialize(
      object.passwordConfirmation,
      specifiedType: const FullType(String),
    );
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
    if (object.profile != null) {
      yield r'profile';
      yield serializers.serialize(
        object.profile,
        specifiedType: const FullType(JsonObject),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    CreateManagedCustomerRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CreateManagedCustomerRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'displayName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.displayName = valueDes;
          break;
        case r'email':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.email = valueDes;
          break;
        case r'phoneE164':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.phoneE164 = valueDes;
          break;
        case r'preferredBranchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.preferredBranchId = valueDes;
          break;
        case r'password':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.password = valueDes;
          break;
        case r'passwordConfirmation':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.passwordConfirmation = valueDes;
          break;
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        case r'profile':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(JsonObject),
          ) as JsonObject;
          result.profile = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CreateManagedCustomerRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CreateManagedCustomerRequestBuilder();
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

