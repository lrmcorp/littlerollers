// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'safe_audit_activity.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SafeAuditActivity extends SafeAuditActivity {
  @override
  final String id;
  @override
  final String action;
  @override
  final DateTime occurredAt;

  factory _$SafeAuditActivity([
    void Function(SafeAuditActivityBuilder)? updates,
  ]) => (SafeAuditActivityBuilder()..update(updates))._build();

  _$SafeAuditActivity._({
    required this.id,
    required this.action,
    required this.occurredAt,
  }) : super._();
  @override
  SafeAuditActivity rebuild(void Function(SafeAuditActivityBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SafeAuditActivityBuilder toBuilder() =>
      SafeAuditActivityBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SafeAuditActivity &&
        id == other.id &&
        action == other.action &&
        occurredAt == other.occurredAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, action.hashCode);
    _$hash = $jc(_$hash, occurredAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SafeAuditActivity')
          ..add('id', id)
          ..add('action', action)
          ..add('occurredAt', occurredAt))
        .toString();
  }
}

class SafeAuditActivityBuilder
    implements Builder<SafeAuditActivity, SafeAuditActivityBuilder> {
  _$SafeAuditActivity? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _action;
  String? get action => _$this._action;
  set action(String? action) => _$this._action = action;

  DateTime? _occurredAt;
  DateTime? get occurredAt => _$this._occurredAt;
  set occurredAt(DateTime? occurredAt) => _$this._occurredAt = occurredAt;

  SafeAuditActivityBuilder() {
    SafeAuditActivity._defaults(this);
  }

  SafeAuditActivityBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _action = $v.action;
      _occurredAt = $v.occurredAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SafeAuditActivity other) {
    _$v = other as _$SafeAuditActivity;
  }

  @override
  void update(void Function(SafeAuditActivityBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SafeAuditActivity build() => _build();

  _$SafeAuditActivity _build() {
    final _$result =
        _$v ??
        _$SafeAuditActivity._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'SafeAuditActivity',
            'id',
          ),
          action: BuiltValueNullFieldError.checkNotNull(
            action,
            r'SafeAuditActivity',
            'action',
          ),
          occurredAt: BuiltValueNullFieldError.checkNotNull(
            occurredAt,
            r'SafeAuditActivity',
            'occurredAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
