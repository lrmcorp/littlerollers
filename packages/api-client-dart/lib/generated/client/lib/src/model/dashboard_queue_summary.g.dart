// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dashboard_queue_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$DashboardQueueSummary extends DashboardQueueSummary {
  @override
  final String key;
  @override
  final String label;
  @override
  final int count;
  @override
  final String href;

  factory _$DashboardQueueSummary([
    void Function(DashboardQueueSummaryBuilder)? updates,
  ]) => (DashboardQueueSummaryBuilder()..update(updates))._build();

  _$DashboardQueueSummary._({
    required this.key,
    required this.label,
    required this.count,
    required this.href,
  }) : super._();
  @override
  DashboardQueueSummary rebuild(
    void Function(DashboardQueueSummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  DashboardQueueSummaryBuilder toBuilder() =>
      DashboardQueueSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DashboardQueueSummary &&
        key == other.key &&
        label == other.label &&
        count == other.count &&
        href == other.href;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, key.hashCode);
    _$hash = $jc(_$hash, label.hashCode);
    _$hash = $jc(_$hash, count.hashCode);
    _$hash = $jc(_$hash, href.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'DashboardQueueSummary')
          ..add('key', key)
          ..add('label', label)
          ..add('count', count)
          ..add('href', href))
        .toString();
  }
}

class DashboardQueueSummaryBuilder
    implements Builder<DashboardQueueSummary, DashboardQueueSummaryBuilder> {
  _$DashboardQueueSummary? _$v;

  String? _key;
  String? get key => _$this._key;
  set key(String? key) => _$this._key = key;

  String? _label;
  String? get label => _$this._label;
  set label(String? label) => _$this._label = label;

  int? _count;
  int? get count => _$this._count;
  set count(int? count) => _$this._count = count;

  String? _href;
  String? get href => _$this._href;
  set href(String? href) => _$this._href = href;

  DashboardQueueSummaryBuilder() {
    DashboardQueueSummary._defaults(this);
  }

  DashboardQueueSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _key = $v.key;
      _label = $v.label;
      _count = $v.count;
      _href = $v.href;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DashboardQueueSummary other) {
    _$v = other as _$DashboardQueueSummary;
  }

  @override
  void update(void Function(DashboardQueueSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  DashboardQueueSummary build() => _build();

  _$DashboardQueueSummary _build() {
    final _$result =
        _$v ??
        _$DashboardQueueSummary._(
          key: BuiltValueNullFieldError.checkNotNull(
            key,
            r'DashboardQueueSummary',
            'key',
          ),
          label: BuiltValueNullFieldError.checkNotNull(
            label,
            r'DashboardQueueSummary',
            'label',
          ),
          count: BuiltValueNullFieldError.checkNotNull(
            count,
            r'DashboardQueueSummary',
            'count',
          ),
          href: BuiltValueNullFieldError.checkNotNull(
            href,
            r'DashboardQueueSummary',
            'href',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
