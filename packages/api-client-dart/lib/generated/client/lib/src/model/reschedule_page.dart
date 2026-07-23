//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/reschedule.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'reschedule_page.g.dart';

/// ReschedulePage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class ReschedulePage implements Built<ReschedulePage, ReschedulePageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<Reschedule> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  ReschedulePage._();

  factory ReschedulePage([void updates(ReschedulePageBuilder b)]) = _$ReschedulePage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ReschedulePageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ReschedulePage> get serializer => _$ReschedulePageSerializer();
}

class _$ReschedulePageSerializer implements PrimitiveSerializer<ReschedulePage> {
  @override
  final Iterable<Type> types = const [ReschedulePage, _$ReschedulePage];

  @override
  final String wireName = r'ReschedulePage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ReschedulePage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(Reschedule)]),
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
    ReschedulePage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ReschedulePageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(Reschedule)]),
          ) as BuiltList<Reschedule>;
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
  ReschedulePage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ReschedulePageBuilder();
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

