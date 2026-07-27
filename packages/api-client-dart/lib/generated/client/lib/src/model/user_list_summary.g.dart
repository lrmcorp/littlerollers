// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_list_summary.dart';

class _$UserListSummary extends UserListSummary {
  @override final int total;
  @override final int active;
  @override final int pendingActivation;
  @override final int inactive;
  factory _$UserListSummary([void Function(UserListSummaryBuilder)? updates]) => (UserListSummaryBuilder()..update(updates))._build();
  _$UserListSummary._({required this.total, required this.active, required this.pendingActivation, required this.inactive}) : super._();
  @override UserListSummary rebuild(void Function(UserListSummaryBuilder) updates) => (toBuilder()..update(updates)).build();
  @override UserListSummaryBuilder toBuilder() => UserListSummaryBuilder()..replace(this);
  @override bool operator ==(Object other) => identical(other, this) || other is UserListSummary && total == other.total && active == other.active && pendingActivation == other.pendingActivation && inactive == other.inactive;
  @override int get hashCode => Object.hash(total, active, pendingActivation, inactive);
  @override String toString() => (newBuiltValueToStringHelper(r'UserListSummary')..add('total', total)..add('active', active)..add('pendingActivation', pendingActivation)..add('inactive', inactive)).toString();
}

class UserListSummaryBuilder implements Builder<UserListSummary, UserListSummaryBuilder> {
  _$UserListSummary? _$v;
  int? _total; int? get total => _$this._total; set total(int? value) => _$this._total = value;
  int? _active; int? get active => _$this._active; set active(int? value) => _$this._active = value;
  int? _pendingActivation; int? get pendingActivation => _$this._pendingActivation; set pendingActivation(int? value) => _$this._pendingActivation = value;
  int? _inactive; int? get inactive => _$this._inactive; set inactive(int? value) => _$this._inactive = value;
  UserListSummaryBuilder() { UserListSummary._defaults(this); }
  UserListSummaryBuilder get _$this { final value = _$v; if (value != null) { _total = value.total; _active = value.active; _pendingActivation = value.pendingActivation; _inactive = value.inactive; _$v = null; } return this; }
  @override void replace(UserListSummary other) { _$v = other as _$UserListSummary; }
  @override void update(void Function(UserListSummaryBuilder)? updates) { if (updates != null) updates(this); }
  @override UserListSummary build() => _build();
  _$UserListSummary _build() => _$v ?? _$UserListSummary._(total: BuiltValueNullFieldError.checkNotNull(total, r'UserListSummary', 'total'), active: BuiltValueNullFieldError.checkNotNull(active, r'UserListSummary', 'active'), pendingActivation: BuiltValueNullFieldError.checkNotNull(pendingActivation, r'UserListSummary', 'pendingActivation'), inactive: BuiltValueNullFieldError.checkNotNull(inactive, r'UserListSummary', 'inactive'));
}
