// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'enabled_status.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$EnabledStatus extends EnabledStatus {
  @override
  final JsonObject? status;

  factory _$EnabledStatus([void Function(EnabledStatusBuilder)? updates]) =>
      (EnabledStatusBuilder()..update(updates))._build();

  _$EnabledStatus._({this.status}) : super._();
  @override
  EnabledStatus rebuild(void Function(EnabledStatusBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  EnabledStatusBuilder toBuilder() => EnabledStatusBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is EnabledStatus && status == other.status;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
      r'EnabledStatus',
    )..add('status', status)).toString();
  }
}

class EnabledStatusBuilder
    implements Builder<EnabledStatus, EnabledStatusBuilder> {
  _$EnabledStatus? _$v;

  JsonObject? _status;
  JsonObject? get status => _$this._status;
  set status(JsonObject? status) => _$this._status = status;

  EnabledStatusBuilder() {
    EnabledStatus._defaults(this);
  }

  EnabledStatusBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _status = $v.status;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(EnabledStatus other) {
    _$v = other as _$EnabledStatus;
  }

  @override
  void update(void Function(EnabledStatusBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  EnabledStatus build() => _build();

  _$EnabledStatus _build() {
    final _$result = _$v ?? _$EnabledStatus._(status: status);
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
