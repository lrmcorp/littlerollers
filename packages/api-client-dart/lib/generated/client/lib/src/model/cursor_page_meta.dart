//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'cursor_page_meta.g.dart';

/// CursorPageMeta
///
/// Properties:
/// * [nextCursor] 
/// * [hasMore] 
@BuiltValue()
abstract class CursorPageMeta implements Built<CursorPageMeta, CursorPageMetaBuilder> {
  @BuiltValueField(wireName: r'nextCursor')
  String? get nextCursor;

  @BuiltValueField(wireName: r'hasMore')
  bool get hasMore;

  CursorPageMeta._();

  factory CursorPageMeta([void updates(CursorPageMetaBuilder b)]) = _$CursorPageMeta;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CursorPageMetaBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CursorPageMeta> get serializer => _$CursorPageMetaSerializer();
}

class _$CursorPageMetaSerializer implements PrimitiveSerializer<CursorPageMeta> {
  @override
  final Iterable<Type> types = const [CursorPageMeta, _$CursorPageMeta];

  @override
  final String wireName = r'CursorPageMeta';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CursorPageMeta object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.nextCursor != null) {
      yield r'nextCursor';
      yield serializers.serialize(
        object.nextCursor,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'hasMore';
    yield serializers.serialize(
      object.hasMore,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CursorPageMeta object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CursorPageMetaBuilder result,
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
  CursorPageMeta deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CursorPageMetaBuilder();
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

