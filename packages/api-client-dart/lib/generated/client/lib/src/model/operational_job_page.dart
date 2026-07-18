//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/operational_job.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'operational_job_page.g.dart';

/// OperationalJobPage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class OperationalJobPage implements Built<OperationalJobPage, OperationalJobPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<OperationalJob> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  OperationalJobPage._();

  factory OperationalJobPage([void updates(OperationalJobPageBuilder b)]) = _$OperationalJobPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OperationalJobPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OperationalJobPage> get serializer => _$OperationalJobPageSerializer();
}

class _$OperationalJobPageSerializer implements PrimitiveSerializer<OperationalJobPage> {
  @override
  final Iterable<Type> types = const [OperationalJobPage, _$OperationalJobPage];

  @override
  final String wireName = r'OperationalJobPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OperationalJobPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(OperationalJob)]),
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
    OperationalJobPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OperationalJobPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(OperationalJob)]),
          ) as BuiltList<OperationalJob>;
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
  OperationalJobPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OperationalJobPageBuilder();
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

