// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'package_management_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PackageManagementSummary extends PackageManagementSummary {
  @override
  final int? ACTIVE;
  @override
  final int? SCHEDULED;
  @override
  final int? EXPIRED;
  @override
  final int? INACTIVE;

  factory _$PackageManagementSummary([
    void Function(PackageManagementSummaryBuilder)? updates,
  ]) => (PackageManagementSummaryBuilder()..update(updates))._build();

  _$PackageManagementSummary._({
    this.ACTIVE,
    this.SCHEDULED,
    this.EXPIRED,
    this.INACTIVE,
  }) : super._();
  @override
  PackageManagementSummary rebuild(
    void Function(PackageManagementSummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PackageManagementSummaryBuilder toBuilder() =>
      PackageManagementSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PackageManagementSummary &&
        ACTIVE == other.ACTIVE &&
        SCHEDULED == other.SCHEDULED &&
        EXPIRED == other.EXPIRED &&
        INACTIVE == other.INACTIVE;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, ACTIVE.hashCode);
    _$hash = $jc(_$hash, SCHEDULED.hashCode);
    _$hash = $jc(_$hash, EXPIRED.hashCode);
    _$hash = $jc(_$hash, INACTIVE.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PackageManagementSummary')
          ..add('ACTIVE', ACTIVE)
          ..add('SCHEDULED', SCHEDULED)
          ..add('EXPIRED', EXPIRED)
          ..add('INACTIVE', INACTIVE))
        .toString();
  }
}

class PackageManagementSummaryBuilder
    implements
        Builder<PackageManagementSummary, PackageManagementSummaryBuilder> {
  _$PackageManagementSummary? _$v;

  int? _ACTIVE;
  int? get ACTIVE => _$this._ACTIVE;
  set ACTIVE(int? ACTIVE) => _$this._ACTIVE = ACTIVE;

  int? _SCHEDULED;
  int? get SCHEDULED => _$this._SCHEDULED;
  set SCHEDULED(int? SCHEDULED) => _$this._SCHEDULED = SCHEDULED;

  int? _EXPIRED;
  int? get EXPIRED => _$this._EXPIRED;
  set EXPIRED(int? EXPIRED) => _$this._EXPIRED = EXPIRED;

  int? _INACTIVE;
  int? get INACTIVE => _$this._INACTIVE;
  set INACTIVE(int? INACTIVE) => _$this._INACTIVE = INACTIVE;

  PackageManagementSummaryBuilder() {
    PackageManagementSummary._defaults(this);
  }

  PackageManagementSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _ACTIVE = $v.ACTIVE;
      _SCHEDULED = $v.SCHEDULED;
      _EXPIRED = $v.EXPIRED;
      _INACTIVE = $v.INACTIVE;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PackageManagementSummary other) {
    _$v = other as _$PackageManagementSummary;
  }

  @override
  void update(void Function(PackageManagementSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PackageManagementSummary build() => _build();

  _$PackageManagementSummary _build() {
    final _$result =
        _$v ??
        _$PackageManagementSummary._(
          ACTIVE: ACTIVE,
          SCHEDULED: SCHEDULED,
          EXPIRED: EXPIRED,
          INACTIVE: INACTIVE,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
