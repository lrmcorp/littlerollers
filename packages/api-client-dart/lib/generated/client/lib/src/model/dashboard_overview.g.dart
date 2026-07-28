// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dashboard_overview.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const DashboardOverviewRoleFocusEnum
_$dashboardOverviewRoleFocusEnum_EXECUTIVE =
    const DashboardOverviewRoleFocusEnum._('EXECUTIVE');
const DashboardOverviewRoleFocusEnum _$dashboardOverviewRoleFocusEnum_OWNER =
    const DashboardOverviewRoleFocusEnum._('OWNER');
const DashboardOverviewRoleFocusEnum
_$dashboardOverviewRoleFocusEnum_BRANCH_OPERATIONS =
    const DashboardOverviewRoleFocusEnum._('BRANCH_OPERATIONS');
const DashboardOverviewRoleFocusEnum _$dashboardOverviewRoleFocusEnum_FINANCE =
    const DashboardOverviewRoleFocusEnum._('FINANCE');
const DashboardOverviewRoleFocusEnum
_$dashboardOverviewRoleFocusEnum_OPERATIONS =
    const DashboardOverviewRoleFocusEnum._('OPERATIONS');

DashboardOverviewRoleFocusEnum _$dashboardOverviewRoleFocusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'EXECUTIVE':
      return _$dashboardOverviewRoleFocusEnum_EXECUTIVE;
    case 'OWNER':
      return _$dashboardOverviewRoleFocusEnum_OWNER;
    case 'BRANCH_OPERATIONS':
      return _$dashboardOverviewRoleFocusEnum_BRANCH_OPERATIONS;
    case 'FINANCE':
      return _$dashboardOverviewRoleFocusEnum_FINANCE;
    case 'OPERATIONS':
      return _$dashboardOverviewRoleFocusEnum_OPERATIONS;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<DashboardOverviewRoleFocusEnum>
_$dashboardOverviewRoleFocusEnumValues =
    BuiltSet<DashboardOverviewRoleFocusEnum>(
      const <DashboardOverviewRoleFocusEnum>[
        _$dashboardOverviewRoleFocusEnum_EXECUTIVE,
        _$dashboardOverviewRoleFocusEnum_OWNER,
        _$dashboardOverviewRoleFocusEnum_BRANCH_OPERATIONS,
        _$dashboardOverviewRoleFocusEnum_FINANCE,
        _$dashboardOverviewRoleFocusEnum_OPERATIONS,
      ],
    );

Serializer<DashboardOverviewRoleFocusEnum>
_$dashboardOverviewRoleFocusEnumSerializer =
    _$DashboardOverviewRoleFocusEnumSerializer();

