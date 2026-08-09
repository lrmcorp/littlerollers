//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/date.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'dashboard_trend_point.g.dart';

/// DashboardTrendPoint
///
/// Properties:
/// * [date] 
/// * [revenue] 
/// * [profit] 
/// * [bookings] 
@BuiltValue()
abstract class DashboardTrendPoint implements Built<DashboardTrendPoint, DashboardTrendPointBuilder> {
  @BuiltValueField(wireName: r'date')
  Date get date;

  @BuiltValueField(wireName: r'revenue')
  int get revenue;

  @BuiltValueField(wireName: r'profit')
  int get profit;

  @BuiltValueField(wireName: r'bookings')
  int get bookings;

  DashboardTrendPoint._();

  factory DashboardTrendPoint([void updates(DashboardTrendPointBuilder b)]) = _$DashboardTrendPoint;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DashboardTrendPointBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DashboardTrendPoint> get serializer => _$DashboardTrendPointSerializer();
}

class _$DashboardTrendPointSerializer implements PrimitiveSerializer<DashboardTrendPoint> {
  @override
  final Iterable<Type> types = const [DashboardTrendPoint, _$DashboardTrendPoint];

  @override
  final String wireName = r'DashboardTrendPoint';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DashboardTrendPoint object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'date';
    yield serializers.serialize(
      object.date,
      specifiedType: const FullType(Date),
    );
    yield r'revenue';
    yield serializers.serialize(
      object.revenue,
      specifiedType: const FullType(int),
    );
    yield r'profit';
    yield serializers.serialize(
      object.profit,
      specifiedType: const FullType(int),
    );
    yield r'bookings';
    yield serializers.serialize(
      object.bookings,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    DashboardTrendPoint object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DashboardTrendPointBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'date':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.date = valueDes;
          break;
        case r'revenue':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.revenue = valueDes;
          break;
        case r'profit':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.profit = valueDes;
          break;
        case r'bookings':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.bookings = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  DashboardTrendPoint deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DashboardTrendPointBuilder();
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

