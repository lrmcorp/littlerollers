// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'accepted_status.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AcceptedStatus extends AcceptedStatus {
  @override
  final JsonObject? status;

  factory _$AcceptedStatus([void Function(AcceptedStatusBuilder)? updates]) =>
      (AcceptedStatusBuilder()..update(updates))._build();

  _$AcceptedStatus._({this.status}) : super._();
  @override
  AcceptedStatus rebuild(void Function(AcceptedStatusBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AcceptedStatusBuilder toBuilder() => AcceptedStatusBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AcceptedStatus && status == other.status;
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
      r'AcceptedStatus',
    )..add('status', status)).toString();
  }
}

class AcceptedStatusBuilder
    implements Builder<AcceptedStatus, AcceptedStatusBuilder> {
  _$AcceptedStatus? _$v;

  JsonObject? _status;
  JsonObject? get status => _$this._status;
  set status(JsonObject? status) => _$this._status = status;

  AcceptedStatusBuilder() {
    AcceptedStatus._defaults(this);
  }

  AcceptedStatusBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _status = $v.status;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AcceptedStatus other) {
    _$v = other as _$AcceptedStatus;
  }

  @override
  void update(void Function(AcceptedStatusBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AcceptedStatus build() => _build();

  _$AcceptedStatus _build() {
    final _$result = _$v ?? _$AcceptedStatus._(status: status);
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
