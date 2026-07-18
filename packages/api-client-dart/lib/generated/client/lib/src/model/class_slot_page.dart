//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/class_slot.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'class_slot_page.g.dart';

/// ClassSlotPage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class ClassSlotPage implements Built<ClassSlotPage, ClassSlotPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<ClassSlot> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  ClassSlotPage._();

  factory ClassSlotPage([void updates(ClassSlotPageBuilder b)]) = _$ClassSlotPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ClassSlotPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ClassSlotPage> get serializer => _$ClassSlotPageSerializer();
}

class _$ClassSlotPageSerializer implements PrimitiveSerializer<ClassSlotPage> {
  @override
  final Iterable<Type> types = const [ClassSlotPage, _$ClassSlotPage];

  @override
  final String wireName = r'ClassSlotPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ClassSlotPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(ClassSlot)]),
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
    ClassSlotPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ClassSlotPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(ClassSlot)]),
          ) as BuiltList<ClassSlot>;
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
  ClassSlotPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ClassSlotPageBuilder();
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