class _$DashboardOverviewRoleFocusEnumSerializer
    implements PrimitiveSerializer<DashboardOverviewRoleFocusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'EXECUTIVE': 'EXECUTIVE',
    'OWNER': 'OWNER',
    'BRANCH_OPERATIONS': 'BRANCH_OPERATIONS',
    'FINANCE': 'FINANCE',
    'OPERATIONS': 'OPERATIONS',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'EXECUTIVE': 'EXECUTIVE',
    'OWNER': 'OWNER',
    'BRANCH_OPERATIONS': 'BRANCH_OPERATIONS',
    'FINANCE': 'FINANCE',
    'OPERATIONS': 'OPERATIONS',
  };

  @override
  final Iterable<Type> types = const <Type>[DashboardOverviewRoleFocusEnum];
  @override
  final String wireName = 'DashboardOverviewRoleFocusEnum';

  @override
  Object serialize(
    Serializers serializers,
    DashboardOverviewRoleFocusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  DashboardOverviewRoleFocusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => DashboardOverviewRoleFocusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$DashboardOverview extends DashboardOverview {
  @override
  final DateTime generatedAt;
  @override
  final DashboardOverviewPeriod period;
  @override
  final DashboardOverviewRoleFocusEnum roleFocus;
  @override
  final DashboardSections sections;
  @override
  final BuiltList<DashboardMetric> metrics;
  @override
  final BuiltList<DashboardQueueSummary> queues;
  @override
  final BuiltList<DashboardTrendPoint> trend;
  @override
  final BuiltList<DashboardBranchPerformance> branches;
  @override
  final BuiltList<DashboardRiskItem> risks;
  @override
  final BuiltList<DashboardActivityItem> activities;
  @override
  final BuiltList<OperationalJob> jobs;

  factory _$DashboardOverview([
    void Function(DashboardOverviewBuilder)? updates,
  ]) => (DashboardOverviewBuilder()..update(updates))._build();

  _$DashboardOverview._({
    required this.generatedAt,
    required this.period,
    required this.roleFocus,
    required this.sections,
    required this.metrics,
    required this.queues,
    required this.trend,
    required this.branches,
    required this.risks,
    required this.activities,
    required this.jobs,
  }) : super._();
  @override
  DashboardOverview rebuild(void Function(DashboardOverviewBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  DashboardOverviewBuilder toBuilder() =>
      DashboardOverviewBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DashboardOverview &&
        generatedAt == other.generatedAt &&
        period == other.period &&
        roleFocus == other.roleFocus &&
        sections == other.sections &&
        metrics == other.metrics &&
        queues == other.queues &&
        trend == other.trend &&
        branches == other.branches &&
        risks == other.risks &&
        activities == other.activities &&
        jobs == other.jobs;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, generatedAt.hashCode);
    _$hash = $jc(_$hash, period.hashCode);
    _$hash = $jc(_$hash, roleFocus.hashCode);
    _$hash = $jc(_$hash, sections.hashCode);
    _$hash = $jc(_$hash, metrics.hashCode);
    _$hash = $jc(_$hash, queues.hashCode);
    _$hash = $jc(_$hash, trend.hashCode);
    _$hash = $jc(_$hash, branches.hashCode);
    _$hash = $jc(_$hash, risks.hashCode);
    _$hash = $jc(_$hash, activities.hashCode);
    _$hash = $jc(_$hash, jobs.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'DashboardOverview')
          ..add('generatedAt', generatedAt)
          ..add('period', period)
          ..add('roleFocus', roleFocus)
          ..add('sections', sections)
          ..add('metrics', metrics)
          ..add('queues', queues)
          ..add('trend', trend)
          ..add('branches', branches)
          ..add('risks', risks)
          ..add('activities', activities)
          ..add('jobs', jobs))
        .toString();
  }
}

