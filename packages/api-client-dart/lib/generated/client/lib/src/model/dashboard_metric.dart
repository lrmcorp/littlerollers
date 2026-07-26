//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'dashboard_metric.g.dart';

/// DashboardMetric
///
/// Properties:
/// * [key] 
/// * [label] 
/// * [value] 
/// * [unit] 
/// * [changePercent] 
@BuiltValue()
abstract class DashboardMetric implements Built<DashboardMetric, DashboardMetricBuilder> {
  @BuiltValueField(wireName: r'key')
  String get key;

  @BuiltValueField(wireName: r'label')
  String get label;

  @BuiltValueField(wireName: r'value')
  num get value;

  @BuiltValueField(wireName: r'unit')
  DashboardMetricUnitEnum get unit;
  // enum unitEnum {  IDR,  COUNT,  PERCENT,  };

  @BuiltValueField(wireName: r'changePercent')
  num? get changePercent;

  DashboardMetric._();

  factory DashboardMetric([void updates(DashboardMetricBuilder b)]) = _$DashboardMetric;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DashboardMetricBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DashboardMetric> get serializer => _$DashboardMetricSerializer();
}

class _$DashboardMetricSerializer implements PrimitiveSerializer<DashboardMetric> {
  @override
  final Iterable<Type> types = const [DashboardMetric, _$DashboardMetric];

  @override
  final String wireName = r'DashboardMetric';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DashboardMetric object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'key';
    yield serializers.serialize(
      object.key,
      specifiedType: const FullType(String),
    );
    yield r'label';
    yield serializers.serialize(
      object.label,
      specifiedType: const FullType(String),
    );
    yield r'value';
    yield serializers.serialize(
      object.value,
      specifiedType: const FullType(num),
    );
    yield r'unit';
    yield serializers.serialize(
      object.unit,
      specifiedType: const FullType(DashboardMetricUnitEnum),
    );
    yield r'changePercent';
    yield object.changePercent == null ? null : serializers.serialize(
      object.changePercent,
      specifiedType: const FullType.nullable(num),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    DashboardMetric object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DashboardMetricBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'key':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.key = valueDes;
          break;
        case r'label':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.label = valueDes;
          break;
        case r'value':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(num),
          ) as num;
          result.value = valueDes;
          break;
        case r'unit':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DashboardMetricUnitEnum),
          ) as DashboardMetricUnitEnum;
          result.unit = valueDes;
          break;
        case r'changePercent':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(num),
          ) as num?;
          if (valueDes == null) continue;
          result.changePercent = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  DashboardMetric deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DashboardMetricBuilder();
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

class DashboardMetricUnitEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'IDR')
  static const DashboardMetricUnitEnum IDR = _$dashboardMetricUnitEnum_IDR;
  @BuiltValueEnumConst(wireName: r'COUNT')
  static const DashboardMetricUnitEnum COUNT = _$dashboardMetricUnitEnum_COUNT;
  @BuiltValueEnumConst(wireName: r'PERCENT')
  static const DashboardMetricUnitEnum PERCENT = _$dashboardMetricUnitEnum_PERCENT;

  static Serializer<DashboardMetricUnitEnum> get serializer => _$dashboardMetricUnitEnumSerializer;

  const DashboardMetricUnitEnum._(String name): super(name);

  static BuiltSet<DashboardMetricUnitEnum> get values => _$dashboardMetricUnitEnumValues;
  static DashboardMetricUnitEnum valueOf(String name) => _$dashboardMetricUnitEnumValueOf(name);
}

