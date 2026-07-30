// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'class_slot_update_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ClassSlotUpdateCommand extends ClassSlotUpdateCommand {
  @override
  final String classTypeId;
  @override
  final String? instructorUserId;
  @override
  final DateTime startAt;
  @override
  final DateTime endAt;
  @override
  final int expectedVersion;
  @override
  final String reason;

  factory _$ClassSlotUpdateCommand([
    void Function(ClassSlotUpdateCommandBuilder)? updates,
  ]) => (ClassSlotUpdateCommandBuilder()..update(updates))._build();

  _$ClassSlotUpdateCommand._({
    required this.classTypeId,
    this.instructorUserId,
    required this.startAt,
    required this.endAt,
    required this.expectedVersion,
    required this.reason,
  }) : super._();
  @override
  ClassSlotUpdateCommand rebuild(
    void Function(ClassSlotUpdateCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  ClassSlotUpdateCommandBuilder toBuilder() =>
      ClassSlotUpdateCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ClassSlotUpdateCommand &&
        classTypeId == other.classTypeId &&
        instructorUserId == other.instructorUserId &&
        startAt == other.startAt &&
        endAt == other.endAt &&
        expectedVersion == other.expectedVersion &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, classTypeId.hashCode);
    _$hash = $jc(_$hash, instructorUserId.hashCode);
    _$hash = $jc(_$hash, startAt.hashCode);
    _$hash = $jc(_$hash, endAt.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ClassSlotUpdateCommand')
          ..add('classTypeId', classTypeId)
          ..add('instructorUserId', instructorUserId)
          ..add('startAt', startAt)
          ..add('endAt', endAt)
          ..add('expectedVersion', expectedVersion)
          ..add('reason', reason))
        .toString();
  }
}

class ClassSlotUpdateCommandBuilder
    implements Builder<ClassSlotUpdateCommand, ClassSlotUpdateCommandBuilder> {
  _$ClassSlotUpdateCommand? _$v;

  String? _classTypeId;
  String? get classTypeId => _$this._classTypeId;
  set classTypeId(String? classTypeId) => _$this._classTypeId = classTypeId;

  String? _instructorUserId;
  String? get instructorUserId => _$this._instructorUserId;
  set instructorUserId(String? instructorUserId) =>
      _$this._instructorUserId = instructorUserId;

  DateTime? _startAt;
  DateTime? get startAt => _$this._startAt;
  set startAt(DateTime? startAt) => _$this._startAt = startAt;

  DateTime? _endAt;
  DateTime? get endAt => _$this._endAt;
  set endAt(DateTime? endAt) => _$this._endAt = endAt;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  ClassSlotUpdateCommandBuilder() {
    ClassSlotUpdateCommand._defaults(this);
  }

  ClassSlotUpdateCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _classTypeId = $v.classTypeId;
      _instructorUserId = $v.instructorUserId;
      _startAt = $v.startAt;
      _endAt = $v.endAt;
      _expectedVersion = $v.expectedVersion;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ClassSlotUpdateCommand other) {
    _$v = other as _$ClassSlotUpdateCommand;
  }

  @override
  void update(void Function(ClassSlotUpdateCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ClassSlotUpdateCommand build() => _build();

  _$ClassSlotUpdateCommand _build() {
    final _$result =
        _$v ??
        _$ClassSlotUpdateCommand._(
          classTypeId: BuiltValueNullFieldError.checkNotNull(
            classTypeId,
            r'ClassSlotUpdateCommand',
            'classTypeId',
          ),
          instructorUserId: instructorUserId,
          startAt: BuiltValueNullFieldError.checkNotNull(
            startAt,
            r'ClassSlotUpdateCommand',
            'startAt',
          ),
          endAt: BuiltValueNullFieldError.checkNotNull(
            endAt,
            r'ClassSlotUpdateCommand',
            'endAt',
          ),
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'ClassSlotUpdateCommand',
            'expectedVersion',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'ClassSlotUpdateCommand',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
