//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'private_image_metadata.g.dart';

/// PrivateImageMetadata
///
/// Properties:
/// * [fileName] 
/// * [mimeType] 
/// * [sizeBytes] 
/// * [sha256] 
@BuiltValue(instantiable: false)
abstract class PrivateImageMetadata  {
  @BuiltValueField(wireName: r'fileName')
  String get fileName;

  @BuiltValueField(wireName: r'mimeType')
  PrivateImageMetadataMimeTypeEnum get mimeType;
  // enum mimeTypeEnum {  image/jpeg,  image/png,  image/webp,  };

  @BuiltValueField(wireName: r'sizeBytes')
  int get sizeBytes;

  @BuiltValueField(wireName: r'sha256')
  String get sha256;

  @BuiltValueSerializer(custom: true)
  static Serializer<PrivateImageMetadata> get serializer => _$PrivateImageMetadataSerializer();
}

class _$PrivateImageMetadataSerializer implements PrimitiveSerializer<PrivateImageMetadata> {
  @override
  final Iterable<Type> types = const [PrivateImageMetadata];

  @override
  final String wireName = r'PrivateImageMetadata';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PrivateImageMetadata object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'fileName';
    yield serializers.serialize(
      object.fileName,
      specifiedType: const FullType(String),
    );
    yield r'mimeType';
    yield serializers.serialize(
      object.mimeType,
      specifiedType: const FullType(PrivateImageMetadataMimeTypeEnum),
    );
    yield r'sizeBytes';
    yield serializers.serialize(
      object.sizeBytes,
      specifiedType: const FullType(int),
    );
    yield r'sha256';
    yield serializers.serialize(
      object.sha256,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PrivateImageMetadata object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  @override
  PrivateImageMetadata deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.deserialize(serialized, specifiedType: FullType($PrivateImageMetadata)) as $PrivateImageMetadata;
  }
}

/// a concrete implementation of [PrivateImageMetadata], since [PrivateImageMetadata] is not instantiable
@BuiltValue(instantiable: true)
abstract class $PrivateImageMetadata implements PrivateImageMetadata, Built<$PrivateImageMetadata, $PrivateImageMetadataBuilder> {
  $PrivateImageMetadata._();

  factory $PrivateImageMetadata([void Function($PrivateImageMetadataBuilder)? updates]) = _$$PrivateImageMetadata;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults($PrivateImageMetadataBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<$PrivateImageMetadata> get serializer => _$$PrivateImageMetadataSerializer();
}

class _$$PrivateImageMetadataSerializer implements PrimitiveSerializer<$PrivateImageMetadata> {
  @override
  final Iterable<Type> types = const [$PrivateImageMetadata, _$$PrivateImageMetadata];

  @override
  final String wireName = r'$PrivateImageMetadata';

  @override
  Object serialize(
    Serializers serializers,
    $PrivateImageMetadata object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.serialize(object, specifiedType: FullType(PrivateImageMetadata))!;
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PrivateImageMetadataBuilder result,
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
        case r'mimeType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PrivateImageMetadataMimeTypeEnum),
          ) as PrivateImageMetadataMimeTypeEnum;
          result.mimeType = valueDes;
          break;
        case r'sizeBytes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sizeBytes = valueDes;
          break;
        case r'sha256':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sha256 = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  $PrivateImageMetadata deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = $PrivateImageMetadataBuilder();
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

class PrivateImageMetadataMimeTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'image/jpeg')
  static const PrivateImageMetadataMimeTypeEnum imageSlashJpeg = _$privateImageMetadataMimeTypeEnum_imageSlashJpeg;
  @BuiltValueEnumConst(wireName: r'image/png')
  static const PrivateImageMetadataMimeTypeEnum imageSlashPng = _$privateImageMetadataMimeTypeEnum_imageSlashPng;
  @BuiltValueEnumConst(wireName: r'image/webp')
  static const PrivateImageMetadataMimeTypeEnum imageSlashWebp = _$privateImageMetadataMimeTypeEnum_imageSlashWebp;

  static Serializer<PrivateImageMetadataMimeTypeEnum> get serializer => _$privateImageMetadataMimeTypeEnumSerializer;

  const PrivateImageMetadataMimeTypeEnum._(String name): super(name);

  static BuiltSet<PrivateImageMetadataMimeTypeEnum> get values => _$privateImageMetadataMimeTypeEnumValues;
  static PrivateImageMetadataMimeTypeEnum valueOf(String name) => _$privateImageMetadataMimeTypeEnumValueOf(name);
}

