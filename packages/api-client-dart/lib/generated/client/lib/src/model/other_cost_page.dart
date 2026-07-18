//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:openapi/src/model/other_cost.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'other_cost_page.g.dart';

/// OtherCostPage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class OtherCostPage implements Built<OtherCostPage, OtherCostPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<OtherCost> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  OtherCostPage._();

  factory OtherCostPage([void updates(OtherCostPageBuilder b)]) = _$OtherCostPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OtherCostPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OtherCostPage> get serializer => _$OtherCostPageSerializer();
}

class _$OtherCostPageSerializer implements PrimitiveSerializer<OtherCostPage> {
  @override
  final Iterable<Type> types = const [OtherCostPage, _$OtherCostPage];

  @override
  final String wireName = r'OtherCostPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OtherCostPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(OtherCost)]),
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
    OtherCostPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OtherCostPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(OtherCost)]),
          ) as BuiltList<OtherCost>;
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
  OtherCostPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OtherCostPageBuilder();
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

