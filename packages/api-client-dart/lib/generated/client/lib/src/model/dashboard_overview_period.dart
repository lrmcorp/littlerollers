//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/date.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'dashboard_overview_period.g.dart';

/// DashboardOverviewPeriod
///
/// Properties:
/// * [from] 
/// * [until] 
/// * [previousFrom] 
/// * [previousUntil] 
@BuiltValue()
abstract class DashboardOverviewPeriod implements Built<DashboardOverviewPeriod, DashboardOverviewPeriodBuilder> {
  @BuiltValueField(wireName: r'from')
  Date get from;

  @BuiltValueField(wireName: r'until')
  Date get until;

  @BuiltValueField(wireName: r'previousFrom')
  Date get previousFrom;

  @BuiltValueField(wireName: r'previousUntil')
  Date get previousUntil;

  DashboardOverviewPeriod._();

  factory DashboardOverviewPeriod([void updates(DashboardOverviewPeriodBuilder b)]) = _$DashboardOverviewPeriod;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DashboardOverviewPeriodBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DashboardOverviewPeriod> get serializer => _$DashboardOverviewPeriodSerializer();
}

class _$DashboardOverviewPeriodSerializer implements PrimitiveSerializer<DashboardOverviewPeriod> {
  @override
  final Iterable<Type> types = const [DashboardOverviewPeriod, _$DashboardOverviewPeriod];

  @override
  final String wireName = r'DashboardOverviewPeriod';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DashboardOverviewPeriod object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'from';
    yield serializers.serialize(
      object.from,
      specifiedType: const FullType(Date),
    );
    yield r'until';
    yield serializers.serialize(
      object.until,
      specifiedType: const FullType(Date),
    );
    yield r'previousFrom';
    yield serializers.serialize(
      object.previousFrom,
      specifiedType: const FullType(Date),
    );
    yield r'previousUntil';
    yield serializers.serialize(
      object.previousUntil,
      specifiedType: const FullType(Date),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    DashboardOverviewPeriod object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DashboardOverviewPeriodBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'from':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.from = valueDes;
          break;
        case r'until':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.until = valueDes;
          break;
        case r'previousFrom':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.previousFrom = valueDes;
          break;
        case r'previousUntil':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.previousUntil = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  DashboardOverviewPeriod deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DashboardOverviewPeriodBuilder();
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

