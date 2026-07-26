//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/role_catalog_item.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'role_catalog.g.dart';

/// RoleCatalog
///
/// Properties:
/// * [items] 
@BuiltValue()
abstract class RoleCatalog implements Built<RoleCatalog, RoleCatalogBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<RoleCatalogItem> get items;

  RoleCatalog._();

  factory RoleCatalog([void updates(RoleCatalogBuilder b)]) = _$RoleCatalog;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RoleCatalogBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RoleCatalog> get serializer => _$RoleCatalogSerializer();
}

class _$RoleCatalogSerializer implements PrimitiveSerializer<RoleCatalog> {
  @override
  final Iterable<Type> types = const [RoleCatalog, _$RoleCatalog];

  @override
  final String wireName = r'RoleCatalog';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RoleCatalog object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(RoleCatalogItem)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    RoleCatalog object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RoleCatalogBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(RoleCatalogItem)]),
          ) as BuiltList<RoleCatalogItem>;
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
  RoleCatalog deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RoleCatalogBuilder();
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

