// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'financial_report.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const FinancialReportReportTypeEnum _$financialReportReportTypeEnum_REVENUE =
    const FinancialReportReportTypeEnum._('REVENUE');
const FinancialReportReportTypeEnum
_$financialReportReportTypeEnum_INSTRUCTOR_REALTIME =
    const FinancialReportReportTypeEnum._('INSTRUCTOR_REALTIME');
const FinancialReportReportTypeEnum _$financialReportReportTypeEnum_PROJECTION =
    const FinancialReportReportTypeEnum._('PROJECTION');
const FinancialReportReportTypeEnum _$financialReportReportTypeEnum_OTHER_COST =
    const FinancialReportReportTypeEnum._('OTHER_COST');
const FinancialReportReportTypeEnum _$financialReportReportTypeEnum_PROFIT =
    const FinancialReportReportTypeEnum._('PROFIT');

FinancialReportReportTypeEnum _$financialReportReportTypeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'REVENUE':
      return _$financialReportReportTypeEnum_REVENUE;
    case 'INSTRUCTOR_REALTIME':
      return _$financialReportReportTypeEnum_INSTRUCTOR_REALTIME;
    case 'PROJECTION':
      return _$financialReportReportTypeEnum_PROJECTION;
    case 'OTHER_COST':
      return _$financialReportReportTypeEnum_OTHER_COST;
    case 'PROFIT':
      return _$financialReportReportTypeEnum_PROFIT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<FinancialReportReportTypeEnum>
_$financialReportReportTypeEnumValues = BuiltSet<FinancialReportReportTypeEnum>(
  const <FinancialReportReportTypeEnum>[
    _$financialReportReportTypeEnum_REVENUE,
    _$financialReportReportTypeEnum_INSTRUCTOR_REALTIME,
    _$financialReportReportTypeEnum_PROJECTION,
    _$financialReportReportTypeEnum_OTHER_COST,
    _$financialReportReportTypeEnum_PROFIT,
  ],
);

Serializer<FinancialReportReportTypeEnum>
_$financialReportReportTypeEnumSerializer =
    _$FinancialReportReportTypeEnumSerializer();

class _$FinancialReportReportTypeEnumSerializer
    implements PrimitiveSerializer<FinancialReportReportTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'REVENUE': 'REVENUE',
    'INSTRUCTOR_REALTIME': 'INSTRUCTOR_REALTIME',
    'PROJECTION': 'PROJECTION',
    'OTHER_COST': 'OTHER_COST',
    'PROFIT': 'PROFIT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'REVENUE': 'REVENUE',
    'INSTRUCTOR_REALTIME': 'INSTRUCTOR_REALTIME',
    'PROJECTION': 'PROJECTION',
    'OTHER_COST': 'OTHER_COST',
    'PROFIT': 'PROFIT',
  };

  @override
  final Iterable<Type> types = const <Type>[FinancialReportReportTypeEnum];
  @override
  final String wireName = 'FinancialReportReportTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    FinancialReportReportTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  FinancialReportReportTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => FinancialReportReportTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$FinancialReport extends FinancialReport {
  @override
  final FinancialReportReportTypeEnum reportType;
  @override
  final String branchId;
  @override
  final String period;
  @override
  final DateTime generatedAt;
  @override
  final String controlHash;
  @override
  final BuiltMap<String, Money> totals;
  @override
  final String? sourceVersion;

  factory _$FinancialReport([void Function(FinancialReportBuilder)? updates]) =>
      (FinancialReportBuilder()..update(updates))._build();

  _$FinancialReport._({
    required this.reportType,
    required this.branchId,
    required this.period,
    required this.generatedAt,
    required this.controlHash,
    required this.totals,
    this.sourceVersion,
  }) : super._();
  @override
  FinancialReport rebuild(void Function(FinancialReportBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  FinancialReportBuilder toBuilder() => FinancialReportBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FinancialReport &&
        reportType == other.reportType &&
        branchId == other.branchId &&
        period == other.period &&
        generatedAt == other.generatedAt &&
        controlHash == other.controlHash &&
        totals == other.totals &&
        sourceVersion == other.sourceVersion;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, reportType.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, period.hashCode);
    _$hash = $jc(_$hash, generatedAt.hashCode);
    _$hash = $jc(_$hash, controlHash.hashCode);
    _$hash = $jc(_$hash, totals.hashCode);
    _$hash = $jc(_$hash, sourceVersion.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'FinancialReport')
          ..add('reportType', reportType)
          ..add('branchId', branchId)
          ..add('period', period)
          ..add('generatedAt', generatedAt)
          ..add('controlHash', controlHash)
          ..add('totals', totals)
          ..add('sourceVersion', sourceVersion))
        .toString();
  }
}

class FinancialReportBuilder
    implements Builder<FinancialReport, FinancialReportBuilder> {
  _$FinancialReport? _$v;

  FinancialReportReportTypeEnum? _reportType;
  FinancialReportReportTypeEnum? get reportType => _$this._reportType;
  set reportType(FinancialReportReportTypeEnum? reportType) =>
      _$this._reportType = reportType;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _period;
  String? get period => _$this._period;
  set period(String? period) => _$this._period = period;

  DateTime? _generatedAt;
  DateTime? get generatedAt => _$this._generatedAt;
  set generatedAt(DateTime? generatedAt) => _$this._generatedAt = generatedAt;

  String? _controlHash;
  String? get controlHash => _$this._controlHash;
  set controlHash(String? controlHash) => _$this._controlHash = controlHash;

  MapBuilder<String, Money>? _totals;
  MapBuilder<String, Money> get totals =>
      _$this._totals ??= MapBuilder<String, Money>();
  set totals(MapBuilder<String, Money>? totals) => _$this._totals = totals;

  String? _sourceVersion;
  String? get sourceVersion => _$this._sourceVersion;
  set sourceVersion(String? sourceVersion) =>
      _$this._sourceVersion = sourceVersion;

  FinancialReportBuilder() {
    FinancialReport._defaults(this);
  }

  FinancialReportBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _reportType = $v.reportType;
      _branchId = $v.branchId;
      _period = $v.period;
      _generatedAt = $v.generatedAt;
      _controlHash = $v.controlHash;
      _totals = $v.totals.toBuilder();
      _sourceVersion = $v.sourceVersion;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(FinancialReport other) {
    _$v = other as _$FinancialReport;
  }

  @override
  void update(void Function(FinancialReportBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  FinancialReport build() => _build();

  _$FinancialReport _build() {
    _$FinancialReport _$result;
    try {
      _$result =
          _$v ??
          _$FinancialReport._(
            reportType: BuiltValueNullFieldError.checkNotNull(
              reportType,
              r'FinancialReport',
              'reportType',
            ),
            branchId: BuiltValueNullFieldError.checkNotNull(
              branchId,
              r'FinancialReport',
              'branchId',
            ),
            period: BuiltValueNullFieldError.checkNotNull(
              period,
              r'FinancialReport',
              'period',
            ),
            generatedAt: BuiltValueNullFieldError.checkNotNull(
              generatedAt,
              r'FinancialReport',
              'generatedAt',
            ),
            controlHash: BuiltValueNullFieldError.checkNotNull(
              controlHash,
              r'FinancialReport',
              'controlHash',
            ),
            totals: totals.build(),
            sourceVersion: sourceVersion,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'totals';
        totals.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'FinancialReport',
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
