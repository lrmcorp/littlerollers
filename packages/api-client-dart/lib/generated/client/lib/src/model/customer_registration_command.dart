//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/private_image_metadata.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_registration_command.g.dart';

/// CustomerRegistrationCommand
///
/// Properties:
/// * [displayName] 
/// * [phone] 
/// * [email] 
/// * [password] 
/// * [consent] 
/// * [selfie] 
/// * [ktp] 
@BuiltValue()
abstract class CustomerRegistrationCommand implements Built<CustomerRegistrationCommand, CustomerRegistrationCommandBuilder> {
  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  @BuiltValueField(wireName: r'phone')
  String get phone;

  @BuiltValueField(wireName: r'email')
  String get email;

  @BuiltValueField(wireName: r'password')
  String get password;

  @BuiltValueField(wireName: r'consent')
  CustomerRegistrationCommandConsentEnum get consent;
  // enum consentEnum {  true,  };

  @BuiltValueField(wireName: r'selfie')
  PrivateImageMetadata get selfie;

  @BuiltValueField(wireName: r'ktp')
  PrivateImageMetadata get ktp;

  CustomerRegistrationCommand._();

  factory CustomerRegistrationCommand([void updates(CustomerRegistrationCommandBuilder b)]) = _$CustomerRegistrationCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerRegistrationCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerRegistrationCommand> get serializer => _$CustomerRegistrationCommandSerializer();
}

class _$CustomerRegistrationCommandSerializer implements PrimitiveSerializer<CustomerRegistrationCommand> {
  @override
  final Iterable<Type> types = const [CustomerRegistrationCommand, _$CustomerRegistrationCommand];

  @override
  final String wireName = r'CustomerRegistrationCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerRegistrationCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'displayName';
    yield serializers.serialize(
      object.displayName,
      specifiedType: const FullType(String),
    );
    yield r'phone';
    yield serializers.serialize(
      object.phone,
      specifiedType: const FullType(String),
    );
    yield r'email';
    yield serializers.serialize(
      object.email,
      specifiedType: const FullType(String),
    );
    yield r'password';
    yield serializers.serialize(
      object.password,
      specifiedType: const FullType(String),
    );
    yield r'consent';
    yield serializers.serialize(
      object.consent,
      specifiedType: const FullType(CustomerRegistrationCommandConsentEnum),
    );
    yield r'selfie';
    yield serializers.serialize(
      object.selfie,
      specifiedType: const FullType(PrivateImageMetadata),
    );
    yield r'ktp';
    yield serializers.serialize(
      object.ktp,
      specifiedType: const FullType(PrivateImageMetadata),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerRegistrationCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerRegistrationCommandBuilder result,
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
        case r'phone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.phone = valueDes;
          break;
        case r'email':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.email = valueDes;
          break;
        case r'password':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.password = valueDes;
          break;
        case r'consent':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerRegistrationCommandConsentEnum),
          ) as CustomerRegistrationCommandConsentEnum;
          result.consent = valueDes;
          break;
        case r'selfie':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PrivateImageMetadata),
          ) as PrivateImageMetadata;
          result.selfie = valueDes;
          break;
        case r'ktp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PrivateImageMetadata),
          ) as PrivateImageMetadata;
          result.ktp = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerRegistrationCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerRegistrationCommandBuilder();
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

class CustomerRegistrationCommandConsentEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'true')
  static const CustomerRegistrationCommandConsentEnum true_ = _$customerRegistrationCommandConsentEnum_true_;

  static Serializer<CustomerRegistrationCommandConsentEnum> get serializer => _$customerRegistrationCommandConsentEnumSerializer;

  const CustomerRegistrationCommandConsentEnum._(String name): super(name);

  static BuiltSet<CustomerRegistrationCommandConsentEnum> get values => _$customerRegistrationCommandConsentEnumValues;
  static CustomerRegistrationCommandConsentEnum valueOf(String name) => _$customerRegistrationCommandConsentEnumValueOf(name);
}

