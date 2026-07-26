//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/identity_verification_document.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'list_identity_verifications200_response.g.dart';

/// ListIdentityVerifications200Response
///
/// Properties:
/// * [items] 
@BuiltValue()
abstract class ListIdentityVerifications200Response implements Built<ListIdentityVerifications200Response, ListIdentityVerifications200ResponseBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<IdentityVerificationDocument> get items;

  ListIdentityVerifications200Response._();

  factory ListIdentityVerifications200Response([void updates(ListIdentityVerifications200ResponseBuilder b)]) = _$ListIdentityVerifications200Response;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ListIdentityVerifications200ResponseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ListIdentityVerifications200Response> get serializer => _$ListIdentityVerifications200ResponseSerializer();
}

class _$ListIdentityVerifications200ResponseSerializer implements PrimitiveSerializer<ListIdentityVerifications200Response> {
  @override
  final Iterable<Type> types = const [ListIdentityVerifications200Response, _$ListIdentityVerifications200Response];

  @override
  final String wireName = r'ListIdentityVerifications200Response';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ListIdentityVerifications200Response object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(IdentityVerificationDocument)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ListIdentityVerifications200Response object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ListIdentityVerifications200ResponseBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(IdentityVerificationDocument)]),
          ) as BuiltList<IdentityVerificationDocument>;
          result.items.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ListIdentityVerifications200Response deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ListIdentityVerifications200ResponseBuilder();
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

