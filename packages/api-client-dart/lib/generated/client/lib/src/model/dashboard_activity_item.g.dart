// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dashboard_activity_item.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$DashboardActivityItem extends DashboardActivityItem {
  @override
  final String id;
  @override
  final DateTime occurredAt;
  @override
  final String action;
  @override
  final String objectType;
  @override
  final String? branchId;
  @override
  final String? actorId;

  factory _$DashboardActivityItem([
    void Function(DashboardActivityItemBuilder)? updates,
  ]) => (DashboardActivityItemBuilder()..update(updates))._build();

  _$DashboardActivityItem._({
    required this.id,
    required this.occurredAt,
    required this.action,
    required this.objectType,
    this.branchId,
    this.actorId,
  }) : super._();
  @override
  DashboardActivityItem rebuild(
    void Function(DashboardActivityItemBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  DashboardActivityItemBuilder toBuilder() =>
      DashboardActivityItemBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DashboardActivityItem &&
        id == other.id &&
        occurredAt == other.occurredAt &&
        action == other.action &&
        objectType == other.objectType &&
        branchId == other.branchId &&
        actorId == other.actorId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, occurredAt.hashCode);
    _$hash = $jc(_$hash, action.hashCode);
    _$hash = $jc(_$hash, objectType.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, actorId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'DashboardActivityItem')
          ..add('id', id)
          ..add('occurredAt', occurredAt)
          ..add('action', action)
          ..add('objectType', objectType)
          ..add('branchId', branchId)
          ..add('actorId', actorId))
        .toString();
  }
}

class DashboardActivityItemBuilder
    implements Builder<DashboardActivityItem, DashboardActivityItemBuilder> {
  _$DashboardActivityItem? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  DateTime? _occurredAt;
  DateTime? get occurredAt => _$this._occurredAt;
  set occurredAt(DateTime? occurredAt) => _$this._occurredAt = occurredAt;

  String? _action;
  String? get action => _$this._action;
  set action(String? action) => _$this._action = action;

  String? _objectType;
  String? get objectType => _$this._objectType;
  set objectType(String? objectType) => _$this._objectType = objectType;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _actorId;
  String? get actorId => _$this._actorId;
  set actorId(String? actorId) => _$this._actorId = actorId;

  DashboardActivityItemBuilder() {
    DashboardActivityItem._defaults(this);
  }

  DashboardActivityItemBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _occurredAt = $v.occurredAt;
      _action = $v.action;
      _objectType = $v.objectType;
      _branchId = $v.branchId;
      _actorId = $v.actorId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DashboardActivityItem other) {
    _$v = other as _$DashboardActivityItem;
  }

  @override
  void update(void Function(DashboardActivityItemBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  DashboardActivityItem build() => _build();

  _$DashboardActivityItem _build() {
    final _$result =
        _$v ??
        _$DashboardActivityItem._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'DashboardActivityItem',
            'id',
          ),
          occurredAt: BuiltValueNullFieldError.checkNotNull(
            occurredAt,
            r'DashboardActivityItem',
            'occurredAt',
          ),
          action: BuiltValueNullFieldError.checkNotNull(
            action,
            r'DashboardActivityItem',
            'action',
          ),
          objectType: BuiltValueNullFieldError.checkNotNull(
            objectType,
            r'DashboardActivityItem',
            'objectType',
          ),
          branchId: branchId,
          actorId: actorId,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
