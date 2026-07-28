//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'assignment_page_page.g.dart';

/// AssignmentPagePage
///
/// Properties:
/// * [nextCursor] 
/// * [hasMore] 
@BuiltValue()
abstract class AssignmentPagePage implements Built<AssignmentPagePage, AssignmentPagePageBuilder> {
  @BuiltValueField(wireName: r'nextCursor')
  String? get nextCursor;

  @BuiltValueField(wireName: r'hasMore')
  bool get hasMore;

  AssignmentPagePage._();

  factory AssignmentPagePage([void updates(AssignmentPagePageBuilder b)]) = _$AssignmentPagePage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AssignmentPagePageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AssignmentPagePage> get serializer => _$AssignmentPagePageSerializer();
}

class _$AssignmentPagePageSerializer implements PrimitiveSerializer<AssignmentPagePage> {
  @override
  final Iterable<Type> types = const [AssignmentPagePage, _$AssignmentPagePage];

  @override
  final String wireName = r'AssignmentPagePage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AssignmentPagePage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'nextCursor';
    yield object.nextCursor == null ? null : serializers.serialize(
      object.nextCursor,
      specifiedType: const FullType.nullable(String),
    );
    yield r'hasMore';
    yield serializers.serialize(
      object.hasMore,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AssignmentPagePage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AssignmentPagePageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'nextCursor':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.nextCursor = valueDes;
          break;
        case r'hasMore':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.hasMore = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AssignmentPagePage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AssignmentPagePageBuilder();
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

