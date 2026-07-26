//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'dashboard_branch_performance.g.dart';

/// DashboardBranchPerformance
///
/// Properties:
/// * [id] 
/// * [code] 
/// * [name] 
/// * [revenueRp] 
/// * [bookings] 
/// * [occupancyPercent] 
@BuiltValue()
abstract class DashboardBranchPerformance implements Built<DashboardBranchPerformance, DashboardBranchPerformanceBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'code')
  String get code;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'revenueRp')
  int get revenueRp;

  @BuiltValueField(wireName: r'bookings')
  int get bookings;

  @BuiltValueField(wireName: r'occupancyPercent')
  num get occupancyPercent;

  DashboardBranchPerformance._();

  factory DashboardBranchPerformance([void updates(DashboardBranchPerformanceBuilder b)]) = _$DashboardBranchPerformance;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DashboardBranchPerformanceBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DashboardBranchPerformance> get serializer => _$DashboardBranchPerformanceSerializer();
}

class _$DashboardBranchPerformanceSerializer implements PrimitiveSerializer<DashboardBranchPerformance> {
  @override
  final Iterable<Type> types = const [DashboardBranchPerformance, _$DashboardBranchPerformance];

  @override
  final String wireName = r'DashboardBranchPerformance';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DashboardBranchPerformance object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'revenueRp';
    yield serializers.serialize(
      object.revenueRp,
      specifiedType: const FullType(int),
    );
    yield r'bookings';
    yield serializers.serialize(
      object.bookings,
      specifiedType: const FullType(int),
    );
    yield r'occupancyPercent';
    yield serializers.serialize(
      object.occupancyPercent,
      specifiedType: const FullType(num),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    DashboardBranchPerformance object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DashboardBranchPerformanceBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'revenueRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.revenueRp = valueDes;
          break;
        case r'bookings':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.bookings = valueDes;
          break;
        case r'occupancyPercent':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(num),
          ) as num;
          result.occupancyPercent = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  DashboardBranchPerformance deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DashboardBranchPerformanceBuilder();
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

