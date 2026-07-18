// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reschedule_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RescheduleCommand extends RescheduleCommand {
  @override
  final String bookingId;
  @override
  final String targetClassSlotId;
  @override
  final String reason;

  factory _$RescheduleCommand([
    void Function(RescheduleCommandBuilder)? updates,
  ]) => (RescheduleCommandBuilder()..update(updates))._build();

  _$RescheduleCommand._({
    required this.bookingId,
    required this.targetClassSlotId,
    required this.reason,
  }) : super._();
  @override
  RescheduleCommand rebuild(void Function(RescheduleCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RescheduleCommandBuilder toBuilder() =>
      RescheduleCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RescheduleCommand &&
        bookingId == other.bookingId &&
        targetClassSlotId == other.targetClassSlotId &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, bookingId.hashCode);
    _$hash = $jc(_$hash, targetClassSlotId.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RescheduleCommand')
          ..add('bookingId', bookingId)
          ..add('targetClassSlotId', targetClassSlotId)
          ..add('reason', reason))
        .toString();
  }
}

class RescheduleCommandBuilder
    implements Builder<RescheduleCommand, RescheduleCommandBuilder> {
  _$RescheduleCommand? _$v;

  String? _bookingId;
  String? get bookingId => _$this._bookingId;
  set bookingId(String? bookingId) => _$this._bookingId = bookingId;

  String? _targetClassSlotId;
  String? get targetClassSlotId => _$this._targetClassSlotId;
  set targetClassSlotId(String? targetClassSlotId) =>
      _$this._targetClassSlotId = targetClassSlotId;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  RescheduleCommandBuilder() {
    RescheduleCommand._defaults(this);
  }

  RescheduleCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _bookingId = $v.bookingId;
      _targetClassSlotId = $v.targetClassSlotId;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RescheduleCommand other) {
    _$v = other as _$RescheduleCommand;
  }

  @override
  void update(void Function(RescheduleCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RescheduleCommand build() => _build();

  _$RescheduleCommand _build() {
    final _$result =
        _$v ??
        _$RescheduleCommand._(
          bookingId: BuiltValueNullFieldError.checkNotNull(
            bookingId,
            r'RescheduleCommand',
            'bookingId',
          ),
          targetClassSlotId: BuiltValueNullFieldError.checkNotNull(
            targetClassSlotId,
            r'RescheduleCommand',
            'targetClassSlotId',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'RescheduleCommand',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
