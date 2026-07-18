// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'action_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ActionCommand extends ActionCommand {
  @override
  final String? instructorUserId;
  @override
  final String? reason;
  @override
  final int? expectedVersion;

  factory _$ActionCommand([void Function(ActionCommandBuilder)? updates]) =>
      (ActionCommandBuilder()..update(updates))._build();

  _$ActionCommand._({this.instructorUserId, this.reason, this.expectedVersion})
    : super._();
  @override
  ActionCommand rebuild(void Function(ActionCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ActionCommandBuilder toBuilder() => ActionCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ActionCommand &&
        instructorUserId == other.instructorUserId &&
        reason == other.reason &&
        expectedVersion == other.expectedVersion;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, instructorUserId.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ActionCommand')
          ..add('instructorUserId', instructorUserId)
          ..add('reason', reason)
          ..add('expectedVersion', expectedVersion))
        .toString();
  }
}

class ActionCommandBuilder
    implements Builder<ActionCommand, ActionCommandBuilder> {
  _$ActionCommand? _$v;

  String? _instructorUserId;
  String? get instructorUserId => _$this._instructorUserId;
  set instructorUserId(String? instructorUserId) =>
      _$this._instructorUserId = instructorUserId;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  ActionCommandBuilder() {
    ActionCommand._defaults(this);
  }

  ActionCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _instructorUserId = $v.instructorUserId;
      _reason = $v.reason;
      _expectedVersion = $v.expectedVersion;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ActionCommand other) {
    _$v = other as _$ActionCommand;
  }

  @override
  void update(void Function(ActionCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ActionCommand build() => _build();

  _$ActionCommand _build() {
    final _$result =
        _$v ??
        _$ActionCommand._(
          instructorUserId: instructorUserId,
          reason: reason,
          expectedVersion: expectedVersion,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
