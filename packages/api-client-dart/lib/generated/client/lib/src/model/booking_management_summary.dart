//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'booking_management_summary.g.dart';

/// BookingManagementSummary
///
/// Properties:
/// * [total] 
/// * [booked] 
/// * [reschedulePending] 
/// * [attended] 
/// * [cancelled] 
/// * [noShow] 
@BuiltValue()
abstract class BookingManagementSummary implements Built<BookingManagementSummary, BookingManagementSummaryBuilder> {
  @BuiltValueField(wireName: r'total')
  int get total;

  @BuiltValueField(wireName: r'booked')
  int get booked;

  @BuiltValueField(wireName: r'reschedulePending')
  int get reschedulePending;

  @BuiltValueField(wireName: r'attended')
  int get attended;

  @BuiltValueField(wireName: r'cancelled')
  int get cancelled;

  @BuiltValueField(wireName: r'noShow')
  int get noShow;

  BookingManagementSummary._();

  factory BookingManagementSummary([void updates(BookingManagementSummaryBuilder b)]) = _$BookingManagementSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BookingManagementSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BookingManagementSummary> get serializer => _$BookingManagementSummarySerializer();
}

class _$BookingManagementSummarySerializer implements PrimitiveSerializer<BookingManagementSummary> {
  @override
  final Iterable<Type> types = const [BookingManagementSummary, _$BookingManagementSummary];

  @override
  final String wireName = r'BookingManagementSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BookingManagementSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'total';
    yield serializers.serialize(
      object.total,
      specifiedType: const FullType(int),
    );
    yield r'booked';
    yield serializers.serialize(
      object.booked,
      specifiedType: const FullType(int),
    );
    yield r'reschedulePending';
    yield serializers.serialize(
      object.reschedulePending,
      specifiedType: const FullType(int),
    );
    yield r'attended';
    yield serializers.serialize(
      object.attended,
      specifiedType: const FullType(int),
    );
    yield r'cancelled';
    yield serializers.serialize(
      object.cancelled,
      specifiedType: const FullType(int),
    );
    yield r'noShow';
    yield serializers.serialize(
      object.noShow,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    BookingManagementSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BookingManagementSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'total':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.total = valueDes;
          break;
        case r'booked':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.booked = valueDes;
          break;
        case r'reschedulePending':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.reschedulePending = valueDes;
          break;
        case r'attended':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.attended = valueDes;
          break;
        case r'cancelled':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.cancelled = valueDes;
          break;
        case r'noShow':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.noShow = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  BookingManagementSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BookingManagementSummaryBuilder();
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

