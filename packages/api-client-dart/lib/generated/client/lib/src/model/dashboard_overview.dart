//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/dashboard_branch_performance.dart';
import 'package:openapi/src/model/dashboard_trend_point.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/dashboard_overview_period.dart';
import 'package:openapi/src/model/dashboard_metric.dart';
import 'package:openapi/src/model/dashboard_risk_item.dart';
import 'package:openapi/src/model/dashboard_queue_summary.dart';
import 'package:openapi/src/model/operational_job.dart';
import 'package:openapi/src/model/dashboard_activity_item.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'dashboard_overview.g.dart';

/// DashboardOverview
///
/// Properties:
/// * [generatedAt] 
/// * [period] 
/// * [roleFocus] 
/// * [metrics] 
/// * [queues] 
/// * [trend] 
/// * [branches] 
/// * [risks] 
/// * [activities] 
/// * [jobs] 
@BuiltValue()
abstract class DashboardOverview implements Built<DashboardOverview, DashboardOverviewBuilder> {
  @BuiltValueField(wireName: r'generatedAt')
  DateTime get generatedAt;

  @BuiltValueField(wireName: r'period')
  DashboardOverviewPeriod get period;

  @BuiltValueField(wireName: r'roleFocus')
  DashboardOverviewRoleFocusEnum get roleFocus;
  // enum roleFocusEnum {  OWNER,  BRANCH,  FINANCE,  OPS,  };

  @BuiltValueField(wireName: r'metrics')
  BuiltList<DashboardMetric> get metrics;

  @BuiltValueField(wireName: r'queues')
  BuiltList<DashboardQueueSummary> get queues;

  @BuiltValueField(wireName: r'trend')
  BuiltList<DashboardTrendPoint> get trend;

  @BuiltValueField(wireName: r'branches')
  BuiltList<DashboardBranchPerformance> get branches;

  @BuiltValueField(wireName: r'risks')
  BuiltList<DashboardRiskItem> get risks;

  @BuiltValueField(wireName: r'activities')
  BuiltList<DashboardActivityItem> get activities;

  @BuiltValueField(wireName: r'jobs')
  BuiltList<OperationalJob> get jobs;

  DashboardOverview._();

  factory DashboardOverview([void updates(DashboardOverviewBuilder b)]) = _$DashboardOverview;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DashboardOverviewBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DashboardOverview> get serializer => _$DashboardOverviewSerializer();
}

class _$DashboardOverviewSerializer implements PrimitiveSerializer<DashboardOverview> {
  @override
  final Iterable<Type> types = const [DashboardOverview, _$DashboardOverview];

  @override
  final String wireName = r'DashboardOverview';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DashboardOverview object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'generatedAt';
    yield serializers.serialize(
      object.generatedAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'period';
    yield serializers.serialize(
      object.period,
      specifiedType: const FullType(DashboardOverviewPeriod),
    );
    yield r'roleFocus';
    yield serializers.serialize(
      object.roleFocus,
      specifiedType: const FullType(DashboardOverviewRoleFocusEnum),
    );
    yield r'metrics';
    yield serializers.serialize(
      object.metrics,
      specifiedType: const FullType(BuiltList, [FullType(DashboardMetric)]),
    );
    yield r'queues';
    yield serializers.serialize(
      object.queues,
      specifiedType: const FullType(BuiltList, [FullType(DashboardQueueSummary)]),
    );
    yield r'trend';
    yield serializers.serialize(
      object.trend,
      specifiedType: const FullType(BuiltList, [FullType(DashboardTrendPoint)]),
    );
    yield r'branches';
    yield serializers.serialize(
      object.branches,
      specifiedType: const FullType(BuiltList, [FullType(DashboardBranchPerformance)]),
    );
    yield r'risks';
    yield serializers.serialize(
      object.risks,
      specifiedType: const FullType(BuiltList, [FullType(DashboardRiskItem)]),
    );
    yield r'activities';
    yield serializers.serialize(
      object.activities,
      specifiedType: const FullType(BuiltList, [FullType(DashboardActivityItem)]),
    );
    yield r'jobs';
    yield serializers.serialize(
      object.jobs,
      specifiedType: const FullType(BuiltList, [FullType(OperationalJob)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    DashboardOverview object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DashboardOverviewBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'generatedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.generatedAt = valueDes;
          break;
        case r'period':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DashboardOverviewPeriod),
          ) as DashboardOverviewPeriod;
          result.period.replace(valueDes);
          break;
        case r'roleFocus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DashboardOverviewRoleFocusEnum),
          ) as DashboardOverviewRoleFocusEnum;
          result.roleFocus = valueDes;
          break;
        case r'metrics':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(DashboardMetric)]),
          ) as BuiltList<DashboardMetric>;
          result.metrics.replace(valueDes);
          break;
        case r'queues':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(DashboardQueueSummary)]),
          ) as BuiltList<DashboardQueueSummary>;
          result.queues.replace(valueDes);
          break;
        case r'trend':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(DashboardTrendPoint)]),
          ) as BuiltList<DashboardTrendPoint>;
          result.trend.replace(valueDes);
          break;
        case r'branches':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(DashboardBranchPerformance)]),
          ) as BuiltList<DashboardBranchPerformance>;
          result.branches.replace(valueDes);
          break;
        case r'risks':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(DashboardRiskItem)]),
          ) as BuiltList<DashboardRiskItem>;
          result.risks.replace(valueDes);
          break;
        case r'activities':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(DashboardActivityItem)]),
          ) as BuiltList<DashboardActivityItem>;
          result.activities.replace(valueDes);
          break;
        case r'jobs':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(OperationalJob)]),
          ) as BuiltList<OperationalJob>;
          result.jobs.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  DashboardOverview deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DashboardOverviewBuilder();
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

class DashboardOverviewRoleFocusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'OWNER')
  static const DashboardOverviewRoleFocusEnum OWNER = _$dashboardOverviewRoleFocusEnum_OWNER;
  @BuiltValueEnumConst(wireName: r'BRANCH')
  static const DashboardOverviewRoleFocusEnum BRANCH = _$dashboardOverviewRoleFocusEnum_BRANCH;
  @BuiltValueEnumConst(wireName: r'FINANCE')
  static const DashboardOverviewRoleFocusEnum FINANCE = _$dashboardOverviewRoleFocusEnum_FINANCE;
  @BuiltValueEnumConst(wireName: r'OPS')
  static const DashboardOverviewRoleFocusEnum OPS = _$dashboardOverviewRoleFocusEnum_OPS;

  static Serializer<DashboardOverviewRoleFocusEnum> get serializer => _$dashboardOverviewRoleFocusEnumSerializer;

  const DashboardOverviewRoleFocusEnum._(String name): super(name);

  static BuiltSet<DashboardOverviewRoleFocusEnum> get values => _$dashboardOverviewRoleFocusEnumValues;
  static DashboardOverviewRoleFocusEnum valueOf(String name) => _$dashboardOverviewRoleFocusEnumValueOf(name);
}

