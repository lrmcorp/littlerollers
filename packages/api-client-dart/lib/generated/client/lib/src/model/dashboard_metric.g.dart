// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dashboard_metric.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const DashboardMetricUnitEnum _$dashboardMetricUnitEnum_IDR =
    const DashboardMetricUnitEnum._('IDR');
const DashboardMetricUnitEnum _$dashboardMetricUnitEnum_COUNT =
    const DashboardMetricUnitEnum._('COUNT');
const DashboardMetricUnitEnum _$dashboardMetricUnitEnum_PERCENT =
    const DashboardMetricUnitEnum._('PERCENT');

DashboardMetricUnitEnum _$dashboardMetricUnitEnumValueOf(String name) {
  switch (name) {
    case 'IDR':
      return _$dashboardMetricUnitEnum_IDR;
    case 'COUNT':
      return _$dashboardMetricUnitEnum_COUNT;
    case 'PERCENT':
      return _$dashboardMetricUnitEnum_PERCENT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<DashboardMetricUnitEnum> _$dashboardMetricUnitEnumValues =
    BuiltSet<DashboardMetricUnitEnum>(const <DashboardMetricUnitEnum>[
      _$dashboardMetricUnitEnum_IDR,
      _$dashboardMetricUnitEnum_COUNT,
      _$dashboardMetricUnitEnum_PERCENT,
    ]);

Serializer<DashboardMetricUnitEnum> _$dashboardMetricUnitEnumSerializer =
    _$DashboardMetricUnitEnumSerializer();

class _$DashboardMetricUnitEnumSerializer
    implements PrimitiveSerializer<DashboardMetricUnitEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'IDR': 'IDR',
    'COUNT': 'COUNT',
    'PERCENT': 'PERCENT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'IDR': 'IDR',
    'COUNT': 'COUNT',
    'PERCENT': 'PERCENT',
  };

  @override
  final Iterable<Type> types = const <Type>[DashboardMetricUnitEnum];
  @override
  final String wireName = 'DashboardMetricUnitEnum';

  @override
  Object serialize(
    Serializers serializers,
    DashboardMetricUnitEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  DashboardMetricUnitEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => DashboardMetricUnitEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$DashboardMetric extends DashboardMetric {
  @override
  final String key;
  @override
  final String label;
  @override
  final num value;
  @override
  final DashboardMetricUnitEnum unit;
  @override
  final num? changePercent;

  factory _$DashboardMetric([void Function(DashboardMetricBuilder)? updates]) =>
      (DashboardMetricBuilder()..update(updates))._build();

  _$DashboardMetric._({
    required this.key,
    required this.label,
    required this.value,
    required this.unit,
    this.changePercent,
  }) : super._();
  @override
  DashboardMetric rebuild(void Function(DashboardMetricBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  DashboardMetricBuilder toBuilder() => DashboardMetricBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DashboardMetric &&
        key == other.key &&
        label == other.label &&
        value == other.value &&
        unit == other.unit &&
        changePercent == other.changePercent;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, key.hashCode);
    _$hash = $jc(_$hash, label.hashCode);
    _$hash = $jc(_$hash, value.hashCode);
    _$hash = $jc(_$hash, unit.hashCode);
    _$hash = $jc(_$hash, changePercent.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'DashboardMetric')
          ..add('key', key)
          ..add('label', label)
          ..add('value', value)
          ..add('unit', unit)
          ..add('changePercent', changePercent))
        .toString();
  }
}

class DashboardMetricBuilder
    implements Builder<DashboardMetric, DashboardMetricBuilder> {
  _$DashboardMetric? _$v;

  String? _key;
  String? get key => _$this._key;
  set key(String? key) => _$this._key = key;

  String? _label;
  String? get label => _$this._label;
  set label(String? label) => _$this._label = label;

  num? _value;
  num? get value => _$this._value;
  set value(num? value) => _$this._value = value;

  DashboardMetricUnitEnum? _unit;
  DashboardMetricUnitEnum? get unit => _$this._unit;
  set unit(DashboardMetricUnitEnum? unit) => _$this._unit = unit;

  num? _changePercent;
  num? get changePercent => _$this._changePercent;
  set changePercent(num? changePercent) =>
      _$this._changePercent = changePercent;

  DashboardMetricBuilder() {
    DashboardMetric._defaults(this);
  }

  DashboardMetricBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _key = $v.key;
      _label = $v.label;
      _value = $v.value;
      _unit = $v.unit;
      _changePercent = $v.changePercent;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DashboardMetric other) {
    _$v = other as _$DashboardMetric;
  }

  @override
  void update(void Function(DashboardMetricBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  DashboardMetric build() => _build();

  _$DashboardMetric _build() {
    final _$result =
        _$v ??
        _$DashboardMetric._(
          key: BuiltValueNullFieldError.checkNotNull(
            key,
            r'DashboardMetric',
            'key',
          ),
          label: BuiltValueNullFieldError.checkNotNull(
            label,
            r'DashboardMetric',
            'label',
          ),
          value: BuiltValueNullFieldError.checkNotNull(
            value,
            r'DashboardMetric',
            'value',
          ),
          unit: BuiltValueNullFieldError.checkNotNull(
            unit,
            r'DashboardMetric',
            'unit',
          ),
          changePercent: changePercent,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
