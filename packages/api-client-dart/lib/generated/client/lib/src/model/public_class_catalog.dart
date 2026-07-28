//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/public_schedule_summary.dart';
import 'package:openapi/src/model/public_branch.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/public_catalog_range.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_class_catalog.g.dart';

/// PublicClassCatalog
///
/// Properties:
/// * [branches] 
/// * [items] 
/// * [range] 
@BuiltValue()
abstract class PublicClassCatalog implements Built<PublicClassCatalog, PublicClassCatalogBuilder> {
  @BuiltValueField(wireName: r'branches')
  BuiltList<PublicBranch> get branches;

  @BuiltValueField(wireName: r'items')
  BuiltList<PublicScheduleSummary> get items;

  @BuiltValueField(wireName: r'range')
  PublicCatalogRange get range;

  PublicClassCatalog._();

  factory PublicClassCatalog([void updates(PublicClassCatalogBuilder b)]) = _$PublicClassCatalog;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PublicClassCatalogBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicClassCatalog> get serializer => _$PublicClassCatalogSerializer();
}

class _$PublicClassCatalogSerializer implements PrimitiveSerializer<PublicClassCatalog> {
  @override
  final Iterable<Type> types = const [PublicClassCatalog, _$PublicClassCatalog];

  @override
  final String wireName = r'PublicClassCatalog';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicClassCatalog object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'branches';
    yield serializers.serialize(
      object.branches,
      specifiedType: const FullType(BuiltList, [FullType(PublicBranch)]),
    );
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(PublicScheduleSummary)]),
    );
    yield r'range';
    yield serializers.serialize(
      object.range,
      specifiedType: const FullType(PublicCatalogRange),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicClassCatalog object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicClassCatalogBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'branches':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PublicBranch)]),
          ) as BuiltList<PublicBranch>;
          result.branches.replace(valueDes);
          break;
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PublicScheduleSummary)]),
          ) as BuiltList<PublicScheduleSummary>;
          result.items.replace(valueDes);
          break;
        case r'range':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PublicCatalogRange),
          ) as PublicCatalogRange;
          result.range.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PublicClassCatalog deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PublicClassCatalogBuilder();
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

