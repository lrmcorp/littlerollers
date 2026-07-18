// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'time_range_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$TimeRangeCommand extends TimeRangeCommand {
  @override
  final String branchId;
  @override
  final DateTime startAt;
  @override
  final DateTime endAt;

  factory _$TimeRangeCommand([
    void Function(TimeRangeCommandBuilder)? updates,
  ]) => (TimeRangeCommandBuilder()..update(updates))._build();

  _$TimeRangeCommand._({
    required this.branchId,
    required this.startAt,
    required this.endAt,
  }) : super._();
  @override
  TimeRangeCommand rebuild(void Function(TimeRangeCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  TimeRangeCommandBuilder toBuilder() =>
      TimeRangeCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is TimeRangeCommand &&
        branchId == other.branchId &&
        startAt == other.startAt &&
        endAt == other.endAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, startAt.hashCode);
    _$hash = $jc(_$hash, endAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'TimeRangeCommand')
          ..add('branchId', branchId)
          ..add('startAt', startAt)
          ..add('endAt', endAt))
        .toString();
  }
}

class TimeRangeCommandBuilder
    implements Builder<TimeRangeCommand, TimeRangeCommandBuilder> {
  _$TimeRangeCommand? _$v;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  DateTime? _startAt;
  DateTime? get startAt => _$this._startAt;
  set startAt(DateTime? startAt) => _$this._startAt = startAt;

  DateTime? _endAt;
  DateTime? get endAt => _$this._endAt;
  set endAt(DateTime? endAt) => _$this._endAt = endAt;

  TimeRangeCommandBuilder() {
    TimeRangeCommand._defaults(this);
  }

  TimeRangeCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branchId = $v.branchId;
      _startAt = $v.startAt;
      _endAt = $v.endAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(TimeRangeCommand other) {
    _$v = other as _$TimeRangeCommand;
  }

  @override
  void update(void Function(TimeRangeCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  TimeRangeCommand build() => _build();

  _$TimeRangeCommand _build() {
    final _$result =
        _$v ??
        _$TimeRangeCommand._(
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'TimeRangeCommand',
            'branchId',
          ),
          startAt: BuiltValueNullFieldError.checkNotNull(
            startAt,
            r'TimeRangeCommand',
            'startAt',
          ),
          endAt: BuiltValueNullFieldError.checkNotNull(
            endAt,
            r'TimeRangeCommand',
            'endAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
