// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_list_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$UserListSummary extends UserListSummary {
  @override
  final int total;
  @override
  final int active;
  @override
  final int pendingActivation;
  @override
  final int inactive;

  factory _$UserListSummary([void Function(UserListSummaryBuilder)? updates]) =>
      (UserListSummaryBuilder()..update(updates))._build();

  _$UserListSummary._({
    required this.total,
    required this.active,
    required this.pendingActivation,
    required this.inactive,
  }) : super._();
  @override
  UserListSummary rebuild(void Function(UserListSummaryBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  UserListSummaryBuilder toBuilder() => UserListSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UserListSummary &&
        total == other.total &&
        active == other.active &&
        pendingActivation == other.pendingActivation &&
        inactive == other.inactive;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, total.hashCode);
    _$hash = $jc(_$hash, active.hashCode);
    _$hash = $jc(_$hash, pendingActivation.hashCode);
    _$hash = $jc(_$hash, inactive.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UserListSummary')
          ..add('total', total)
          ..add('active', active)
          ..add('pendingActivation', pendingActivation)
          ..add('inactive', inactive))
        .toString();
  }
}

class UserListSummaryBuilder
    implements Builder<UserListSummary, UserListSummaryBuilder> {
  _$UserListSummary? _$v;

  int? _total;
  int? get total => _$this._total;
  set total(int? total) => _$this._total = total;

  int? _active;
  int? get active => _$this._active;
  set active(int? active) => _$this._active = active;

  int? _pendingActivation;
  int? get pendingActivation => _$this._pendingActivation;
  set pendingActivation(int? pendingActivation) =>
      _$this._pendingActivation = pendingActivation;

  int? _inactive;
  int? get inactive => _$this._inactive;
  set inactive(int? inactive) => _$this._inactive = inactive;

  UserListSummaryBuilder() {
    UserListSummary._defaults(this);
  }

  UserListSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _total = $v.total;
      _active = $v.active;
      _pendingActivation = $v.pendingActivation;
      _inactive = $v.inactive;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UserListSummary other) {
    _$v = other as _$UserListSummary;
  }

  @override
  void update(void Function(UserListSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UserListSummary build() => _build();

  _$UserListSummary _build() {
    final _$result =
        _$v ??
        _$UserListSummary._(
          total: BuiltValueNullFieldError.checkNotNull(
            total,
            r'UserListSummary',
            'total',
          ),
          active: BuiltValueNullFieldError.checkNotNull(
            active,
            r'UserListSummary',
            'active',
          ),
          pendingActivation: BuiltValueNullFieldError.checkNotNull(
            pendingActivation,
            r'UserListSummary',
            'pendingActivation',
          ),
          inactive: BuiltValueNullFieldError.checkNotNull(
            inactive,
            r'UserListSummary',
            'inactive',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
