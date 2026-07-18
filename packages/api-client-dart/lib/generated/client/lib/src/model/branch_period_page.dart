//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/branch_period.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'branch_period_page.g.dart';

/// BranchPeriodPage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class BranchPeriodPage implements Built<BranchPeriodPage, BranchPeriodPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<BranchPeriod> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  BranchPeriodPage._();

  factory BranchPeriodPage([void updates(BranchPeriodPageBuilder b)]) = _$BranchPeriodPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BranchPeriodPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BranchPeriodPage> get serializer => _$BranchPeriodPageSerializer();
}

class _$BranchPeriodPageSerializer implements PrimitiveSerializer<BranchPeriodPage> {
  @override
  final Iterable<Type> types = const [BranchPeriodPage, _$BranchPeriodPage];

  @override
  final String wireName = r'BranchPeriodPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BranchPeriodPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(BranchPeriod)]),
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
    BranchPeriodPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BranchPeriodPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(BranchPeriod)]),
          ) as BuiltList<BranchPeriod>;
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
  BranchPeriodPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BranchPeriodPageBuilder();
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

