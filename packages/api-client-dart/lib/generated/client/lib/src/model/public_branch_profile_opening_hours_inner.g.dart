// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_branch_profile_opening_hours_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PublicBranchProfileOpeningHoursInner
    extends PublicBranchProfileOpeningHoursInner {
  @override
  final String days;
  @override
  final String hours;

  factory _$PublicBranchProfileOpeningHoursInner([
    void Function(PublicBranchProfileOpeningHoursInnerBuilder)? updates,
  ]) =>
      (PublicBranchProfileOpeningHoursInnerBuilder()..update(updates))._build();

  _$PublicBranchProfileOpeningHoursInner._({
    required this.days,
    required this.hours,
  }) : super._();
  @override
  PublicBranchProfileOpeningHoursInner rebuild(
    void Function(PublicBranchProfileOpeningHoursInnerBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PublicBranchProfileOpeningHoursInnerBuilder toBuilder() =>
      PublicBranchProfileOpeningHoursInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PublicBranchProfileOpeningHoursInner &&
        days == other.days &&
        hours == other.hours;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, days.hashCode);
    _$hash = $jc(_$hash, hours.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PublicBranchProfileOpeningHoursInner')
          ..add('days', days)
          ..add('hours', hours))
        .toString();
  }
}

class PublicBranchProfileOpeningHoursInnerBuilder
    implements
        Builder<
          PublicBranchProfileOpeningHoursInner,
          PublicBranchProfileOpeningHoursInnerBuilder
        > {
  _$PublicBranchProfileOpeningHoursInner? _$v;

  String? _days;
  String? get days => _$this._days;
  set days(String? days) => _$this._days = days;

  String? _hours;
  String? get hours => _$this._hours;
  set hours(String? hours) => _$this._hours = hours;

  PublicBranchProfileOpeningHoursInnerBuilder() {
    PublicBranchProfileOpeningHoursInner._defaults(this);
  }

  PublicBranchProfileOpeningHoursInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _days = $v.days;
      _hours = $v.hours;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PublicBranchProfileOpeningHoursInner other) {
    _$v = other as _$PublicBranchProfileOpeningHoursInner;
  }

  @override
  void update(
    void Function(PublicBranchProfileOpeningHoursInnerBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  PublicBranchProfileOpeningHoursInner build() => _build();

  _$PublicBranchProfileOpeningHoursInner _build() {
    final _$result =
        _$v ??
        _$PublicBranchProfileOpeningHoursInner._(
          days: BuiltValueNullFieldError.checkNotNull(
            days,
            r'PublicBranchProfileOpeningHoursInner',
            'days',
          ),
          hours: BuiltValueNullFieldError.checkNotNull(
            hours,
            r'PublicBranchProfileOpeningHoursInner',
            'hours',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
