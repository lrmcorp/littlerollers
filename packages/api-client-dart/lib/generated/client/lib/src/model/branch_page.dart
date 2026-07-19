//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/branch.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'branch_page.g.dart';

/// BranchPage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class BranchPage implements Built<BranchPage, BranchPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<Branch> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  BranchPage._();

  factory BranchPage([void updates(BranchPageBuilder b)]) = _$BranchPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BranchPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BranchPage> get serializer => _$BranchPageSerializer();
}

class _$BranchPageSerializer implements PrimitiveSerializer<BranchPage> {
  @override
  final Iterable<Type> types = const [BranchPage, _$BranchPage];

  @override
  final String wireName = r'BranchPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BranchPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(Branch)]),
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
    BranchPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BranchPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(Branch)]),
          ) as BuiltList<Branch>;
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
  BranchPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BranchPageBuilder();
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

