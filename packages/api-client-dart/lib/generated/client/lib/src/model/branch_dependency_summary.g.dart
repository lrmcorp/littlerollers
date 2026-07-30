// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'branch_dependency_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BranchDependencySummary extends BranchDependencySummary {
  @override
  final int assignments;
  @override
  final int futureClasses;
  @override
  final int packages;
  @override
  final int paymentAccounts;
  @override
  final int classTypes;
  @override
  final int staff;

  factory _$BranchDependencySummary([
    void Function(BranchDependencySummaryBuilder)? updates,
  ]) => (BranchDependencySummaryBuilder()..update(updates))._build();

  _$BranchDependencySummary._({
    required this.assignments,
    required this.futureClasses,
    required this.packages,
    required this.paymentAccounts,
    required this.classTypes,
    required this.staff,
  }) : super._();
  @override
  BranchDependencySummary rebuild(
    void Function(BranchDependencySummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  BranchDependencySummaryBuilder toBuilder() =>
      BranchDependencySummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BranchDependencySummary &&
        assignments == other.assignments &&
        futureClasses == other.futureClasses &&
        packages == other.packages &&
        paymentAccounts == other.paymentAccounts &&
        classTypes == other.classTypes &&
        staff == other.staff;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, assignments.hashCode);
    _$hash = $jc(_$hash, futureClasses.hashCode);
    _$hash = $jc(_$hash, packages.hashCode);
    _$hash = $jc(_$hash, paymentAccounts.hashCode);
    _$hash = $jc(_$hash, classTypes.hashCode);
    _$hash = $jc(_$hash, staff.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'BranchDependencySummary')
          ..add('assignments', assignments)
          ..add('futureClasses', futureClasses)
          ..add('packages', packages)
          ..add('paymentAccounts', paymentAccounts)
          ..add('classTypes', classTypes)
          ..add('staff', staff))
        .toString();
  }
}

class BranchDependencySummaryBuilder
    implements
        Builder<BranchDependencySummary, BranchDependencySummaryBuilder> {
  _$BranchDependencySummary? _$v;

  int? _assignments;
  int? get assignments => _$this._assignments;
  set assignments(int? assignments) => _$this._assignments = assignments;

  int? _futureClasses;
  int? get futureClasses => _$this._futureClasses;
  set futureClasses(int? futureClasses) =>
      _$this._futureClasses = futureClasses;

  int? _packages;
  int? get packages => _$this._packages;
  set packages(int? packages) => _$this._packages = packages;

  int? _paymentAccounts;
  int? get paymentAccounts => _$this._paymentAccounts;
  set paymentAccounts(int? paymentAccounts) =>
      _$this._paymentAccounts = paymentAccounts;

  int? _classTypes;
  int? get classTypes => _$this._classTypes;
  set classTypes(int? classTypes) => _$this._classTypes = classTypes;

  int? _staff;
  int? get staff => _$this._staff;
  set staff(int? staff) => _$this._staff = staff;

  BranchDependencySummaryBuilder() {
    BranchDependencySummary._defaults(this);
  }

  BranchDependencySummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _assignments = $v.assignments;
      _futureClasses = $v.futureClasses;
      _packages = $v.packages;
      _paymentAccounts = $v.paymentAccounts;
      _classTypes = $v.classTypes;
      _staff = $v.staff;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BranchDependencySummary other) {
    _$v = other as _$BranchDependencySummary;
  }

  @override
  void update(void Function(BranchDependencySummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BranchDependencySummary build() => _build();

  _$BranchDependencySummary _build() {
    final _$result =
        _$v ??
        _$BranchDependencySummary._(
          assignments: BuiltValueNullFieldError.checkNotNull(
            assignments,
            r'BranchDependencySummary',
            'assignments',
          ),
          futureClasses: BuiltValueNullFieldError.checkNotNull(
            futureClasses,
            r'BranchDependencySummary',
            'futureClasses',
          ),
          packages: BuiltValueNullFieldError.checkNotNull(
            packages,
            r'BranchDependencySummary',
            'packages',
          ),
          paymentAccounts: BuiltValueNullFieldError.checkNotNull(
            paymentAccounts,
            r'BranchDependencySummary',
            'paymentAccounts',
          ),
          classTypes: BuiltValueNullFieldError.checkNotNull(
            classTypes,
            r'BranchDependencySummary',
            'classTypes',
          ),
          staff: BuiltValueNullFieldError.checkNotNull(
            staff,
            r'BranchDependencySummary',
            'staff',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
