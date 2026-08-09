//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/financial_report_page_items_inner.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/financial_report.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'financial_report_page.g.dart';

/// FinancialReportPage
///
/// Properties:
/// * [report] 
/// * [items] 
/// * [page] 
@BuiltValue()
abstract class FinancialReportPage implements Built<FinancialReportPage, FinancialReportPageBuilder> {
  @BuiltValueField(wireName: r'report')
  FinancialReport get report;

  @BuiltValueField(wireName: r'items')
  BuiltList<FinancialReportPageItemsInner> get items;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  FinancialReportPage._();

  factory FinancialReportPage([void updates(FinancialReportPageBuilder b)]) = _$FinancialReportPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FinancialReportPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FinancialReportPage> get serializer => _$FinancialReportPageSerializer();
}

class _$FinancialReportPageSerializer implements PrimitiveSerializer<FinancialReportPage> {
  @override
  final Iterable<Type> types = const [FinancialReportPage, _$FinancialReportPage];

  @override
  final String wireName = r'FinancialReportPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FinancialReportPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'report';
    yield serializers.serialize(
      object.report,
      specifiedType: const FullType(FinancialReport),
    );
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(FinancialReportPageItemsInner)]),
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
    FinancialReportPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FinancialReportPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'report':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(FinancialReport),
          ) as FinancialReport;
          result.report.replace(valueDes);
          break;
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(FinancialReportPageItemsInner)]),
          ) as BuiltList<FinancialReportPageItemsInner>;
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
  FinancialReportPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FinancialReportPageBuilder();
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

