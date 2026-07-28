//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/public_branch.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/public_package_summary.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_package_catalog.g.dart';

/// PublicPackageCatalog
///
/// Properties:
/// * [branches] 
/// * [items] 
@BuiltValue()
abstract class PublicPackageCatalog implements Built<PublicPackageCatalog, PublicPackageCatalogBuilder> {
  @BuiltValueField(wireName: r'branches')
  BuiltList<PublicBranch> get branches;

  @BuiltValueField(wireName: r'items')
  BuiltList<PublicPackageSummary> get items;

  PublicPackageCatalog._();

  factory PublicPackageCatalog([void updates(PublicPackageCatalogBuilder b)]) = _$PublicPackageCatalog;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PublicPackageCatalogBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicPackageCatalog> get serializer => _$PublicPackageCatalogSerializer();
}

class _$PublicPackageCatalogSerializer implements PrimitiveSerializer<PublicPackageCatalog> {
  @override
  final Iterable<Type> types = const [PublicPackageCatalog, _$PublicPackageCatalog];

  @override
  final String wireName = r'PublicPackageCatalog';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicPackageCatalog object, {
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
      specifiedType: const FullType(BuiltList, [FullType(PublicPackageSummary)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicPackageCatalog object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicPackageCatalogBuilder result,
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
            specifiedType: const FullType(BuiltList, [FullType(PublicPackageSummary)]),
          ) as BuiltList<PublicPackageSummary>;
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
  PublicPackageCatalog deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PublicPackageCatalogBuilder();
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

