// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'changed_status.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ChangedStatus extends ChangedStatus {
  @override
  final JsonObject? status;

  factory _$ChangedStatus([void Function(ChangedStatusBuilder)? updates]) =>
      (ChangedStatusBuilder()..update(updates))._build();

  _$ChangedStatus._({this.status}) : super._();
  @override
  ChangedStatus rebuild(void Function(ChangedStatusBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ChangedStatusBuilder toBuilder() => ChangedStatusBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ChangedStatus && status == other.status;
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
      r'ChangedStatus',
    )..add('status', status)).toString();
  }
}

class ChangedStatusBuilder
    implements Builder<ChangedStatus, ChangedStatusBuilder> {
  _$ChangedStatus? _$v;

  JsonObject? _status;
  JsonObject? get status => _$this._status;
  set status(JsonObject? status) => _$this._status = status;

  ChangedStatusBuilder() {
    ChangedStatus._defaults(this);
  }

  ChangedStatusBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _status = $v.status;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ChangedStatus other) {
    _$v = other as _$ChangedStatus;
  }

  @override
  void update(void Function(ChangedStatusBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ChangedStatus build() => _build();

  _$ChangedStatus _build() {
    final _$result = _$v ?? _$ChangedStatus._(status: status);
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
