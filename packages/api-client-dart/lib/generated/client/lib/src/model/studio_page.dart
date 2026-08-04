//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:openapi/src/model/studio.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'studio_page.g.dart';

/// StudioPage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class StudioPage implements Built<StudioPage, StudioPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<Studio> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  StudioPage._();

  factory StudioPage([void updates(StudioPageBuilder b)]) = _$StudioPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(StudioPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<StudioPage> get serializer => _$StudioPageSerializer();
}

class _$StudioPageSerializer implements PrimitiveSerializer<StudioPage> {
  @override
  final Iterable<Type> types = const [StudioPage, _$StudioPage];

  @override
  final String wireName = r'StudioPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    StudioPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(Studio)]),
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
    StudioPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required StudioPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(Studio)]),
          ) as BuiltList<Studio>;
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
  StudioPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = StudioPageBuilder();
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

