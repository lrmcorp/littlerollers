//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/booking.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/booking_management_summary.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'booking_page.g.dart';

/// BookingPage
///
/// Properties:
/// * [items] 
/// * [summary] 
/// * [page] 
@BuiltValue()
abstract class BookingPage implements Built<BookingPage, BookingPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<Booking> get items;

  @BuiltValueField(wireName: r'summary')
  BookingManagementSummary get summary;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  BookingPage._();

  factory BookingPage([void updates(BookingPageBuilder b)]) = _$BookingPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BookingPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BookingPage> get serializer => _$BookingPageSerializer();
}

class _$BookingPageSerializer implements PrimitiveSerializer<BookingPage> {
  @override
  final Iterable<Type> types = const [BookingPage, _$BookingPage];

  @override
  final String wireName = r'BookingPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BookingPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(Booking)]),
    );
    yield r'summary';
    yield serializers.serialize(
      object.summary,
      specifiedType: const FullType(BookingManagementSummary),
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
    BookingPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BookingPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(Booking)]),
          ) as BuiltList<Booking>;
          result.items.replace(valueDes);
          break;
        case r'summary':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BookingManagementSummary),
          ) as BookingManagementSummary;
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
  BookingPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BookingPageBuilder();
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

