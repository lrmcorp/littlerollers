//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/reservation_item.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'reservation_summary.g.dart';

/// Authoritative active reservations with safe booking and class projections.
///
/// Properties:
/// * [activeQuantity] 
/// * [items] 
@BuiltValue()
abstract class ReservationSummary implements Built<ReservationSummary, ReservationSummaryBuilder> {
  @BuiltValueField(wireName: r'activeQuantity')
  int get activeQuantity;

  @BuiltValueField(wireName: r'items')
  BuiltList<ReservationItem> get items;

  ReservationSummary._();

  factory ReservationSummary([void updates(ReservationSummaryBuilder b)]) = _$ReservationSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ReservationSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ReservationSummary> get serializer => _$ReservationSummarySerializer();
}

class _$ReservationSummarySerializer implements PrimitiveSerializer<ReservationSummary> {
  @override
  final Iterable<Type> types = const [ReservationSummary, _$ReservationSummary];

  @override
  final String wireName = r'ReservationSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ReservationSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'activeQuantity';
    yield serializers.serialize(
      object.activeQuantity,
      specifiedType: const FullType(int),
    );
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(ReservationItem)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ReservationSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ReservationSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'activeQuantity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.activeQuantity = valueDes;
          break;
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(ReservationItem)]),
          ) as BuiltList<ReservationItem>;
          result.items.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ReservationSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ReservationSummaryBuilder();
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

