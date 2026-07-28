//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'booking_attendance.g.dart';

/// BookingAttendance
///
/// Properties:
/// * [checkedInAt] 
/// * [source_] 
@BuiltValue()
abstract class BookingAttendance implements Built<BookingAttendance, BookingAttendanceBuilder> {
  @BuiltValueField(wireName: r'checkedInAt')
  DateTime? get checkedInAt;

  @BuiltValueField(wireName: r'source')
  BookingAttendanceSource_Enum? get source_;
  // enum source_Enum {  QR,  BACKFILL,  };

  BookingAttendance._();

  factory BookingAttendance([void updates(BookingAttendanceBuilder b)]) = _$BookingAttendance;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BookingAttendanceBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BookingAttendance> get serializer => _$BookingAttendanceSerializer();
}

class _$BookingAttendanceSerializer implements PrimitiveSerializer<BookingAttendance> {
  @override
  final Iterable<Type> types = const [BookingAttendance, _$BookingAttendance];

  @override
  final String wireName = r'BookingAttendance';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BookingAttendance object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.checkedInAt != null) {
      yield r'checkedInAt';
      yield serializers.serialize(
        object.checkedInAt,
        specifiedType: const FullType(DateTime),
      );
    }
    if (object.source_ != null) {
      yield r'source';
      yield serializers.serialize(
        object.source_,
        specifiedType: const FullType(BookingAttendanceSource_Enum),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    BookingAttendance object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BookingAttendanceBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'checkedInAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.checkedInAt = valueDes;
          break;
        case r'source':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BookingAttendanceSource_Enum),
          ) as BookingAttendanceSource_Enum;
          result.source_ = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  BookingAttendance deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BookingAttendanceBuilder();
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

class BookingAttendanceSource_Enum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'QR')
  static const BookingAttendanceSource_Enum QR = _$bookingAttendanceSourceEnum_QR;
  @BuiltValueEnumConst(wireName: r'BACKFILL')
  static const BookingAttendanceSource_Enum BACKFILL = _$bookingAttendanceSourceEnum_BACKFILL;

  static Serializer<BookingAttendanceSource_Enum> get serializer => _$bookingAttendanceSourceEnumSerializer;

  const BookingAttendanceSource_Enum._(String name): super(name);

  static BuiltSet<BookingAttendanceSource_Enum> get values => _$bookingAttendanceSourceEnumValues;
  static BookingAttendanceSource_Enum valueOf(String name) => _$bookingAttendanceSourceEnumValueOf(name);
}

