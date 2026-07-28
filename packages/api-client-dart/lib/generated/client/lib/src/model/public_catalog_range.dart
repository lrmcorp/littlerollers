//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_catalog_range.g.dart';

/// PublicCatalogRange
///
/// Properties:
/// * [from] 
/// * [until] 
@BuiltValue()
abstract class PublicCatalogRange implements Built<PublicCatalogRange, PublicCatalogRangeBuilder> {
  @BuiltValueField(wireName: r'from')
  DateTime get from;

  @BuiltValueField(wireName: r'until')
  DateTime get until;

  PublicCatalogRange._();

  factory PublicCatalogRange([void updates(PublicCatalogRangeBuilder b)]) = _$PublicCatalogRange;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PublicCatalogRangeBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicCatalogRange> get serializer => _$PublicCatalogRangeSerializer();
}

class _$PublicCatalogRangeSerializer implements PrimitiveSerializer<PublicCatalogRange> {
  @override
  final Iterable<Type> types = const [PublicCatalogRange, _$PublicCatalogRange];

  @override
  final String wireName = r'PublicCatalogRange';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicCatalogRange object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'from';
    yield serializers.serialize(
      object.from,
      specifiedType: const FullType(DateTime),
    );
    yield r'until';
    yield serializers.serialize(
      object.until,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicCatalogRange object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicCatalogRangeBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'from':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.from = valueDes;
          break;
        case r'until':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.until = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PublicCatalogRange deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PublicCatalogRangeBuilder();
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

