//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/assignment.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/page_page.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'assignment_page.g.dart';

/// AssignmentPage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class AssignmentPage implements Built<AssignmentPage, AssignmentPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<Assignment> get items;

  @BuiltValueField(wireName: r'page')
  PagePage get page;

  AssignmentPage._();

  factory AssignmentPage([void updates(AssignmentPageBuilder b)]) = _$AssignmentPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AssignmentPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AssignmentPage> get serializer => _$AssignmentPageSerializer();
}

class _$AssignmentPageSerializer implements PrimitiveSerializer<AssignmentPage> {
  @override
  final Iterable<Type> types = const [AssignmentPage, _$AssignmentPage];

  @override
  final String wireName = r'AssignmentPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AssignmentPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(Assignment)]),
    );
    yield r'page';
    yield serializers.serialize(
      object.page,
      specifiedType: const FullType(PagePage),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AssignmentPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AssignmentPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(Assignment)]),
          ) as BuiltList<Assignment>;
          result.items.replace(valueDes);
          break;
        case r'page':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PagePage),
          ) as PagePage;
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
  AssignmentPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AssignmentPageBuilder();
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

