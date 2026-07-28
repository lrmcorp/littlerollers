//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/identity_verification_review_summary.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/identity_verification_review_case.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'identity_verification_review_page.g.dart';

/// IdentityVerificationReviewPage
///
/// Properties:
/// * [items] 
/// * [summary] 
/// * [page] 
/// * [generatedAt] 
@BuiltValue()
abstract class IdentityVerificationReviewPage implements Built<IdentityVerificationReviewPage, IdentityVerificationReviewPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<IdentityVerificationReviewCase> get items;

  @BuiltValueField(wireName: r'summary')
  IdentityVerificationReviewSummary get summary;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  @BuiltValueField(wireName: r'generatedAt')
  DateTime get generatedAt;

  IdentityVerificationReviewPage._();

  factory IdentityVerificationReviewPage([void updates(IdentityVerificationReviewPageBuilder b)]) = _$IdentityVerificationReviewPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(IdentityVerificationReviewPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<IdentityVerificationReviewPage> get serializer => _$IdentityVerificationReviewPageSerializer();
}

class _$IdentityVerificationReviewPageSerializer implements PrimitiveSerializer<IdentityVerificationReviewPage> {
  @override
  final Iterable<Type> types = const [IdentityVerificationReviewPage, _$IdentityVerificationReviewPage];

  @override
  final String wireName = r'IdentityVerificationReviewPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    IdentityVerificationReviewPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(IdentityVerificationReviewCase)]),
    );
    yield r'summary';
    yield serializers.serialize(
      object.summary,
      specifiedType: const FullType(IdentityVerificationReviewSummary),
    );
    yield r'page';
    yield serializers.serialize(
      object.page,
      specifiedType: const FullType(CursorPageMeta),
    );
    yield r'generatedAt';
    yield serializers.serialize(
      object.generatedAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    IdentityVerificationReviewPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required IdentityVerificationReviewPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(IdentityVerificationReviewCase)]),
          ) as BuiltList<IdentityVerificationReviewCase>;
          result.items.replace(valueDes);
          break;
        case r'summary':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(IdentityVerificationReviewSummary),
          ) as IdentityVerificationReviewSummary;
          result.summary.replace(valueDes);
          break;
        case r'page':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CursorPageMeta),
          ) as CursorPageMeta;
          result.page.replace(valueDes);
          break;
        case r'generatedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.generatedAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  IdentityVerificationReviewPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = IdentityVerificationReviewPageBuilder();
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

