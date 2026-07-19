//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/effective_setting.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'effective_setting_page.g.dart';

/// EffectiveSettingPage
///
/// Properties:
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class EffectiveSettingPage implements Built<EffectiveSettingPage, EffectiveSettingPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<EffectiveSetting> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  EffectiveSettingPage._();

  factory EffectiveSettingPage([void updates(EffectiveSettingPageBuilder b)]) = _$EffectiveSettingPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(EffectiveSettingPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<EffectiveSettingPage> get serializer => _$EffectiveSettingPageSerializer();
}

class _$EffectiveSettingPageSerializer implements PrimitiveSerializer<EffectiveSettingPage> {
  @override
  final Iterable<Type> types = const [EffectiveSettingPage, _$EffectiveSettingPage];

  @override
  final String wireName = r'EffectiveSettingPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    EffectiveSettingPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(EffectiveSetting)]),
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
    EffectiveSettingPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required EffectiveSettingPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(EffectiveSetting)]),
          ) as BuiltList<EffectiveSetting>;
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
  EffectiveSettingPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = EffectiveSettingPageBuilder();
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

