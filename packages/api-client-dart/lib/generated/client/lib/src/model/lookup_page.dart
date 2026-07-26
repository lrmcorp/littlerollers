//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/lookup_option.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'lookup_page.g.dart';

/// LookupPage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class LookupPage implements Built<LookupPage, LookupPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<LookupOption> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  LookupPage._();

  factory LookupPage([void updates(LookupPageBuilder b)]) = _$LookupPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(LookupPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<LookupPage> get serializer => _$LookupPageSerializer();
}

class _$LookupPageSerializer implements PrimitiveSerializer<LookupPage> {
  @override
  final Iterable<Type> types = const [LookupPage, _$LookupPage];

  @override
  final String wireName = r'LookupPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    LookupPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(LookupOption)]),
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
    LookupPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required LookupPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(LookupOption)]),
          ) as BuiltList<LookupOption>;
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
  LookupPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = LookupPageBuilder();
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

