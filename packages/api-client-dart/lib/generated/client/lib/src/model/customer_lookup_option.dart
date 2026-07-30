//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/customer_lookup_option_metadata.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_lookup_option.g.dart';

/// CustomerLookupOption
///
/// Properties:
/// * [id] 
/// * [label] 
/// * [description] 
/// * [metadata] 
@BuiltValue()
abstract class CustomerLookupOption implements Built<CustomerLookupOption, CustomerLookupOptionBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'label')
  String get label;

  @BuiltValueField(wireName: r'description')
  String get description;

  @BuiltValueField(wireName: r'metadata')
  CustomerLookupOptionMetadata get metadata;

  CustomerLookupOption._();

  factory CustomerLookupOption([void updates(CustomerLookupOptionBuilder b)]) = _$CustomerLookupOption;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerLookupOptionBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerLookupOption> get serializer => _$CustomerLookupOptionSerializer();
}

class _$CustomerLookupOptionSerializer implements PrimitiveSerializer<CustomerLookupOption> {
  @override
  final Iterable<Type> types = const [CustomerLookupOption, _$CustomerLookupOption];

  @override
  final String wireName = r'CustomerLookupOption';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerLookupOption object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'label';
    yield serializers.serialize(
      object.label,
      specifiedType: const FullType(String),
    );
    yield r'description';
    yield serializers.serialize(
      object.description,
      specifiedType: const FullType(String),
    );
    yield r'metadata';
    yield serializers.serialize(
      object.metadata,
      specifiedType: const FullType(CustomerLookupOptionMetadata),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerLookupOption object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerLookupOptionBuilder result,
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
        case r'label':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.label = valueDes;
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.description = valueDes;
          break;
        case r'metadata':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerLookupOptionMetadata),
          ) as CustomerLookupOptionMetadata;
          result.metadata.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerLookupOption deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerLookupOptionBuilder();
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

