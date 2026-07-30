// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'branch_audit_activity.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BranchAuditActivity extends BranchAuditActivity {
  @override
  final String id;
  @override
  final String action;
  @override
  final String objectType;
  @override
  final DateTime occurredAt;

  factory _$BranchAuditActivity([
    void Function(BranchAuditActivityBuilder)? updates,
  ]) => (BranchAuditActivityBuilder()..update(updates))._build();

  _$BranchAuditActivity._({
    required this.id,
    required this.action,
    required this.objectType,
    required this.occurredAt,
  }) : super._();
  @override
  BranchAuditActivity rebuild(
    void Function(BranchAuditActivityBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  BranchAuditActivityBuilder toBuilder() =>
      BranchAuditActivityBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BranchAuditActivity &&
        id == other.id &&
        action == other.action &&
        objectType == other.objectType &&
        occurredAt == other.occurredAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, action.hashCode);
    _$hash = $jc(_$hash, objectType.hashCode);
    _$hash = $jc(_$hash, occurredAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'BranchAuditActivity')
          ..add('id', id)
          ..add('action', action)
          ..add('objectType', objectType)
          ..add('occurredAt', occurredAt))
        .toString();
  }
}

class BranchAuditActivityBuilder
    implements Builder<BranchAuditActivity, BranchAuditActivityBuilder> {
  _$BranchAuditActivity? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _action;
  String? get action => _$this._action;
  set action(String? action) => _$this._action = action;

  String? _objectType;
  String? get objectType => _$this._objectType;
  set objectType(String? objectType) => _$this._objectType = objectType;

  DateTime? _occurredAt;
  DateTime? get occurredAt => _$this._occurredAt;
  set occurredAt(DateTime? occurredAt) => _$this._occurredAt = occurredAt;

  BranchAuditActivityBuilder() {
    BranchAuditActivity._defaults(this);
  }

  BranchAuditActivityBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _action = $v.action;
      _objectType = $v.objectType;
      _occurredAt = $v.occurredAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BranchAuditActivity other) {
    _$v = other as _$BranchAuditActivity;
  }

  @override
  void update(void Function(BranchAuditActivityBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BranchAuditActivity build() => _build();

  _$BranchAuditActivity _build() {
    final _$result =
        _$v ??
        _$BranchAuditActivity._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'BranchAuditActivity',
            'id',
          ),
          action: BuiltValueNullFieldError.checkNotNull(
            action,
            r'BranchAuditActivity',
            'action',
          ),
          objectType: BuiltValueNullFieldError.checkNotNull(
            objectType,
            r'BranchAuditActivity',
            'objectType',
          ),
          occurredAt: BuiltValueNullFieldError.checkNotNull(
            occurredAt,
            r'BranchAuditActivity',
            'occurredAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
