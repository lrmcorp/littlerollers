//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/private_image_metadata.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'replace_my_identity_document_request.g.dart';

/// ReplaceMyIdentityDocumentRequest
///
/// Properties:
/// * [fileName] 
/// * [mimeType] 
/// * [sizeBytes] 
/// * [sha256] 
/// * [expectedVersion] 
@BuiltValue()
abstract class ReplaceMyIdentityDocumentRequest implements PrivateImageMetadata, Built<ReplaceMyIdentityDocumentRequest, ReplaceMyIdentityDocumentRequestBuilder> {
  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  ReplaceMyIdentityDocumentRequest._();

  factory ReplaceMyIdentityDocumentRequest([void updates(ReplaceMyIdentityDocumentRequestBuilder b)]) = _$ReplaceMyIdentityDocumentRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ReplaceMyIdentityDocumentRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ReplaceMyIdentityDocumentRequest> get serializer => _$ReplaceMyIdentityDocumentRequestSerializer();
}

class _$ReplaceMyIdentityDocumentRequestSerializer implements PrimitiveSerializer<ReplaceMyIdentityDocumentRequest> {
  @override
  final Iterable<Type> types = const [ReplaceMyIdentityDocumentRequest, _$ReplaceMyIdentityDocumentRequest];

  @override
  final String wireName = r'ReplaceMyIdentityDocumentRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ReplaceMyIdentityDocumentRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'fileName';
    yield serializers.serialize(
      object.fileName,
      specifiedType: const FullType(String),
    );
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
    yield r'mimeType';
    yield serializers.serialize(
      object.mimeType,
      specifiedType: const FullType(PrivateImageMetadataMimeTypeEnum),
    );
    yield r'sha256';
    yield serializers.serialize(
      object.sha256,
      specifiedType: const FullType(String),
    );
    yield r'sizeBytes';
    yield serializers.serialize(
      object.sizeBytes,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ReplaceMyIdentityDocumentRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ReplaceMyIdentityDocumentRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'fileName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.fileName = valueDes;
          break;
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
          break;
        case r'mimeType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PrivateImageMetadataMimeTypeEnum),
          ) as PrivateImageMetadataMimeTypeEnum;
          result.mimeType = valueDes;
          break;
        case r'sha256':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sha256 = valueDes;
          break;
        case r'sizeBytes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sizeBytes = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ReplaceMyIdentityDocumentRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ReplaceMyIdentityDocumentRequestBuilder();
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

class ReplaceMyIdentityDocumentRequestMimeTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'image/jpeg')
  static const ReplaceMyIdentityDocumentRequestMimeTypeEnum imageSlashJpeg = _$replaceMyIdentityDocumentRequestMimeTypeEnum_imageSlashJpeg;
  @BuiltValueEnumConst(wireName: r'image/png')
  static const ReplaceMyIdentityDocumentRequestMimeTypeEnum imageSlashPng = _$replaceMyIdentityDocumentRequestMimeTypeEnum_imageSlashPng;
  @BuiltValueEnumConst(wireName: r'image/webp')
  static const ReplaceMyIdentityDocumentRequestMimeTypeEnum imageSlashWebp = _$replaceMyIdentityDocumentRequestMimeTypeEnum_imageSlashWebp;

  static Serializer<ReplaceMyIdentityDocumentRequestMimeTypeEnum> get serializer => _$replaceMyIdentityDocumentRequestMimeTypeEnumSerializer;

  const ReplaceMyIdentityDocumentRequestMimeTypeEnum._(String name): super(name);

  static BuiltSet<ReplaceMyIdentityDocumentRequestMimeTypeEnum> get values => _$replaceMyIdentityDocumentRequestMimeTypeEnumValues;
  static ReplaceMyIdentityDocumentRequestMimeTypeEnum valueOf(String name) => _$replaceMyIdentityDocumentRequestMimeTypeEnumValueOf(name);
}

