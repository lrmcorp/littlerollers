//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/migration_batch_result.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'migration_batch_page.g.dart';

/// MigrationBatchPage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class MigrationBatchPage implements Built<MigrationBatchPage, MigrationBatchPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<MigrationBatchResult> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  MigrationBatchPage._();

  factory MigrationBatchPage([void updates(MigrationBatchPageBuilder b)]) = _$MigrationBatchPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(MigrationBatchPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<MigrationBatchPage> get serializer => _$MigrationBatchPageSerializer();
}

class _$MigrationBatchPageSerializer implements PrimitiveSerializer<MigrationBatchPage> {
  @override
  final Iterable<Type> types = const [MigrationBatchPage, _$MigrationBatchPage];

  @override
  final String wireName = r'MigrationBatchPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    MigrationBatchPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(MigrationBatchResult)]),
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
    MigrationBatchPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required MigrationBatchPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(MigrationBatchResult)]),
          ) as BuiltList<MigrationBatchResult>;
          result.items.replace(valueDes);
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
  MigrationBatchPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = MigrationBatchPageBuilder();
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

