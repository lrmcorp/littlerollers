//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/package.dart';
import 'package:openapi/src/model/package_management_summary.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'package_page.g.dart';

/// PackagePage
///
/// Properties:
/// * [items] 
/// * [summary] 
/// * [page] 
@BuiltValue()
abstract class PackagePage implements Built<PackagePage, PackagePageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<Package> get items;

  @BuiltValueField(wireName: r'summary')
  PackageManagementSummary get summary;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  PackagePage._();

  factory PackagePage([void updates(PackagePageBuilder b)]) = _$PackagePage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PackagePageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PackagePage> get serializer => _$PackagePageSerializer();
}

class _$PackagePageSerializer implements PrimitiveSerializer<PackagePage> {
  @override
  final Iterable<Type> types = const [PackagePage, _$PackagePage];

  @override
  final String wireName = r'PackagePage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PackagePage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(Package)]),
    );
    yield r'summary';
    yield serializers.serialize(
      object.summary,
      specifiedType: const FullType(PackageManagementSummary),
    );
    yield r'page';
    yield serializers.serialize(
      object.page,
      specifiedType: const FullType(CursorPageMeta),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PackagePage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PackagePageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(Package)]),
          ) as BuiltList<Package>;
          result.items.replace(valueDes);
          break;
        case r'summary':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PackageManagementSummary),
          ) as PackageManagementSummary;
          result.summary.replace(valueDes);
          break;
        case r'page':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CursorPageMeta),
          ) as CursorPageMeta;
          result.page.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PackagePage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PackagePageBuilder();
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

