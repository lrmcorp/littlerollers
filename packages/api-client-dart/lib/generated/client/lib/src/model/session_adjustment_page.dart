//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/session_adjustment.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:openapi/src/model/session_adjustment_summary.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'session_adjustment_page.g.dart';

/// SessionAdjustmentPage
///
/// Properties:
/// * [items] 
/// * [summary] 
/// * [page] 
@BuiltValue()
abstract class SessionAdjustmentPage implements Built<SessionAdjustmentPage, SessionAdjustmentPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<SessionAdjustment> get items;

  @BuiltValueField(wireName: r'summary')
  SessionAdjustmentSummary get summary;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  SessionAdjustmentPage._();

  factory SessionAdjustmentPage([void updates(SessionAdjustmentPageBuilder b)]) = _$SessionAdjustmentPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SessionAdjustmentPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SessionAdjustmentPage> get serializer => _$SessionAdjustmentPageSerializer();
}

class _$SessionAdjustmentPageSerializer implements PrimitiveSerializer<SessionAdjustmentPage> {
  @override
  final Iterable<Type> types = const [SessionAdjustmentPage, _$SessionAdjustmentPage];

  @override
  final String wireName = r'SessionAdjustmentPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SessionAdjustmentPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(SessionAdjustment)]),
    );
    yield r'summary';
    yield serializers.serialize(
      object.summary,
      specifiedType: const FullType(SessionAdjustmentSummary),
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
    SessionAdjustmentPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SessionAdjustmentPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(SessionAdjustment)]),
          ) as BuiltList<SessionAdjustment>;
          result.items.replace(valueDes);
          break;
        case r'summary':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(SessionAdjustmentSummary),
          ) as SessionAdjustmentSummary;
          result.summary.replace(valueDes);
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
  SessionAdjustmentPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SessionAdjustmentPageBuilder();
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