class DashboardOverviewBuilder
    implements Builder<DashboardOverview, DashboardOverviewBuilder> {
  _$DashboardOverview? _$v;

  DateTime? _generatedAt;
  DateTime? get generatedAt => _$this._generatedAt;
  set generatedAt(DateTime? generatedAt) => _$this._generatedAt = generatedAt;

  DashboardOverviewPeriodBuilder? _period;
  DashboardOverviewPeriodBuilder get period =>
      _$this._period ??= DashboardOverviewPeriodBuilder();
  set period(DashboardOverviewPeriodBuilder? period) => _$this._period = period;

  DashboardOverviewRoleFocusEnum? _roleFocus;
  DashboardOverviewRoleFocusEnum? get roleFocus => _$this._roleFocus;
  set roleFocus(DashboardOverviewRoleFocusEnum? roleFocus) =>
      _$this._roleFocus = roleFocus;

  DashboardSectionsBuilder? _sections;
  DashboardSectionsBuilder get sections =>
      _$this._sections ??= DashboardSectionsBuilder();
  set sections(DashboardSectionsBuilder? sections) =>
      _$this._sections = sections;

  ListBuilder<DashboardMetric>? _metrics;
  ListBuilder<DashboardMetric> get metrics =>
      _$this._metrics ??= ListBuilder<DashboardMetric>();
  set metrics(ListBuilder<DashboardMetric>? metrics) =>
      _$this._metrics = metrics;

  ListBuilder<DashboardQueueSummary>? _queues;
  ListBuilder<DashboardQueueSummary> get queues =>
      _$this._queues ??= ListBuilder<DashboardQueueSummary>();
  set queues(ListBuilder<DashboardQueueSummary>? queues) =>
      _$this._queues = queues;

  ListBuilder<DashboardTrendPoint>? _trend;
  ListBuilder<DashboardTrendPoint> get trend =>
      _$this._trend ??= ListBuilder<DashboardTrendPoint>();
  set trend(ListBuilder<DashboardTrendPoint>? trend) => _$this._trend = trend;

  ListBuilder<DashboardBranchPerformance>? _branches;
  ListBuilder<DashboardBranchPerformance> get branches =>
      _$this._branches ??= ListBuilder<DashboardBranchPerformance>();
  set branches(ListBuilder<DashboardBranchPerformance>? branches) =>
      _$this._branches = branches;

  ListBuilder<DashboardRiskItem>? _risks;
  ListBuilder<DashboardRiskItem> get risks =>
      _$this._risks ??= ListBuilder<DashboardRiskItem>();
  set risks(ListBuilder<DashboardRiskItem>? risks) => _$this._risks = risks;

  ListBuilder<DashboardActivityItem>? _activities;
  ListBuilder<DashboardActivityItem> get activities =>
      _$this._activities ??= ListBuilder<DashboardActivityItem>();
  set activities(ListBuilder<DashboardActivityItem>? activities) =>
      _$this._activities = activities;

  ListBuilder<OperationalJob>? _jobs;
  ListBuilder<OperationalJob> get jobs =>
      _$this._jobs ??= ListBuilder<OperationalJob>();
  set jobs(ListBuilder<OperationalJob>? jobs) => _$this._jobs = jobs;

  DashboardOverviewBuilder() {
    DashboardOverview._defaults(this);
  }

  DashboardOverviewBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _generatedAt = $v.generatedAt;
      _period = $v.period.toBuilder();
      _roleFocus = $v.roleFocus;
      _sections = $v.sections.toBuilder();
      _metrics = $v.metrics.toBuilder();
      _queues = $v.queues.toBuilder();
      _trend = $v.trend.toBuilder();
      _branches = $v.branches.toBuilder();
      _risks = $v.risks.toBuilder();
      _activities = $v.activities.toBuilder();
      _jobs = $v.jobs.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DashboardOverview other) {
    _$v = other as _$DashboardOverview;
  }

  @override
  void update(void Function(DashboardOverviewBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  DashboardOverview build() => _build();

  _$DashboardOverview _build() {
    _$DashboardOverview _$result;
    try {
      _$result =
          _$v ??
          _$DashboardOverview._(
            generatedAt: BuiltValueNullFieldError.checkNotNull(
              generatedAt,
              r'DashboardOverview',
              'generatedAt',
            ),
            period: period.build(),
            roleFocus: BuiltValueNullFieldError.checkNotNull(
              roleFocus,
              r'DashboardOverview',
              'roleFocus',
            ),
            sections: sections.build(),
            metrics: metrics.build(),
            queues: queues.build(),
            trend: trend.build(),
            branches: branches.build(),
            risks: risks.build(),
            activities: activities.build(),
            jobs: jobs.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'period';
        period.build();

        _$failedField = 'sections';
        sections.build();
        _$failedField = 'metrics';
        metrics.build();
        _$failedField = 'queues';
        queues.build();
        _$failedField = 'trend';
        trend.build();
        _$failedField = 'branches';
        branches.build();
        _$failedField = 'risks';
        risks.build();
        _$failedField = 'activities';
        activities.build();
        _$failedField = 'jobs';
        jobs.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'DashboardOverview',
          _$failedField,
          e.toString(),
        );
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
