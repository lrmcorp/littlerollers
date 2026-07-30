//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_lookup_option_metadata.g.dart';

/// CustomerLookupOptionMetadata
///
/// Properties:
/// * [verificationStatus] 
/// * [eligiblePackageCount] 
/// * [branchId] 
@BuiltValue()
abstract class CustomerLookupOptionMetadata implements Built<CustomerLookupOptionMetadata, CustomerLookupOptionMetadataBuilder> {
  @BuiltValueField(wireName: r'verificationStatus')
  CustomerLookupOptionMetadataVerificationStatusEnum get verificationStatus;
  // enum verificationStatusEnum {  APPROVED,  };

  @BuiltValueField(wireName: r'eligiblePackageCount')
  int get eligiblePackageCount;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  CustomerLookupOptionMetadata._();

  factory CustomerLookupOptionMetadata([void updates(CustomerLookupOptionMetadataBuilder b)]) = _$CustomerLookupOptionMetadata;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerLookupOptionMetadataBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerLookupOptionMetadata> get serializer => _$CustomerLookupOptionMetadataSerializer();
}

class _$CustomerLookupOptionMetadataSerializer implements PrimitiveSerializer<CustomerLookupOptionMetadata> {
  @override
  final Iterable<Type> types = const [CustomerLookupOptionMetadata, _$CustomerLookupOptionMetadata];

  @override
  final String wireName = r'CustomerLookupOptionMetadata';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerLookupOptionMetadata object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'verificationStatus';
    yield serializers.serialize(
      object.verificationStatus,
      specifiedType: const FullType(CustomerLookupOptionMetadataVerificationStatusEnum),
    );
    yield r'eligiblePackageCount';
    yield serializers.serialize(
      object.eligiblePackageCount,
      specifiedType: const FullType(int),
    );
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerLookupOptionMetadata object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerLookupOptionMetadataBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'verificationStatus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerLookupOptionMetadataVerificationStatusEnum),
          ) as CustomerLookupOptionMetadataVerificationStatusEnum;
          result.verificationStatus = valueDes;
          break;
        case r'eligiblePackageCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.eligiblePackageCount = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerLookupOptionMetadata deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerLookupOptionMetadataBuilder();
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

class CustomerLookupOptionMetadataVerificationStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'APPROVED')
  static const CustomerLookupOptionMetadataVerificationStatusEnum APPROVED = _$customerLookupOptionMetadataVerificationStatusEnum_APPROVED;

  static Serializer<CustomerLookupOptionMetadataVerificationStatusEnum> get serializer => _$customerLookupOptionMetadataVerificationStatusEnumSerializer;

  const CustomerLookupOptionMetadataVerificationStatusEnum._(String name): super(name);

  static BuiltSet<CustomerLookupOptionMetadataVerificationStatusEnum> get values => _$customerLookupOptionMetadataVerificationStatusEnumValues;
  static CustomerLookupOptionMetadataVerificationStatusEnum valueOf(String name) => _$customerLookupOptionMetadataVerificationStatusEnumValueOf(name);
}

